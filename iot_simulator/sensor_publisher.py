import paho.mqtt.client as mqtt
import json
import time
import random
import os
import math
from dotenv import load_dotenv

# Load configuration
load_dotenv()

class SimulatedBatch:
    def __init__(self, batch_id):
        self.batch_id = batch_id
        # Start in Mumbai
        self.lat = 19.0760
        self.lon = 72.8777
        self.target_lat = 28.6139 # Delhi
        self.target_lon = 77.2090 # Delhi
        self.seal_intact = True
        self.seq = 0
        self.arrived = False
        
        # Incremental steps (approx 1000 steps for the route)
        self.lat_step = (self.target_lat - self.lat) / 1000
        self.lon_step = (self.target_lon - self.lon) / 1000

    def generate_reading(self):
        self.seq += 1
        
        if not self.arrived:
            # Normal movement with slight noise
            self.lat += self.lat_step + random.uniform(-0.001, 0.001)
            self.lon += self.lon_step + random.uniform(-0.001, 0.001)
            
            # Check for arrival (within ~5km)
            dist = math.sqrt((self.lat - self.target_lat)**2 + (self.lon - self.target_lon)**2)
            if dist < 0.05:
                print(f"Batch {self.batch_id} has arrived in Delhi!")
                self.arrived = True
                self.lat, self.lon = self.target_lat, self.target_lon
        else:
            # Slight vibration noise while parked
            self.lat += random.uniform(-0.0001, 0.0001)
            self.lon += random.uniform(-0.0001, 0.0001)

        # 10% chance of temperature anomaly
        if random.random() < 0.10:
            temperature = round(random.uniform(8.5, 12.0), 2)
        else:
            temperature = round(random.uniform(2.0, 8.0), 2)

        # Normal humidity
        humidity = round(random.uniform(60.0, 75.0), 2)

        # 2% chance of seal breach
        if self.seal_intact and random.random() < 0.02:
            self.seal_intact = False
            print(f"ALERT: Seal breach detected for batch {self.batch_id}!")

        return {
            "batch_id": self.batch_id,
            "temperature": temperature,
            "humidity": humidity,
            "latitude": round(self.lat, 4),
            "longitude": round(self.lon, 4),
            "seal_intact": self.seal_intact,
            "timestamp": time.time(),
            "sequence_number": self.seq
        }

def start_simulation():
    broker = os.getenv('MQTT_BROKER_HOST', 'localhost')
    port = int(os.getenv('MQTT_BROKER_PORT', 1883))
    
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
    except AttributeError:
        # paho-mqtt < 2.0 fallback
        client = mqtt.Client()
    
    try:
        client.connect(broker, port, 60)
        print(f"Connected to MQTT broker at {broker}:{port}")
    except Exception as e:
        print(f"CRITICAL: Failed to connect to MQTT broker: {e}")
        return

    batches = [
        SimulatedBatch("PC-2847"),
        SimulatedBatch("PC-2601"),
        SimulatedBatch("PC-2901"),
        SimulatedBatch("PC-3101"),
        SimulatedBatch("PC-3201")
    ]

    print(f"Starting realistic sensor simulation for 5 batches on route Mumbai -> Delhi...")
    
    try:
        while True:
            for batch in batches:
                data = batch.generate_reading()
                topic = f"pharmachain/sensors/{data['batch_id']}"
                client.publish(topic, json.dumps(data))
                # print(f"Published {data['batch_id']}: {data['temperature']}°C")
            
            time.sleep(3)
    except KeyboardInterrupt:
        print("\nSimulation stopped by user.")
    finally:
        client.disconnect()

if __name__ == "__main__":
    start_simulation()
