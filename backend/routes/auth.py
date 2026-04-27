from flask import request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from . import auth_bp
from ..app import db, bcrypt
from ..models.user import User

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not username or not password or not role:
        return jsonify({"error": "Missing required fields (username, password, role)"}), 400

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters long"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password, role=role)
    
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error during registration"}), 500

    access_token = create_access_token(identity=username, additional_claims={"role": role})
    return jsonify(access_token=access_token, msg="User registered successfully"), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=username, additional_claims={"role": user.role})
        refresh_token = create_refresh_token(identity=username)
        return jsonify({
            "access_token": access_token, 
            "refresh_token": refresh_token, 
            "role": user.role,
            "username": user.username
        }), 200
    
    return jsonify({"error": "Invalid username or password"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200
