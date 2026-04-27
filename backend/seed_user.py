import os
import sys

# Ensure parent of backend is on path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_app, db
from backend.models.user import User

app = create_app()

with app.app_context():
    db.create_all()
    user = User.query.filter_by(username='admin').first()
    from flask_bcrypt import generate_password_hash
    if not user:
        user = User(username='admin', role='MANUFACTURER')
        db.session.add(user)
    
    user.password_hash = generate_password_hash('admin123').decode('utf-8')
    db.session.commit()
    print("User 'admin' with password 'admin123' ensured.")
