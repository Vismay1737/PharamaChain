import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from .config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    socketio.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # --- Error Handlers ---
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found", "path": request.path}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred"}), 500

    # --- JWT Customization ---
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "The token has expired", "subcode": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Signature verification failed", "subcode": "token_invalid"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Request does not contain an access token", "subcode": "no_token"}), 401

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "PharmaChain running",
            "timestamp": datetime.now().isoformat()
        }), 200

    @socketio.on('connect')
    def handle_connect():
        logger.info(f"Client connected: {request.sid}")

    with app.app_context():
        # Import models to ensure they are registered with SQLAlchemy
        from .models import User, DrugBatch, SensorLog
        
        # Import and register blueprints
        from .routes import auth_bp, batches_bp, alerts_bp, chat_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(batches_bp, url_prefix='/api/batches')
        app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
        app.register_blueprint(chat_bp, url_prefix='/api/chat')

        # Initialize services
        try:
            from .services.mqtt_service import start_mqtt_service
            start_mqtt_service(app)
        except Exception as e:
            logger.error(f"Failed to start MQTT service: {e}")

        # Create database tables
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
