from flask import request
from flask_jwt_extended import jwt_required
from . import chat_bp
from ..services.gemini_service import GeminiAnomalyDetector
from ..models.drug_batch import DrugBatch
from ..models.sensor_log import SensorLog
from ..utils.responses import standard_response

@chat_bp.route('/', methods=['POST'])
@jwt_required()
def chat_with_ai():
    data = request.get_json()
    message = data.get('message')
    batch_id = data.get('batch_id')
    
    if not message:
        return standard_response(False, message="Message is required", status_code=400)

    # 1. Build Context
    context = {}
    if batch_id:
        batch = DrugBatch.query.filter_by(batch_id=batch_id).first()
        if batch:
            recent_logs = SensorLog.query.filter_by(batch_uuid=batch.id).order_by(SensorLog.timestamp.desc()).limit(10).all()
            context = {
                "batch_info": batch.to_dict(),
                "recent_telemetry": [log.to_dict() for log in recent_logs]
            }
    else:
        flagged_batches = DrugBatch.query.filter_by(status='FLAGGED').limit(3).all()
        context = {
            "critical_focus": [b.to_dict() for b in flagged_batches],
            "note": "Stakeholder is asking a general question about the network."
        }

    # 2. Lazily create detector inside request context
    detector = GeminiAnomalyDetector()
    response = detector.chat_with_pharmachain(message, context)
    
    return standard_response(True, {"response": response})
