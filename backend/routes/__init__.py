from flask import Blueprint

auth_bp = Blueprint('auth', __name__)
batches_bp = Blueprint('batches', __name__)
alerts_bp = Blueprint('alerts', __name__)
chat_bp = Blueprint('chat', __name__)

from . import auth, batches, alerts, chat
