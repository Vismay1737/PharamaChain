import json
import time
from flask import request, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import alerts_bp
from ..models.alert import Alert
from ..app import db
from ..utils.responses import standard_response

@alerts_bp.route('/', methods=['GET'])
@jwt_required()
def get_alerts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    severity = request.args.get('severity')
    batch_id = request.args.get('batch_id')
    
    query = Alert.query
    if severity:
        query = query.filter_by(severity=severity)
    if batch_id:
        # Note: In a real app, join with DrugBatch to filter by batch_id string
        pass
    
    pagination = query.order_by(Alert.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return standard_response(True, {
        "items": [alert.to_dict() for alert in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })

@alerts_bp.route('/live', methods=['GET'])
def live_alerts():
    """
    SSE stream for real-time alerts.
    Browser usage: const source = new EventSource('/api/alerts/live');
    """
    def event_stream():
        # This is a simplified demo stream. 
        # In production, we'd use a message queue (Redis/RabbitMQ) 
        # or a database trigger to yield events.
        while True:
            # Check for recent unacknowledged alerts
            latest_alert = Alert.query.filter_by(is_acknowledged=False).order_by(Alert.created_at.desc()).first()
            if latest_alert:
                yield f"data: {json.dumps(latest_alert.to_dict())}\n\n"
            time.sleep(5) # Poll every 5s for demo

    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")

@alerts_bp.route('/<alert_id>', methods=['GET'])
@jwt_required()
def get_alert_detail(alert_id):
    alert = Alert.query.filter_by(id=alert_id).first_or_404()
    return standard_response(True, alert.to_dict())

@alerts_bp.route('/<alert_id>/acknowledge', methods=['PUT'])
@jwt_required()
def acknowledge_alert(alert_id):
    username = get_jwt_identity()
    alert = Alert.query.filter_by(id=alert_id).first_or_404()
    
    alert.is_acknowledged = True
    alert.acknowledged_by = username
    db.session.commit()
    
    return standard_response(True, alert.to_dict(), "Alert acknowledged successfully")

@alerts_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_alert_summary():
    # Simple summary for the dashboard
    stats = {
        "CRITICAL": Alert.query.filter_by(severity="CRITICAL").count(),
        "HIGH": Alert.query.filter_by(severity="HIGH").count(),
        "MEDIUM": Alert.query.filter_by(severity="MEDIUM").count(),
        "LOW": Alert.query.filter_by(severity="LOW").count()
    }
    return standard_response(True, stats)
