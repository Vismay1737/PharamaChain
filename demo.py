"""
PharmaChain Interactive CLI Demo
================================
Automatically seeds the database, runs a simulated IoT stream,
triggers a forced anomaly, and prints a complete operational report.

Usage:
    python demo.py
"""

import sys
import os
import json
import time
import random
import threading
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Ensure project root on path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

# ── Colour Helpers ────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
CYAN   = "\033[96m"
YELLOW = "\033[93m"
WHITE  = "\033[97m"
DIM    = "\033[2m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

# ── Report Collector ──────────────────────────────────────────────────────
demo_events = []

def log_event(category, message, data=None):
    ts = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]
    demo_events.append({
        "time": ts,
        "category": category,
        "message": message,
        "data": data
    })
    
    colour_map = {
        "SENSOR": CYAN,
        "ANOMALY": RED,
        "BLOCKCHAIN": YELLOW,
        "ALERT": RED,
        "SYSTEM": GREEN,
        "AI": WHITE,
    }
    colour = colour_map.get(category, RESET)
    print(f"  {DIM}{ts}{RESET}  [{colour}{BOLD}{category:12s}{RESET}]  {message}")


# ── Mock Blockchain ───────────────────────────────────────────────────────
def make_mock_bc():
    mock = MagicMock()
    tx_counter = [1000]
    
    def fake_register(batch_id, drug_name, mfg):
        tx_counter[0] += 1
        tx_hash = f"0x{tx_counter[0]:064x}"
        log_event("BLOCKCHAIN", f"⛓️  Batch {batch_id} minted → {tx_hash[:18]}...", {"tx_hash": tx_hash})
        return tx_hash
    
    def fake_anomaly(batch_id, anomaly_type, severity, cause):
        tx_counter[0] += 1
        tx_hash = f"0x{tx_counter[0]:064x}"
        log_event("BLOCKCHAIN", f"🚨 Anomaly flagged on-chain for {batch_id} → {tx_hash[:18]}...", {"tx_hash": tx_hash})
        return tx_hash
    
    mock.register_batch.side_effect = fake_register
    mock.record_anomaly.side_effect = fake_anomaly
    mock.get_batch_history.return_value = []
    mock.is_connected.return_value = True
    return mock


# ── Simulated Gemini AI ──────────────────────────────────────────────────
def mock_gemini_analyze(sensor_data, batch_info, history=None):
    temp = sensor_data.get('temperature', 5.0)
    seal = sensor_data.get('seal_intact', True)
    
    is_anomaly = temp < 2.0 or temp > 8.0 or not seal
    
    if is_anomaly:
        anomaly_type = "TEMPERATURE_BREACH" if (temp < 2.0 or temp > 8.0) else "SEAL_BREACH"
        result = {
            "is_anomaly": True,
            "anomaly_score": min(1.0, abs(temp - 5.0) / 10.0),
            "anomaly_type": anomaly_type,
            "severity": "HIGH" if abs(temp - 5.0) > 3.0 else "MEDIUM",
            "root_cause": f"Temperature excursion detected: {temp}°C exceeds cold-chain threshold (2-8°C)",
            "recommendation": "Immediately quarantine batch and initiate stability assessment",
            "risk_to_patients": "Potential degradation of pharmaceutical compound integrity",
            "confidence": 0.94,
            "full_report": f"[GEMINI-FLASH] Batch {batch_info.get('batch_id')} flagged. Temp: {temp}°C."
        }
        log_event("AI", f"🧠 Gemini detected {anomaly_type}: {temp}°C → severity={result['severity']}")
        return result
    
    return {
        "is_anomaly": False,
        "anomaly_score": 0.05,
        "anomaly_type": "NONE",
        "severity": "NONE",
        "root_cause": "All readings within acceptable operational parameters",
        "confidence": 0.98
    }


# ── Main Demo ─────────────────────────────────────────────────────────────
def run_demo():
    print(f"""
{CYAN}{BOLD}╔══════════════════════════════════════════════════════════════╗
║            PharmaChain Interactive CLI Demo                  ║
║          IoT · Gemini AI · Blockchain · Real-time            ║
╚══════════════════════════════════════════════════════════════╝{RESET}
""")

    # ── Patch external services ───────────────────────────────────────
    mock_bc = make_mock_bc()
    
    with patch('backend.services.blockchain_service.BlockchainService', return_value=mock_bc), \
         patch('backend.services.mqtt_service.start_mqtt_service', return_value=None):

        from backend.app import create_app, db

        app = create_app()
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['TESTING'] = True

        with app.app_context():
            db.create_all()
            client = app.test_client()

            # ── Phase 1: Bootstrap Users & Batches ────────────────────
            log_event("SYSTEM", "Initializing PharmaChain demo environment...")

            # Register manufacturer
            client.post('/api/auth/register', json={
                "username": "demo_manufacturer",
                "password": "pharma123",
                "role": "MANUFACTURER"
            })
            resp = client.post('/api/auth/login', json={
                "username": "demo_manufacturer",
                "password": "pharma123"
            })
            token = resp.get_json()['access_token']
            headers = {"Authorization": f"Bearer {token}"}

            log_event("SYSTEM", f"✅ Manufacturer 'demo_manufacturer' authenticated")

            # Register 5 test batches
            test_batches = [
                {"batch_id": "PC-2847", "drug_name": "Covaxin"},
                {"batch_id": "PC-2601", "drug_name": "Remdesivir"},
                {"batch_id": "PC-2901", "drug_name": "Insulin Glargine"},
                {"batch_id": "PC-3101", "drug_name": "Amoxicillin"},
                {"batch_id": "PC-3201", "drug_name": "Paracetamol IV"},
            ]

            for b in test_batches:
                resp = client.post('/api/batches/', json={
                    "batch_id": b["batch_id"],
                    "drug_name": b["drug_name"],
                    "expiry_date": (datetime.utcnow() + timedelta(days=365)).isoformat(),
                    "quantity": random.randint(100, 1000)
                }, headers=headers)
                status = "✅" if resp.status_code == 201 else "❌"
                log_event("SYSTEM", f"{status} Batch {b['batch_id']} ({b['drug_name']}) registered")

            print(f"\n{BOLD}{'─' * 66}{RESET}")
            print(f"{BOLD}  Phase 2: IoT Sensor Simulation (30 seconds){RESET}")
            print(f"{BOLD}{'─' * 66}{RESET}\n")

            # ── Phase 2: IoT Simulation ───────────────────────────────
            from backend.models.drug_batch import DrugBatch
            from backend.models.sensor_log import SensorLog
            from backend.models.alert import Alert

            anomaly_triggered = False
            readings_count = 0
            anomalies_count = 0
            start_time = time.time()
            duration = 30  # seconds

            while time.time() - start_time < duration:
                elapsed = time.time() - start_time
                remaining = max(0, duration - elapsed)
                
                for b in test_batches:
                    batch = DrugBatch.query.filter_by(batch_id=b["batch_id"]).first()
                    if not batch:
                        continue

                    # Generate sensor reading
                    # Force anomaly on PC-2847 at ~15 seconds
                    if b["batch_id"] == "PC-2847" and 14 <= elapsed <= 16 and not anomaly_triggered:
                        temperature = 9.5
                        anomaly_triggered = True
                        log_event("ANOMALY", f"⚠️  FORCED ANOMALY on {b['batch_id']}: temp=9.5°C")
                    else:
                        temperature = round(random.uniform(3.0, 7.5), 2)

                    humidity = round(random.uniform(62.0, 73.0), 2)
                    lat = 19.076 + random.uniform(-0.01, 0.01)
                    lon = 72.877 + random.uniform(-0.01, 0.01)

                    sensor_data = {
                        "batch_id": b["batch_id"],
                        "temperature": temperature,
                        "humidity": humidity,
                        "latitude": lat,
                        "longitude": lon,
                        "seal_intact": True,
                        "timestamp": time.time()
                    }

                    batch_info = {
                        "batch_id": b["batch_id"],
                        "drug_name": b["drug_name"],
                        "manufacturer": "demo_manufacturer"
                    }

                    # Run through simulated AI analysis
                    analysis = mock_gemini_analyze(sensor_data, batch_info)

                    log = SensorLog(
                        batch_uuid=batch.id,
                        temperature=temperature,
                        humidity=humidity,
                        latitude=lat,
                        longitude=lon,
                        seal_intact=True,
                        is_anomaly=analysis.get('is_anomaly', False),
                        anomaly_score=analysis.get('anomaly_score', 0.0),
                        gemini_analysis=analysis.get('full_report', None)
                    )
                    db.session.add(log)
                    readings_count += 1

                    if analysis.get('is_anomaly'):
                        anomalies_count += 1
                        batch.status = "FLAGGED"
                        tx_hash = mock_bc.record_anomaly(
                            b["batch_id"],
                            analysis['anomaly_type'],
                            analysis['severity'],
                            analysis['root_cause']
                        )
                        batch.blockchain_tx_hash = tx_hash

                        alert = Alert(
                            batch_uuid=batch.id,
                            anomaly_type=analysis['anomaly_type'],
                            severity=analysis['severity'],
                            root_cause=analysis['root_cause'],
                            gemini_analysis=analysis.get('full_report', '')
                        )
                        db.session.add(alert)
                    else:
                        log_event("SENSOR", f"📡 {b['batch_id']}: {temperature}°C, {humidity}% RH — OK")

                db.session.commit()
                time.sleep(3)

            # ── Phase 3: Summary Report ───────────────────────────────
            total_batches = DrugBatch.query.count()
            flagged = DrugBatch.query.filter_by(status='FLAGGED').count()
            total_logs = SensorLog.query.count()
            total_anomalies = SensorLog.query.filter_by(is_anomaly=True).count()
            total_alerts = Alert.query.count()

            # Verify PC-2847 is flagged
            pc2847 = DrugBatch.query.filter_by(batch_id="PC-2847").first()
            pc2847_status = pc2847.status if pc2847 else "NOT FOUND"

            print(f"""
{CYAN}{BOLD}╔══════════════════════════════════════════════════════════════╗
║                    DEMO SUMMARY REPORT                       ║
╚══════════════════════════════════════════════════════════════╝{RESET}

  {BOLD}Infrastructure{RESET}
  ├── Registered Batches     : {GREEN}{total_batches}{RESET}
  ├── Total Sensor Readings  : {GREEN}{total_logs}{RESET}
  ├── Anomalies Detected     : {RED if total_anomalies > 0 else GREEN}{total_anomalies}{RESET}
  └── AI Alerts Generated    : {RED if total_alerts > 0 else GREEN}{total_alerts}{RESET}

  {BOLD}Batch Status{RESET}
  ├── Active                 : {GREEN}{total_batches - flagged}{RESET}
  └── Flagged (AI-triggered) : {RED if flagged > 0 else GREEN}{flagged}{RESET}

  {BOLD}Target Batch PC-2847{RESET}
  ├── Status                 : {RED if pc2847_status == 'FLAGGED' else GREEN}{pc2847_status}{RESET}
  └── Blockchain TX          : {YELLOW}{pc2847.blockchain_tx_hash[:24] + '...' if pc2847 and pc2847.blockchain_tx_hash else 'NONE'}{RESET}

  {BOLD}Blockchain Transactions{RESET}
  ├── Batch Registrations    : {mock_bc.register_batch.call_count}
  └── Anomaly Flags          : {mock_bc.record_anomaly.call_count}

  {BOLD}Timeline{RESET}
  ├── Total Events Logged    : {len(demo_events)}
  └── Duration               : {int(time.time() - start_time)}s

{BOLD}{'─' * 66}{RESET}
  Result: {GREEN if pc2847_status == 'FLAGGED' else RED}{BOLD}{'DEMO SUCCESSFUL ✓' if pc2847_status == 'FLAGGED' else 'DEMO INCOMPLETE ✗'}{RESET}
{BOLD}{'─' * 66}{RESET}
""")


if __name__ == "__main__":
    run_demo()
