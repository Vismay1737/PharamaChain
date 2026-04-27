# 🛠️ PharmaChain — Setup & Configuration Guide

This document covers every API key and environment variable you need to run PharmaChain locally.

---

## 📦 Step 1 — Prerequisites

Install these before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.12+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| Git | Any | https://git-scm.com/ |

---

## 🔑 Step 2 — API Keys You Need

### 1. Google Gemini API Key *(Required for AI features)*

The AI anomaly detection, Chat Assistant, and Threat Analysis features require a Gemini API key.

- **Get it free at:** https://aistudio.google.com/app/apikey
- Click **"Get API Key"** → **"Create API Key"**
- Copy the key (it looks like `AIzaSy...`)

---

### 2. Secret Keys *(Required)*

These are used by Flask to sign sessions and JWTs. Generate two random strings:

**Option A — Python:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Run it twice to get two different keys.

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

# ─── Google Gemini AI ──────────────────────────────────
# Get free at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=paste_your_gemini_api_key_here
```

---

## ⚡ Step 4 — Install Dependencies

```bash
# Install Python backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

---

## 🚀 Step 5 — Run the App

Open **2 separate terminals** and run one command in each:

| Terminal | Command | What it does |
|----------|---------|-------------|
| 1 | `cd backend && python run.py` | Starts Flask API on port 5000 |
| 2 | `cd frontend && npm run dev` | Starts React app on port 5173 |

---

## 🔗 Important URLs

| What | URL |
|------|-----|
| Frontend App | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |
| Gemini Console | https://aistudio.google.com/app/apikey |

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
| GET | `/api/batches/<batch_id>` | View batch details + timeline history |
| GET | `/api/batches/<batch_id>/verify` | Verify batch authenticity (blockchain fallback) |
| GET | `/api/batches/stats/overview` | Dashboard statistics |

### Alerts & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts/` | List all AI threat alerts |
| PUT | `/api/alerts/<alert_id>/acknowledge` | Acknowledge an alert |
| POST | `/api/chat/` | Chat with PharmaChain Gemini Assistant |

> ⚠️ All endpoints (except `/api/auth/login` and `/api/auth/register`) require a **Bearer token** in the `Authorization` header.

---

*Generated for PharmaChain — AI Supply Chain Guardian*
