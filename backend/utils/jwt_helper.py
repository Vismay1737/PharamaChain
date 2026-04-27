from functools import wraps
from flask_jwt_extended import create_access_token, get_jwt
from flask import jsonify

def generate_token(username):
    """
    Generate a JWT token for the given username.
    """
    return create_access_token(identity=username)

def verify_token_identity(identity):
    """
    Helper to verify or process identity from token.
    """
    return identity == 'admin'

def role_required(roles):
    """
    Decorator to restrict access to specific roles.
    'roles' can be a string or a list of strings.
    """
    if isinstance(roles, str):
        roles = [roles]
        
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get('role')
            
            if user_role not in roles:
                return jsonify({"msg": f"Access forbidden for role: {user_role}. Required: {roles}"}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator
