import paho.mqtt.client as mqtt
import json
import threading
import logging
from datetime import datetime
from flask import current_app
from ..models.drug_batch import DrugBatch
from ..models.sensor_log import SensorLog
from .gemini_service import GeminiAnomalyDetector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MQTTService:
    def __init__(self, app):
        self.app = app
        try:
            self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
        except AttributeError:
            # paho-mqtt < 2.0 fallback
            self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        
        # Initialize Gemini Detector
        with self.app.app_context():
            self.detector = GeminiAnomalyDetector()
        
        # Exponential backoff: min 1s, max 120s
        self.client.reconnect_delay_set(min_delay=1, max_delay=120)
        
        self.host = app.config.get('MQTT_BROKER_HOST', 'localhost')
        self.port = app.config.get('MQTT_BROKER_PORT', 1883)
        self._stop_event = threading.Event()

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info(f"Connected to MQTT broker at {self.host}:{self.port}")
            client.subscribe("pharmachain/sensors/#")
        else:
            logger.error(f"Failed to connect to MQTT broker, return code {rc}")

    def on_disconnect(self, client, userdata, rc):
        if rc != 0:
            logger.warning("Unexpected disconnection from MQTT broker. Reconnecting...")

    def on_message(self, client, userdata, msg):
        with self.app.app_context():
            from ..app import db, socketio
            try:
                data = json.loads(msg.payload.decode())
                batch_id = data.get('batch_id')
                
                # Find the drug batch
                batch = DrugBatch.query.filter_by(batch_id=batch_id).first()
                if not batch:
                    logger.warning(f"Batch {batch_id} not found in database. Skipping log.")
                    return

                # Get historical context for Gemini (last 5 readings)
                recent_readings = SensorLog.query.filter_by(batch_uuid=batch.id).order_by(SensorLog.timestamp.desc()).limit(5).all()
                history = [r.to_dict() for r in recent_readings]

                # Run AI Anomaly Detection
                batch_info = {
                    "batch_id": batch.batch_id,
                    "drug_name": batch.drug_name,
                    "manufacturer": batch.manufacturer
                }
                
                analysis = self.detector.analyze_sensor_reading(data, batch_info, history)
                
                # Update sensor log with detailed AI analysis
                log = SensorLog(
                    batch_uuid=batch.id,
                    temperature=data['temperature'],
                    humidity=data['humidity'],
                    latitude=data['latitude'],
                    longitude=data['longitude'],
                    seal_intact=data['seal_intact'],
                    timestamp=datetime.fromtimestamp(data['timestamp']),
                    is_anomaly=analysis.get('is_anomaly', False),
                    anomaly_score=analysis.get('anomaly_score', 0.0),
                    gemini_analysis=analysis.get('full_report', analysis.get('root_cause', 'AI analysis failed'))
                )

                # Update batch status and create Alert if anomaly detected
                if analysis.get('is_anomaly'):
                    logger.warning(f"AI confirmed anomaly for batch {batch_id}: {analysis.get('anomaly_type')}")
                    batch.status = "FLAGGED"
                    
                    # Create persistent alert record
                    from ..models.alert import Alert
                    alert = Alert(
                        batch_uuid=batch.id,
                        anomaly_type=analysis.get('anomaly_type', 'GENERAL_ANOMALY'),
                        severity=analysis.get('severity', 'MEDIUM'),
                        root_cause=analysis.get('root_cause', 'AI detected anomaly'),
                        gemini_analysis=analysis.get('full_report', analysis.get('root_cause', ''))
                    )
                    db.session.add(alert)
                    
                    # On-chain auditing
                    from ..services.blockchain_service import BlockchainService
                    bs = BlockchainService()
                    tx_hash = bs.record_anomaly(
                        batch_id, 
                        analysis.get('anomaly_type', 'GENERAL_ANOMALY'),
                        analysis.get('severity', 'MEDIUM'),
                        analysis.get('root_cause', 'AI detected anomaly')
                    )
                    if tx_hash:
                        batch.blockchain_tx_hash = tx_hash

                    if analysis.get('severity') == 'CRITICAL':
                        batch.status = "RECALLED"
                    else:
                        batch.status = "FLAGGED"

                db.session.add(log)
                db.session.commit()

                # Emit real-time update
                socketio.emit('sensor_update', data)
                
            except Exception as e:
                db.session.rollback()
                logger.error(f"Error processing MQTT message: {e}")

    def start(self):
        try:
            logger.info("Starting MQTT loop...")
            self.client.connect(self.host, self.port, 60)
            self.client.loop_forever()  # Blocks the daemon thread properly
        except Exception as e:
            logger.error(f"Could not connect to MQTT broker: {e}")

    def stop(self):
        logger.info("Stopping MQTT service...")
        self.client.loop_stop()
        self.client.disconnect()

def start_mqtt_service(app):
    mqtt_service = MQTTService(app)
    thread = threading.Thread(target=mqtt_service.start)
    thread.daemon = True
    thread.start()
    return mqtt_service
