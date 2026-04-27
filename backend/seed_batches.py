import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_app, db
from backend.models.user import User
from backend.models.drug_batch import DrugBatch
from backend.services.blockchain_service import BlockchainService

app = create_app()

BATCHES = ["PC-2847", "PC-2601", "PC-2901", "PC-3101", "PC-3201"]

with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print("Admin user not found. Cannot seed batches.")
        sys.exit(1)
        
    blockchain = BlockchainService()
        
    for batch_id in BATCHES:
        if not DrugBatch.query.filter_by(batch_id=batch_id).first():
            from datetime import datetime, timedelta
            batch = DrugBatch(
                batch_id=batch_id,
                drug_name="Simulated Vaccine",
                manufacturer=admin.username,
                manufacture_date=datetime.utcnow(),
                expiry_date=datetime.utcnow() + timedelta(days=365)
            )
            db.session.add(batch)
            print(f"Registered batch {batch_id} in DB.")
            
            # Optionally log to chain (Disabled for local sim w/o Ganache)
            
    db.session.commit()
    print("Batch seeding completed.")
