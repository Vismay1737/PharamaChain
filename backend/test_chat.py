import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_app
from backend.services.gemini_service import GeminiAnomalyDetector

app = create_app()

with app.app_context():
    detector = GeminiAnomalyDetector()
    res = detector.chat_with_pharmachain("Hello", {})
    print("CHAT_RESPONSE: ", res)
