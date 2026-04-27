<div align="center">

# 🛡️ PharmaChain

### AI-Vigilant Decentralized Pharmaceutical Supply Chain

[![Google Solution Challenge 2026](https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=for-the-badge&logo=google)](https://hack2skill.com/event/solution-challenge-2026)
[![Gemini 1.5 Flash](https://img.shields.io/badge/Gemini%201.5%20Flash-Powered-FF6F00?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-3C3C3D?style=for-the-badge&logo=ethereum)](https://ethereum.org)

[![SDG 3](https://img.shields.io/badge/SDG%203-Good%20Health%20%26%20Well--Being-4C9F38?style=flat-square)](https://sdgs.un.org/goals/goal3)
[![SDG 9](https://img.shields.io/badge/SDG%209-Industry%2C%20Innovation-F36D25?style=flat-square)](https://sdgs.un.org/goals/goal9)
[![SDG 12](https://img.shields.io/badge/SDG%2012-Responsible%20Production-BF8B2E?style=flat-square)](https://sdgs.un.org/goals/goal12)

</div>

---

## 🌍 Problem Statement

The WHO estimates that **1 in 10 medical products** in low- and middle-income countries is substandard or falsified. Counterfeit and degraded pharmaceuticals cause an estimated **1 million deaths per year**, including 250,000 children from fake antimalarials alone.

The core challenges are:

1. **Broken Cold Chains** — Temperature-sensitive drugs (vaccines, insulin, biologics) degrade silently during transit with no real-time monitoring.
2. **No Provenance Verification** — Paper-based tracking is easily forged. Patients and regulators cannot verify drug authenticity.
3. **Reactive Quality Control** — Current systems detect problems *after* patients have already consumed degraded medicine.

---

## 💡 Our Solution

PharmaChain is a **full-stack platform** that combines **Google Gemini AI**, **IoT sensors**, and **Ethereum blockchain** to create a real-time pharmaceutical supply chain guardian.

### How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐     ┌────────────────┐
│  IoT Sensors │────▶│  MQTT Broker │────▶│  Flask Backend       │────▶│  Ethereum      │
│  (Temp, GPS, │     │  (Mosquitto) │     │  + Gemini 1.5 Flash  │     │  Blockchain    │
│   Humidity)  │     └──────────────┘     │  AI Analysis         │     │  (Immutable)   │
└──────────────┘                          └──────────┬───────────┘     └────────────────┘
                                                     │
                                          ┌──────────▼───────────┐
                                          │  React Dashboard     │
                                          │  Real-time Alerts    │
                                          │  AI Chat Interface   │
                                          └──────────────────────┘
```

### Key Features

| Feature | Description |
|---------|------------|
| 🧠 **AI Anomaly Detection** | Gemini 1.5 Flash analyzes every sensor reading in real-time — detects temperature excursions, seal breaches, humidity drift |
| ⛓️ **Blockchain Provenance** | Every batch registration and anomaly flag is immutably recorded on Ethereum via Solidity smart contracts |
| 📡 **IoT Cold-Chain Monitoring** | Simulated sensors publish temperature, humidity, GPS, and seal status via MQTT every 5 seconds |
| 🗺️ **Geospatial Tracking** | Live Leaflet map tracks shipment locations in real-time |
| 💬 **AI Chat Interface** | Conversational Gemini AI — ask questions about any drug batch and get contextual answers |
| 📊 **Real-Time Dashboard** | Socket.IO + SSE powered dashboard with live anomaly charts and sensor feeds |
| 🔐 **Role-Based Access** | JWT authentication with Manufacturer, Distributor, and Regulator roles |
| 📱 **QR Verification** | Generate QR codes linking physical drug packages to their on-chain history |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **AI** | Google Gemini 1.5 Flash (anomaly detection, reports, chat) |
| **Backend** | Python, Flask, Flask-SocketIO, JWT, SQLAlchemy |
| **Frontend** | React 19, Vite, TailwindCSS, Framer Motion, Recharts, Leaflet |
| **Blockchain** | Solidity, Hardhat, Web3.py, Ganache |
| **IoT** | MQTT (Paho), Eclipse Mosquitto broker |
| **Infrastructure** | Docker Compose, Google Cloud Platform |

---

## 🏛️ Architecture

```
       [ IoT SIMULATOR ]             [ GOOGLE GEMINI AI ]
              |                              ^
              v                              |
      ( MQTT: 1883 ) <----------- [ FLASK BACKEND ] ----------> ( DB: SQLite )
              |                              |
              v                              v
      [ REAL-TIME DASHBOARD ] <---> [ ETHEREUM (GANACHE) ]
         ( React + Vite )           ( Smart Contracts )
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+** & **pip**
- **Node.js 18+** & **npm**
- **Mosquitto** MQTT Broker (optional)
- **Ganache** (optional — blockchain features)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pharmachain.git
cd pharmachain

# Install all dependencies
make install
# OR manually:
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
```

### Configuration

1. Copy and configure environment variables:
```bash
cp backend/.env.example backend/.env
```

2. Add your **Gemini API key** (free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)):
```env
GEMINI_API_KEY=your_key_here
```

> 📖 **Full setup guide:** See [SETUP.md](SETUP.md) for detailed instructions including all API keys and configuration options.

### Run

```bash
# Option A: Run all services
make all

# Option B: Docker
docker-compose up --build

# Option C: Run individually (4 terminals)
cd backend && python run.py          # Terminal 1: API server
cd frontend && npm run dev           # Terminal 2: React app
mosquitto -c mosquitto/mosquitto.conf # Terminal 3: MQTT broker
cd iot_simulator && python sensor_publisher.py  # Terminal 4: Sensors
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

---

## 🧪 Demo

Run the automated CLI demo to see all systems working together:

```bash
python demo.py
```

This will:
1. Bootstrap users and drug batches
2. Simulate 30 seconds of IoT sensor data
3. Trigger a forced temperature anomaly at 15s
4. Show AI detection and blockchain anchoring in real-time
5. Print a complete operational report

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user info |

### Batch Management (`/api/batches`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/batches/` | List all batches (paginated) |
| POST | `/api/batches/` | Register new drug batch |
| GET | `/api/batches/<id>` | View batch details + sensor history |
| GET | `/api/batches/<id>/verify` | Verify batch authenticity |
| GET | `/api/batches/<id>/qr` | Get QR code (Base64) |
| GET | `/api/batches/stats/overview` | Dashboard statistics |
| POST | `/api/batches/<id>/recall` | Recall a batch (Regulator only) |

### AI Intelligence
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts/` | View AI-flagged anomalies |
| GET | `/api/alerts/live` | SSE stream for real-time alerts |
| PUT | `/api/alerts/<id>/acknowledge` | Acknowledge an alert |
| POST | `/api/chat/` | Chat with PharmaChain AI |

> ⚠️ All endpoints (except login/register) require a `Bearer` token in the `Authorization` header.

---

## 🎯 UN Sustainable Development Goals

| SDG | How PharmaChain Contributes |
|-----|---------------------------|
| **SDG 3: Good Health & Well-Being** | Directly prevents counterfeit and degraded drugs from reaching patients |
| **SDG 9: Industry, Innovation & Infrastructure** | Builds resilient pharmaceutical supply chain infrastructure using AI + blockchain |
| **SDG 12: Responsible Consumption & Production** | Ensures drug quality and integrity throughout the production-to-patient lifecycle |

---

## 🏗️ Google Technologies Used

1. **Google Gemini 1.5 Flash** — Real-time AI anomaly detection, safety report generation, conversational supply chain assistant
2. **Google Cloud Platform** — Deployment target (Cloud Run for backend, Firebase for frontend hosting)

---

## 📁 Project Structure

```
pharmachain/
├── backend/
│   ├── app.py              # Flask application factory
│   ├── config.py           # Environment-based configuration
│   ├── models/             # SQLAlchemy models (User, DrugBatch, SensorLog, Alert)
│   ├── routes/             # API blueprints (auth, batches, alerts, chat)
│   ├── services/           # Core services
│   │   ├── gemini_service.py      # Gemini AI anomaly detection + chat
│   │   ├── blockchain_service.py  # Ethereum smart contract interaction
│   │   └── mqtt_service.py        # MQTT sensor data ingestion
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Batches, BatchDetail, Alerts, AuditLog, Login
│   │   ├── components/     # Reusable UI components
│   │   └── contexts/       # Auth + Socket.IO providers
│   └── Dockerfile
├── contracts/
│   └── PharmaChain.sol     # Solidity smart contract
├── iot_simulator/
│   └── sensor_publisher.py # MQTT sensor simulation
├── docker-compose.yml      # Full stack orchestration
├── demo.py                 # Automated CLI demo
└── SETUP.md                # Detailed setup guide
```

---

## 👥 Team

**Team Name:** [Your Team Name]

| Name | Role |
|------|------|
| [Member 1] | Full-Stack Developer |
| [Member 2] | AI/ML Engineer |
| [Member 3] | Blockchain Developer |
| [Member 4] | UI/UX Designer |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Google Solution Challenge 2026**

*Protecting pharmaceutical integrity, one batch at a time.*

</div>
