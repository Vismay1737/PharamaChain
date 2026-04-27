"""
Rich data seeder for PharmaChain demo.
Creates sensor history, AI alerts, and realistic batch locations.
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

# ── Drug batches with rich metadata ──────────────────────────────────
BATCHES = [
    {"batch_id": "PC-2847", "drug_name": "Covaxin", "location": "Mumbai Warehouse", "quantity": 5000},
    {"batch_id": "PC-2601", "drug_name": "Remdesivir", "location": "Delhi Cold Storage", "quantity": 2000},
    {"batch_id": "PC-2901", "drug_name": "Insulin Glargine", "location": "Bangalore Hub", "quantity": 8000},
    {"batch_id": "PC-3101", "drug_name": "Amoxicillin 500mg", "location": "Chennai Port", "quantity": 15000},
    {"batch_id": "PC-3201", "drug_name": "Paracetamol IV", "location": "Hyderabad DC", "quantity": 12000},
]

# ── Route coordinates (India logistics corridors) ────────────────────
ROUTES = {
    "PC-2847": [(19.076, 72.877), (19.15, 73.00), (19.23, 73.12), (19.30, 73.25), (19.40, 73.35), (19.50, 73.50), (19.60, 73.65), (19.75, 73.80)],
    "PC-2601": [(28.613, 77.209), (28.55, 77.10), (28.48, 76.95), (28.40, 76.80), (28.32, 76.65), (28.25, 76.50), (28.18, 76.35), (28.10, 76.20)],
    "PC-2901": [(12.971, 77.594), (13.00, 77.55), (13.05, 77.50), (13.10, 77.45), (13.15, 77.40), (13.20, 77.35), (13.25, 77.30), (13.30, 77.25)],
    "PC-3101": [(13.082, 80.270), (13.00, 80.20), (12.92, 80.15), (12.85, 80.10), (12.78, 80.05), (12.70, 80.00), (12.62, 79.95), (12.55, 79.90)],
    "PC-3201": [(17.385, 78.486), (17.40, 78.55), (17.42, 78.62), (17.45, 78.70), (17.48, 78.78), (17.50, 78.85), (17.53, 78.92), (17.55, 79.00)],
}

# ── AI analysis templates ────────────────────────────────────────────
NORMAL_ANALYSES = [
    "All parameters within acceptable cold-chain thresholds. Batch integrity maintained.",
    "Sensor telemetry nominal. Temperature and humidity within WHO guidelines for this drug class.",
    "Environmental conditions stable. No deviations from prescribed storage protocol detected.",
    "Cold-chain integrity verified. Current readings align with historical baseline for this route.",
    "All metrics within safe operational bounds. Seal integrity confirmed.",
]

ANOMALY_ANALYSES = [
    "CRITICAL: Temperature excursion detected at 12.4°C — exceeds 8°C threshold by 55%. Immediate cold-chain break risk. Recommended action: isolate batch, notify quality assurance, and initiate spoilage assessment protocol.",
    "WARNING: Humidity spike to 78% detected in transit segment Delhi→Jaipur. Potential condensation risk on vaccine vials. Gemini confidence: 94%. Cross-referencing with historical failure patterns shows 3 similar incidents in Q1 2026.",
    "ALERT: Seal integrity compromised at checkpoint. Tamper-evident seal shows discontinuity pattern consistent with unauthorized access. Blockchain provenance audit triggered automatically.",
]

now = datetime.now(timezone.utc)

with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print("❌ Admin user not found. Run seed_user.py first.")
        sys.exit(1)

    # ── Seed/Update batches ──────────────────────────────────────────
    for b in BATCHES:
        existing = DrugBatch.query.filter_by(batch_id=b["batch_id"]).first()
        if existing:
            existing.drug_name = b["drug_name"]
            existing.current_location = b["location"]
            existing.quantity = b["quantity"]
            batch_obj = existing
            print(f"  ✅ Updated {b['batch_id']} → {b['drug_name']}")
        else:
            batch_obj = DrugBatch(
                batch_id=b["batch_id"],
                drug_name=b["drug_name"],
                manufacturer=admin.username,
                manufacture_date=now - timedelta(days=random.randint(5, 30)),
                expiry_date=now + timedelta(days=365),
                quantity=b["quantity"],
                current_location=b["location"],
                blockchain_tx_hash=f"0x{uuid.uuid4().hex[:40]}"
            )
            db.session.add(batch_obj)
            db.session.flush()  # Get the ID
            print(f"  ✅ Created {b['batch_id']} → {b['drug_name']}")

    db.session.commit()

    # ── Seed sensor history (last 24 hours, every 15 min) ────────────
    print("\n📡 Seeding sensor history...")
    
    # Clear old sensor logs for clean demo
    SensorLog.query.delete()
    Alert.query.delete()
    db.session.commit()

    total_sensors = 0
    for b in BATCHES:
        batch_obj = DrugBatch.query.filter_by(batch_id=b["batch_id"]).first()
        route = ROUTES.get(b["batch_id"], [(19.07, 72.87)])
        
        # 96 readings over 24 hours (every 15 min)
        base_temp = random.uniform(2.5, 5.5)
        base_humidity = random.uniform(42, 55)
        
        for i in range(96):
            t = now - timedelta(hours=24) + timedelta(minutes=i * 15)
            route_idx = min(i // 12, len(route) - 1)
            lat, lng = route[route_idx]
            lat += random.uniform(-0.01, 0.01)
            lng += random.uniform(-0.01, 0.01)
            
            # Normal variations
            temp = base_temp + random.uniform(-0.8, 0.8) + (0.3 * (i % 24 > 12))  # Slight afternoon rise
            humidity = base_humidity + random.uniform(-3, 3)
            seal = True
            is_anomaly = False
            analysis = random.choice(NORMAL_ANALYSES) if random.random() > 0.85 else None
            score = random.uniform(0.01, 0.15)
            
            # Inject anomaly for PC-2601 (Remdesivir) around hour 18
            if b["batch_id"] == "PC-2601" and 70 <= i <= 75:
                temp = random.uniform(10.5, 14.2)  # Temperature excursion!
                is_anomaly = True
                score = random.uniform(0.82, 0.97)
                analysis = f"Temperature excursion: {temp:.1f}°C detected. Exceeds 8°C threshold. Cold-chain integrity at risk."
            
            # Inject seal breach for PC-3101 (Amoxicillin) at hour 12
            if b["batch_id"] == "PC-3101" and i == 48:
                seal = False
                is_anomaly = True
                score = 0.91
                analysis = "Seal integrity compromised. Tamper-evident indicator shows discontinuity."
            
            log = SensorLog(
                batch_uuid=batch_obj.id,
                timestamp=t,
                temperature=round(temp, 1),
                humidity=round(humidity, 1),
                latitude=round(lat, 6),
                longitude=round(lng, 6),
                seal_intact=seal,
                anomaly_score=round(score, 3),
                is_anomaly=is_anomaly,
                gemini_analysis=analysis
            )
            db.session.add(log)
            total_sensors += 1
    
    db.session.commit()
    print(f"  📊 Created {total_sensors} sensor readings across {len(BATCHES)} batches")

    # ── Seed AI alerts ───────────────────────────────────────────────
    print("\n🚨 Seeding AI alerts...")
    
    # Alert 1: Temperature excursion on Remdesivir
    remdesivir = DrugBatch.query.filter_by(batch_id="PC-2601").first()
    alert1 = Alert(
        batch_uuid=remdesivir.id,
        anomaly_type="Temperature Excursion",
        severity="CRITICAL",
        root_cause="Cold-chain break detected during Delhi→Jaipur transit segment",
        gemini_analysis=ANOMALY_ANALYSES[0],
        created_at=now - timedelta(hours=6)
    )
    db.session.add(alert1)
    
    # Alert 2: Humidity spike on Covaxin
    covaxin = DrugBatch.query.filter_by(batch_id="PC-2847").first()
    alert2 = Alert(
        batch_uuid=covaxin.id,
        anomaly_type="Humidity Anomaly",
        severity="HIGH",
        root_cause="Condensation risk during monsoon transit",
        gemini_analysis=ANOMALY_ANALYSES[1],
        created_at=now - timedelta(hours=3)
    )
    db.session.add(alert2)
    
    # Alert 3: Seal breach on Amoxicillin
    amoxicillin = DrugBatch.query.filter_by(batch_id="PC-3101").first()
    alert3 = Alert(
        batch_uuid=amoxicillin.id,
        anomaly_type="Seal Integrity Breach",
        severity="CRITICAL",
        root_cause="Tamper-evident seal compromised at Chennai Port checkpoint",
        gemini_analysis=ANOMALY_ANALYSES[2],
        is_acknowledged=True,
        acknowledged_by="admin",
        created_at=now - timedelta(hours=12)
    )
    db.session.add(alert3)

    # Flag batches that have anomalies
    remdesivir.status = "FLAGGED"
    amoxicillin.status = "FLAGGED"

    db.session.commit()
    print("  ⚠️  Created 3 AI alerts (2 active, 1 acknowledged)")
    print(f"  🔴 Flagged: PC-2601 (Remdesivir), PC-3101 (Amoxicillin)")

    # ── Summary ──────────────────────────────────────────────────────
    print(f"""
╔══════════════════════════════════════════════════════╗
║  🎉 PharmaChain Demo Data Seeded Successfully       ║
╠══════════════════════════════════════════════════════╣
║  📦 Drug Batches:    {len(BATCHES):>3}                             ║
║  📡 Sensor Readings: {total_sensors:>3} (24h history)              ║
║  🚨 AI Alerts:       {3:>3} (2 active, 1 ack'd)           ║
║  🔴 Flagged Batches: {2:>3} (Remdesivir, Amoxicillin)     ║
║  ✅ Active Batches:  {3:>3} (Covaxin, Insulin, Paracetamol)║
╚══════════════════════════════════════════════════════╝
    """)
