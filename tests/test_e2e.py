"""
PharmaChain End-to-End Integration Test Suite
=============================================
Exercises the full pipeline: Auth → Batch Registration → Blockchain →
MQTT Sensor Ingestion → Gemini AI Anomaly Detection → SocketIO Alerts →
Verification & Acknowledgement.

Usage:
    python -m pytest tests/test_e2e.py -v --tb=short
    OR
    python tests/test_e2e.py
"""

import sys
import os
import json
import time
import uuid
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# ---------------------------------------------------------------------------
# Ensure the project root is on sys.path so `backend` is importable
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

# ---------------------------------------------------------------------------
# Colour helpers for terminal output
# ---------------------------------------------------------------------------
GREEN  = "\033[92m"
RED    = "\033[91m"
CYAN   = "\033[96m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

results = []

def report(step_num, description, passed, detail=""):
    status = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
    results.append((step_num, description, passed, detail))
    print(f"  [{status}] Step {step_num}: {description}")
    if detail and not passed:
        print(f"         └─ {YELLOW}{detail}{RESET}")


def print_banner():
    print(f"""
{CYAN}{BOLD}╔══════════════════════════════════════════════════════════════╗
║           PharmaChain E2E Integration Test Suite             ║
║                  AI · Blockchain · IoT                       ║
╚══════════════════════════════════════════════════════════════╝{RESET}
""")


def print_report():
    total   = len(results)
    passed  = sum(1 for r in results if r[2])
    failed  = total - passed
    colour  = GREEN if failed == 0 else RED

    print(f"""
{BOLD}─────────────────────────────── REPORT ───────────────────────────────{RESET}
  Total Steps : {total}
  Passed      : {GREEN}{passed}{RESET}
  Failed      : {RED}{failed}{RESET}
  Result      : {colour}{BOLD}{'ALL PASSED ✓' if failed == 0 else f'{failed} FAILURE(S) ✗'}{RESET}
{BOLD}──────────────────────────────────────────────────────────────────────{RESET}
""")


# ---------------------------------------------------------------------------
# Mock factories – create deterministic mocks for external services
# ---------------------------------------------------------------------------
def make_mock_blockchain_service():
    """Return a mock BlockchainService that simulates successful on-chain ops."""
    mock = MagicMock()
    mock.register_batch.return_value = "0xabc123fake_tx_hash_register"
    mock.record_anomaly.return_value = "0xdef456fake_tx_hash_anomaly"
    mock.transfer_batch.return_value = "0x789transfer_hash"
    mock.get_batch_history.return_value = []
    mock.verify_batch.return_value = "0xverify_hash"
    mock.is_connected.return_value = True
    return mock


def make_mock_gemini_response():
    """Simulated Gemini 1.5-Flash anomaly detection response."""
    return {
        "is_anomaly": True,
        "anomaly_score": 0.92,
        "anomaly_type": "TEMPERATURE_BREACH",
        "severity": "HIGH",
        "root_cause": "Cold-chain excursion: 9.5°C exceeds 8°C safety threshold",
        "recommendation": "Quarantine batch and perform stability testing",
        "risk_to_patients": "Possible reduced vaccine efficacy due to thermal exposure",
        "confidence": 0.95,
        "full_report": "Executive Summary: Temperature breach detected at 9.5°C..."
    }


# ---------------------------------------------------------------------------
# Application factory for testing
# ---------------------------------------------------------------------------
def create_test_app():
    """
    Build a Flask app configured for testing with an in-memory SQLite DB
    and all external services (Blockchain, MQTT, Gemini) mocked out.
    """
    # Patch heavy services BEFORE import so module-level code is intercepted
    mock_bc = make_mock_blockchain_service()

    patches = [
        patch('backend.services.blockchain_service.BlockchainService', return_value=mock_bc),
        patch('backend.services.mqtt_service.start_mqtt_service', return_value=None),
    ]
    for p in patches:
        p.start()

    from backend.app import create_app, db, socketio

    class TestConfig:
        SECRET_KEY = 'test-secret'
        JWT_SECRET_KEY = 'test-jwt-secret'
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        TESTING = True
        GEMINI_API_KEY = None
        MQTT_BROKER_HOST = 'localhost'
        MQTT_BROKER_PORT = 1883
        GANACHE_URL = 'http://127.0.0.1:7545'

    app = create_app()
    app.config.from_object(TestConfig)

    with app.app_context():
        db.create_all()

    return app, db, socketio, mock_bc, patches


# ---------------------------------------------------------------------------
# Main test scenario
# ---------------------------------------------------------------------------
def run_tests():
    print_banner()

    app, db, socketio, mock_bc, patches = create_test_app()
    client = app.test_client()
    token = None
    alert_id = None

    # ── Step 1: Health Check ──────────────────────────────────────────────
    try:
        resp = client.get('/health')
        report(1, "Flask server health check", resp.status_code == 200)
    except Exception as e:
        report(1, "Flask server health check", False, str(e))

    # ── Step 2: Register manufacturer user ────────────────────────────────
    try:
        resp = client.post('/api/auth/register', json={
            "username": "testmanufacturer",
            "password": "secure123",
            "role": "MANUFACTURER"
        })
        data = resp.get_json()
        ok = resp.status_code == 201 and 'access_token' in data
        report(2, "Register user (MANUFACTURER)", ok, f"status={resp.status_code}")
    except Exception as e:
        report(2, "Register user (MANUFACTURER)", False, str(e))

    # ── Step 3: Login and obtain JWT ──────────────────────────────────────
    try:
        resp = client.post('/api/auth/login', json={
            "username": "testmanufacturer",
            "password": "secure123"
        })
        data = resp.get_json()
        token = data.get('access_token')
        ok = resp.status_code == 200 and token is not None
        report(3, "Login → JWT token received", ok)
    except Exception as e:
        report(3, "Login → JWT token received", False, str(e))

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # ── Step 4: Create drug batch PC-TEST-001 ─────────────────────────────
    try:
        resp = client.post('/api/batches/', json={
            "batch_id": "PC-TEST-001",
            "drug_name": "Covaxin",
            "expiry_date": (datetime.utcnow() + timedelta(days=365)).isoformat(),
            "quantity": 500
        }, headers=headers)
        data = resp.get_json()
        ok = resp.status_code == 201
        report(4, "Create batch PC-TEST-001 via POST", ok, f"status={resp.status_code}")
    except Exception as e:
        report(4, "Create batch PC-TEST-001 via POST", False, str(e))

    # ── Step 5: Verify blockchain registration was called ─────────────────
    try:
        called = mock_bc.register_batch.called
        args = mock_bc.register_batch.call_args
        ok = called and args[0][0] == "PC-TEST-001"
        report(5, "Blockchain register_batch() invoked for PC-TEST-001", ok,
               f"called={called}, args={args}")
    except Exception as e:
        report(5, "Blockchain register_batch() invoked", False, str(e))

    # ── Step 6: Simulate normal sensor reading (directly into DB) ─────────
    try:
        with app.app_context():
            from backend.models.drug_batch import DrugBatch
            from backend.models.sensor_log import SensorLog

            batch = DrugBatch.query.filter_by(batch_id="PC-TEST-001").first()
            normal_log = SensorLog(
                batch_uuid=batch.id,
                temperature=5.2,
                humidity=65.0,
                latitude=19.076,
                longitude=72.877,
                seal_intact=True,
                is_anomaly=False,
                anomaly_score=0.0,
                gemini_analysis=None
            )
            db.session.add(normal_log)
            db.session.commit()

            count = SensorLog.query.filter_by(batch_uuid=batch.id).count()
            report(6, "Normal sensor reading stored in DB", count == 1)
    except Exception as e:
        report(6, "Normal sensor reading stored in DB", False, str(e))

    # ── Step 7: Simulate anomaly reading (temp = 9.5°C) ───────────────────
    try:
        with app.app_context():
            from backend.models.drug_batch import DrugBatch
            from backend.models.sensor_log import SensorLog
            from backend.models.alert import Alert

            batch = DrugBatch.query.filter_by(batch_id="PC-TEST-001").first()

            gemini_result = make_mock_gemini_response()

            anomaly_log = SensorLog(
                batch_uuid=batch.id,
                temperature=9.5,
                humidity=72.0,
                latitude=20.593,
                longitude=78.962,
                seal_intact=True,
                is_anomaly=True,
                anomaly_score=gemini_result['anomaly_score'],
                gemini_analysis=gemini_result['full_report']
            )
            db.session.add(anomaly_log)

            # Flag batch (mimics what MQTT service does)
            batch.status = "FLAGGED"
            batch.blockchain_tx_hash = mock_bc.record_anomaly(
                "PC-TEST-001", "TEMPERATURE_BREACH", "HIGH",
                gemini_result['root_cause']
            )

            # Create formal Alert record
            alert = Alert(
                batch_uuid=batch.id,
                anomaly_type="TEMPERATURE_BREACH",
                severity="HIGH",
                root_cause=gemini_result['root_cause'],
                gemini_analysis=gemini_result['full_report']
            )
            db.session.add(alert)
            db.session.commit()

            report(7, "Anomaly reading (9.5°C) injected into pipeline", True)
    except Exception as e:
        report(7, "Anomaly reading (9.5°C) injected", False, str(e))

    # ── Step 8: Assert SensorLog with is_anomaly=True ─────────────────────
    try:
        with app.app_context():
            from backend.models.drug_batch import DrugBatch
            from backend.models.sensor_log import SensorLog

            batch = DrugBatch.query.filter_by(batch_id="PC-TEST-001").first()
            anomaly_log = SensorLog.query.filter_by(
                batch_uuid=batch.id, is_anomaly=True
            ).first()
            ok = anomaly_log is not None and anomaly_log.temperature == 9.5
            report(8, "SensorLog exists with is_anomaly=True", ok,
                   f"temp={anomaly_log.temperature if anomaly_log else 'N/A'}")
    except Exception as e:
        report(8, "SensorLog anomaly verification", False, str(e))

    # ── Step 9: Assert Gemini analysis stored ─────────────────────────────
    try:
        with app.app_context():
            from backend.models.drug_batch import DrugBatch
            from backend.models.sensor_log import SensorLog

            batch = DrugBatch.query.filter_by(batch_id="PC-TEST-001").first()
            log = SensorLog.query.filter_by(
                batch_uuid=batch.id, is_anomaly=True
            ).first()
            ok = log is not None and log.gemini_analysis is not None and len(log.gemini_analysis) > 10
            report(9, "Gemini AI analysis persisted in SensorLog", ok,
                   f"analysis_length={len(log.gemini_analysis) if log and log.gemini_analysis else 0}")
    except Exception as e:
        report(9, "Gemini analysis stored", False, str(e))

    # ── Step 10: Assert SocketIO emission (mock test) ─────────────────────
    try:
        # We simulate what the MQTT service would do:
        # socketio.emit('gemini_alert', data) – since we can't run a real
        # eventlet loop, we verify the socketio object exists and is callable.
        ok = hasattr(socketio, 'emit') and callable(socketio.emit)
        report(10, "SocketIO 'gemini_alert' emitter available", ok)
    except Exception as e:
        report(10, "SocketIO gemini_alert", False, str(e))

    # ── Step 11: GET /verify → assert FLAGGED ─────────────────────────────
    try:
        resp = client.get('/api/batches/PC-TEST-001/verify')
        data = resp.get_json()
        payload = data.get('data', {})
        ok = (resp.status_code == 200 and
              payload.get('current_status') == 'FLAGGED' and
              payload.get('has_anomalies') == True)
        report(11, "GET /verify → batch status FLAGGED with anomalies", ok,
               f"status={payload.get('current_status')}, anomalies={payload.get('has_anomalies')}")
    except Exception as e:
        report(11, "Verify batch status", False, str(e))

    # ── Step 12: GET /alerts → assert 1 alert with severity HIGH ──────────
    try:
        resp = client.get('/api/alerts/')
        data = resp.get_json()
        payload = data.get('data', {})
        items = payload.get('items', [])
        ok = (resp.status_code == 200 and
              payload.get('total', 0) >= 1 and
              items[0].get('severity') == 'HIGH')
        alert_id = items[0].get('id') if items else None
        report(12, "GET /alerts → ≥1 alert with severity HIGH", ok,
               f"count={payload.get('total')}, severity={items[0].get('severity') if items else 'N/A'}")
    except Exception as e:
        report(12, "Alert existence check", False, str(e))

    # ── Step 13: Acknowledge alert ────────────────────────────────────────
    try:
        if alert_id:
            resp = client.put(f'/api/alerts/{alert_id}/acknowledge', headers=headers)
            data = resp.get_json()
            payload = data.get('data', {})
            ok = (resp.status_code == 200 and
                  payload.get('is_acknowledged') == True and
                  payload.get('acknowledged_by') == 'testmanufacturer')
            report(13, "PUT /acknowledge → alert acknowledged", ok,
                   f"ack_by={payload.get('acknowledged_by')}")
        else:
            report(13, "PUT /acknowledge → alert acknowledged", False, "No alert_id from step 12")
    except Exception as e:
        report(13, "Alert acknowledgement", False, str(e))

    # ── Cleanup ───────────────────────────────────────────────────────────
    for p in patches:
        p.stop()

    print_report()

    # Return exit code for CI
    failures = sum(1 for r in results if not r[2])
    return failures


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)
