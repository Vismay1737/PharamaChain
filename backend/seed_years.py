"""
Massive data seeder for PharmaChain demo.
Creates years of historical data to simulate a mature enterprise platform.
"""
import os
import sys
import random
import uuid
from datetime import datetime, timezone, timedelta

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_app, db
from backend.models.user import User
from backend.models.drug_batch import DrugBatch
from backend.models.sensor_log import SensorLog
from backend.models.alert import Alert

app = create_app()

now = datetime.now(timezone.utc)

DRUGS = ["Covaxin", "Remdesivir", "Insulin Glargine", "Amoxicillin 500mg", "Paracetamol IV", "Pfizer BioNTech", "Moderna", "Aspirin", "Ibuprofen"]
LOCATIONS = ["Mumbai Warehouse", "Delhi Cold Storage", "Bangalore Hub", "Chennai Port", "Hyderabad DC", "Pune Logistics", "Kolkata Hub"]
MANUFACTURERS = ["admin", "Pfizer", "BharatBiotech", "SerumInstitute"]

with app.app_context():
    # Ensure all manufacturers exist
    from flask_bcrypt import generate_password_hash
    for m in MANUFACTURERS:
        u = User.query.filter_by(username=m).first()
        if not u:
            db.session.add(User(username=m, role='MANUFACTURER', password_hash=generate_password_hash('password').decode('utf-8')))
    db.session.commit()

    print("Clearing old data...")
    SensorLog.query.delete()
    Alert.query.delete()
    DrugBatch.query.delete()
    db.session.commit()

    print("Seeding 3 years of historical batches...")
    
    historical_batches = []
    
    # Generate 1500 batches over the last 3 years (approx 1095 days)
    for i in range(1500):
        days_ago = random.randint(1, 1095)
        mfg_date = now - timedelta(days=days_ago)
        
        # Decide status based on age
        if days_ago < 14:
            status = random.choice(["ACTIVE", "ACTIVE", "ACTIVE", "FLAGGED"])
        elif days_ago > 365:
            status = "DELIVERED" # Assuming they get delivered or expired
        else:
            status = random.choice(["DELIVERED", "DELIVERED", "VERIFIED", "RECALLED"])
            
        b = DrugBatch(
            batch_id=f"PC-HIST-{i:05d}",
            drug_name=random.choice(DRUGS),
            manufacturer=random.choice(MANUFACTURERS),
            manufacture_date=mfg_date,
            expiry_date=mfg_date + timedelta(days=random.randint(300, 700)),
            quantity=random.randint(1000, 50000),
            current_location=random.choice(LOCATIONS) if status in ["ACTIVE", "FLAGGED"] else "Final Destination",
            status=status,
            blockchain_tx_hash=f"0x{uuid.uuid4().hex[:40]}"
        )
        historical_batches.append(b)

    # Bulk insert for speed
    db.session.bulk_save_objects(historical_batches)
    db.session.commit()
    
    print("Seeding historical alerts...")
    # Add alerts for a subset of the flagged/recalled batches
    flagged_batches = DrugBatch.query.filter(DrugBatch.status.in_(['FLAGGED', 'RECALLED'])).limit(50).all()
    historical_alerts = []
    for fb in flagged_batches:
        alert = Alert(
            batch_uuid=fb.id,
            anomaly_type=random.choice(["Temperature Excursion", "Humidity Anomaly", "Seal Integrity Breach", "Route Deviation"]),
            severity=random.choice(["CRITICAL", "HIGH", "MEDIUM"]),
            root_cause="Historical AI Detection",
            gemini_analysis="Gemini AI historical analysis confirms deviation.",
            is_acknowledged=True,
            acknowledged_by="admin",
            created_at=fb.manufacture_date + timedelta(days=random.randint(1, 5))
        )
        historical_alerts.append(alert)
        
    db.session.bulk_save_objects(historical_alerts)
    db.session.commit()
    
    print("Generating live sensor data for ACTIVE batches...")
    active_batches = DrugBatch.query.filter_by(status='ACTIVE').limit(10).all()
    live_sensors = []
    for ab in active_batches:
        for i in range(24): # 24 readings (6 hours)
            t = now - timedelta(hours=6) + timedelta(minutes=i * 15)
            log = SensorLog(
                batch_uuid=ab.id,
                timestamp=t,
                temperature=round(random.uniform(2.5, 6.0), 1),
                humidity=round(random.uniform(42, 55), 1),
                latitude=round(19.0 + random.uniform(-1, 1), 6),
                longitude=round(72.0 + random.uniform(-1, 1), 6),
                seal_intact=True,
                anomaly_score=round(random.uniform(0.01, 0.1), 3),
                is_anomaly=False
            )
            live_sensors.append(log)
            
    db.session.bulk_save_objects(live_sensors)
    db.session.commit()

    print(f"Successfully seeded {len(historical_batches)} batches spanning 3 years!")
    print(f"Created {len(historical_alerts)} historical alerts.")
    print(f"Generated {len(live_sensors)} live sensor telemetries.")
