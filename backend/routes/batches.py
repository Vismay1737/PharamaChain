import io
import base64
import qrcode
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from . import batches_bp
from ..app import db
from ..models.drug_batch import DrugBatch
from ..models.sensor_log import SensorLog
from ..utils.jwt_helper import role_required
from ..utils.responses import standard_response
from ..services.blockchain_service import BlockchainService

_blockchain_service = None

def get_blockchain_service():
    global _blockchain_service
    if _blockchain_service is None:
        _blockchain_service = BlockchainService()
    return _blockchain_service

@batches_bp.route('/', methods=['GET'])
@jwt_required()
def get_batches():
    claims = get_jwt()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    
    query = DrugBatch.query
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.order_by(DrugBatch.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return standard_response(True, {
        'items': [batch.to_dict() for batch in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    })

@batches_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('MANUFACTURER')
def create_batch():
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        expiry_date = datetime.fromisoformat(data['expiry_date'])
        new_batch = DrugBatch(
            batch_id=data['batch_id'],
            drug_name=data['drug_name'],
            manufacturer=username,
            expiry_date=expiry_date,
            quantity=data.get('quantity', 1),
            current_location="Manufacturing Plant",
            status="ACTIVE"
        )
        
        # On-chain recording
        tx_hash = get_blockchain_service().register_batch(
            data['batch_id'], 
            data['drug_name'], 
            username
        )
        
        if tx_hash:
            new_batch.blockchain_tx_hash = tx_hash

        db.session.add(new_batch)
        db.session.commit()
        
        return standard_response(True, new_batch.to_dict(), "Batch registered successfully", 201)
    except Exception as e:
        db.session.rollback()
        return standard_response(False, message=str(e), status_code=400)

@batches_bp.route('/<batch_id>', methods=['GET'])
@jwt_required()
def get_batch_details(batch_id):
    batch = DrugBatch.query.filter_by(batch_id=batch_id).first_or_404()
    logs = SensorLog.query.filter_by(batch_uuid=batch.id).order_by(SensorLog.timestamp.desc()).limit(50).all()
    
    # Get Blockchain History
    history = get_blockchain_service().get_batch_history(batch_id)
    
    data = batch.to_dict()
    data['sensor_history'] = [log.to_dict() for log in logs]
    data['blockchain_history'] = history
    
    return standard_response(True, data)

@batches_bp.route('/<batch_id>/verify', methods=['GET'])
@jwt_required()
def verify_batch(batch_id):
    batch = DrugBatch.query.filter_by(batch_id=batch_id).first_or_404()
    
    # 1. Check AI Flags
    any_anomalies = SensorLog.query.filter_by(batch_uuid=batch.id, is_anomaly=True).first()
    
    # 2. Check Blockchain Proof
    # In a real app, we'd query the chain specifically for authenticity
    is_authentic = True if batch.blockchain_tx_hash else False
    
    status_msg = "AUTHENTIC"
    if any_anomalies:
        status_msg = "CAUTION: ANOMALIES DETECTED"
    if batch.status == "RECALLED":
        status_msg = "RECALLED: DO NOT USE"
        
    return standard_response(True, {
        "batch_id": batch_id,
        "is_authentic": is_authentic,
        "has_anomalies": bool(any_anomalies),
        "current_status": batch.status,
        "verification_summary": status_msg
    })

@batches_bp.route('/<batch_id>/qr', methods=['GET'])
@jwt_required()
def get_batch_qr(batch_id):
    # Verification URL (pointing to frontend)
    verify_url = f"https://pharmachain.io/verify/{batch_id}"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(verify_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return standard_response(True, {"qr_code": f"data:image/png;base64,{img_str}"})

@batches_bp.route('/stats/overview', methods=['GET'])
@jwt_required()
def get_stats():
    total = DrugBatch.query.count()
    active = DrugBatch.query.filter(DrugBatch.status.in_(['ACTIVE', 'FLAGGED'])).count()
    flagged = DrugBatch.query.filter_by(status='FLAGGED').count()
    recalled = DrugBatch.query.filter_by(status='RECALLED').count()
    
    return standard_response(True, {
        "total_batches": total,
        "active": active,
        "flagged": flagged,
        "recalled": recalled,
        "verified": total - flagged - recalled,
        "anomalies_today": 0, # Placeholder for count filter
        "blockchain_txns_today": total # Simplified for demo
    })

@batches_bp.route('/<batch_id>/recall', methods=['POST'])
@jwt_required()
@role_required('REGULATOR')
def recall_batch(batch_id):
    batch = DrugBatch.query.filter_by(batch_id=batch_id).first_or_404()
    batch.status = "RECALLED"
    db.session.commit()
    return jsonify({"msg": f"Batch {batch_id} has been recalled by regulator."}), 200
