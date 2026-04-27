from flask import jsonify
from datetime import datetime

def standard_response(success, data=None, message=None, status_code=200):
    """
    Standardizes JSON response format for all API endpoints.
    Format: { "success": bool, "data": ..., "message": str, "timestamp": str }
    """
    response = {
        "success": success,
        "data": data,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    return jsonify(response), status_code
