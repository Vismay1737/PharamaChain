# 🛠️ PharmaChain — Setup & Configuration Guide

This document covers every API key, link, and environment variable you need to run PharmaChain locally or via Docker.

---

## 📦 Step 1 — Prerequisites

Install these before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.12+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| Mosquitto (MQTT Broker) | 2.x | https://mosquitto.org/download/ |
| Ganache (Blockchain) | Latest | https://trufflesuite.com/ganache/ |
| Git | Any | https://git-scm.com/ |

> Ganache and Mosquitto are **optional** for basic local dev — the app degrades gracefully without them.

---

## 🔑 Step 2 — API Keys You Need

### 1. Google Gemini API Key *(Required for AI features)*

The AI anomaly detection and chat features require a Gemini API key.

- **Get it free at:** https://aistudio.google.com/app/apikey
- Click **"Get API Key"** → **"Create API Key"**
- Copy the key (it looks like `AIzaSy...`)

---

### 2. Secret Keys *(Required — generate yourself)*

These are used by Flask to sign sessions and JWTs. Generate two random strings:

**Option A — Python:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Run it twice to get two different keys.

**Option B — Online generator:**
https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx  
(Select 256-bit)

---

### 3. Ganache Private Key *(Optional — for blockchain features)*

- Download & open Ganache: https://trufflesuite.com/ganache/
- Click **"Quickstart Ethereum"**
- Click the 🔑 key icon next to any account
- Copy the **Private Key** shown (starts with `0x...`)

---

### 4. Smart Contract Address *(Optional — after deploying)*

After running `make deploy-contract`, the terminal will print the deployed contract address.  
Copy that address (looks like `0xABCDEF...`).

---

## 🗂️ Step 3 — Create Your `.env` File

Navigate to the `backend/` folder and create a `.env` file:

```bash
# Windows
copy backend\.env.example backend\.env

# Mac/Linux
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your values:

```env
# ─── Security ──────────────────────────────────────────
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=paste_your_generated_secret_key_here
JWT_SECRET_KEY=paste_your_generated_jwt_key_here

# ─── Database ──────────────────────────────────────────
# Default SQLite — no changes needed for local dev
DATABASE_URL=sqlite:///pharmachain.db

# ─── MQTT Broker ───────────────────────────────────────
# Use 'mosquitto' if running in Docker, 'localhost' for local
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883

# ─── Google Gemini AI ──────────────────────────────────
# Get free at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=paste_your_gemini_api_key_here

# ─── Blockchain (Ganache) ──────────────────────────────
# Leave blank if not using blockchain features
GANACHE_URL=http://127.0.0.1:7545
GANACHE_PRIVATE_KEY=paste_your_ganache_private_key_here
CONTRACT_ADDRESS=paste_your_deployed_contract_address_here
```

---

## ⚡ Step 4 — Install Dependencies

```bash
# Install Python backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install contract dependencies (only if using blockchain)
cd contracts && npm install && cd ..
```

Or use the shortcut:
```bash
make install
```

---

## 🚀 Step 5 — Run the App

### Option A — Run Services Individually (Recommended for Dev)

Open **4 separate terminals** and run one command in each:

| Terminal | Command | What it does |
|----------|---------|-------------|
| 1 | `cd backend && python run.py` | Starts Flask API on port 5000 |
| 2 | `cd frontend && npm run dev` | Starts React app on port 5173 |
| 3 | `mosquitto -c mosquitto/mosquitto.conf` | Starts MQTT broker |
| 4 | `cd iot_simulator && python sensor_publisher.py` | Starts sensor simulation |

### Option B — Docker (All-in-one)

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

---

## 🔗 Important URLs

| What | URL |
|------|-----|
| Frontend App | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |
| Gemini Console | https://aistudio.google.com/app/apikey |
| Ganache Download | https://trufflesuite.com/ganache/ |
| MQTT Broker Docs | https://mosquitto.org/ |

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT token |
| GET | `/api/auth/me` | Get current user info |

### Batches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/batches/` | List all batches (paginated) |
| POST | `/api/batches/` | Register new drug batch |
| GET | `/api/batches/<batch_id>` | View batch details + sensor history |
| GET | `/api/batches/<batch_id>/verify` | Verify batch authenticity |
| GET | `/api/batches/<batch_id>/qr` | Get QR code (Base64) |
| GET | `/api/batches/stats/overview` | Dashboard statistics |
| POST | `/api/batches/<batch_id>/recall` | Recall a batch (Regulator only) |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts/` | List all AI alerts |
| GET | `/api/alerts/live` | Real-time SSE stream |
| PUT | `/api/alerts/<alert_id>/acknowledge` | Acknowledge an alert |
| GET | `/api/alerts/summary` | Alert counts by severity |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | Chat with PharmaChain AI |

> ⚠️ All endpoints (except `/api/auth/login` and `/api/auth/register`) require a **Bearer token** in the `Authorization` header.

---

## 🧪 Quick Test

Once the backend is running, test it:

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# 2. Copy the access_token from the response, then:
curl http://localhost:5000/api/batches/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ❓ What Works Without API Keys

| Feature | Without Gemini Key | Without Ganache |
|---------|-------------------|----------------|
| Login / Auth | ✅ Works | ✅ Works |
| View Batches | ✅ Works | ✅ Works |
| Real-time Sensor Feed | ✅ Works | ✅ Works |
| AI Anomaly Detection | ⚠️ Falls back to rule-based logic | ✅ Works |
| AI Chat | ❌ Returns offline message | ✅ Works |
| Blockchain Recording | ✅ Skipped gracefully | ❌ No on-chain record |

---

*Generated for PharmaChain v1.0 — AI-Vigilant Decentralized Supply Chain*
