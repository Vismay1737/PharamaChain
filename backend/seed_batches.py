import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_app, db
from backend.models.user import User
from backend.models.drug_batch import DrugBatch
from backend.services.blockchain_service import BlockchainService

app = create_app()

BATCHES = [
    {"batch_id": "PC-2847", "drug_name": "Covaxin"},
    {"batch_id": "PC-2601", "drug_name": "Remdesivir"},
    {"batch_id": "PC-2901", "drug_name": "Insulin Glargine"},
    {"batch_id": "PC-3101", "drug_name": "Amoxicillin 500mg"},
    {"batch_id": "PC-3201", "drug_name": "Paracetamol IV"},
]

with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print("Admin user not found. Cannot seed batches.")
        sys.exit(1)
        
    blockchain = BlockchainService()
        
    for b in BATCHES:
        existing = DrugBatch.query.filter_by(batch_id=b["batch_id"]).first()
        if existing:
            # Update name if it was "Simulated Vaccine"
            if existing.drug_name == "Simulated Vaccine":
                existing.drug_name = b["drug_name"]
                print(f"Updated batch {b['batch_id']} name to {b['drug_name']}")
        else:
            from datetime import datetime, timezone, timedelta
            batch = DrugBatch(
                batch_id=b["batch_id"],
                drug_name=b["drug_name"],
                manufacturer=admin.username,
                manufacture_date=datetime.now(timezone.utc),
                expiry_date=datetime.now(timezone.utc) + timedelta(days=365)
            )
            db.session.add(batch)
            print(f"Registered batch {b['batch_id']} ({b['drug_name']}) in DB.")
            
    db.session.commit()
    print("Batch seeding completed.")
