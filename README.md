<div align="center">

# 🛡️ PharmaChain

### AI-Powered Decentralized Pharmaceutical Supply Chain

[![Google Solution Challenge 2026](https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=for-the-badge&logo=google)](https://hack2skill.com/event/solution-challenge-2026)
[![Gemini AI](https://img.shields.io/badge/Gemini%20Flash%20Lite-Powered-FF6F00?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Run-4285F4?style=for-the-badge&logo=google-cloud)](https://cloud.google.com/run)
[![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-3C3C3D?style=for-the-badge&logo=ethereum)](https://ethereum.org)

[![SDG 3](https://img.shields.io/badge/SDG%203-Good%20Health%20%26%20Well--Being-4C9F38?style=flat-square)](https://sdgs.un.org/goals/goal3)
[![SDG 9](https://img.shields.io/badge/SDG%209-Industry%2C%20Innovation-F36D25?style=flat-square)](https://sdgs.un.org/goals/goal9)
[![SDG 12](https://img.shields.io/badge/SDG%2012-Responsible%20Production-BF8B2E?style=flat-square)](https://sdgs.un.org/goals/goal12)

</div>

---

## 🌍 Problem Statement

The WHO estimates that **1 in 10 medical products** in low- and middle-income countries is substandard or falsified. Counterfeit and degraded pharmaceuticals cause an estimated **1 million deaths per year**, including 250,000 children from fake antimalarials alone.

The core challenges are:

1. **No Provenance Verification** — Paper-based tracking is easily forged. Patients and regulators cannot verify drug authenticity.
2. **Reactive Quality Control** — Current systems detect problems *after* patients have already consumed degraded medicine.
3. **Complex Data Analysis** — Supply chains generate massive amounts of audit logs that are impossible to parse manually.

---

## 💡 Our Solution

PharmaChain is a **full-stack enterprise platform** that combines **Google Gemini AI** and **blockchain verification** to create a transparent, real-time pharmaceutical supply chain guardian.

### Key Features

| Feature | Description |
|---------|------------|
| 🧠 **AI Anomaly Detection** | Gemini 1.5 analyzes batch history and audit logs to assign integrity scores and detect supply chain risks. |
| ⛓️ **Blockchain Provenance** | Every batch registration and status change is immutably recorded via smart contracts (simulated for demo). |
| 💬 **AI Chat Interface** | Conversational Gemini AI — ask questions about any drug batch, flag statuses, and get contextual compliance answers. |
| 🔍 **Public Provenance Verification** | End-users (patients/pharmacies) can enter a Batch ID to see the full historical timeline and verify authenticity. |
| 🚨 **Counterfeit Reporting** | Public clients can report suspected counterfeits or adverse reactions, instantly generating a high-priority alert on the manufacturer's dashboard. |
| 📊 **High-Fidelity Dashboard** | Professional logistics dashboard featuring a real-world SDG Impact Panel, gradient area charts, and dual Light/Dark themes. |
| 🔐 **Role-Based Access** | JWT authentication tailored for Manufacturers, Distributors, and Regulators. |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **AI** | Google Gemini Flash Lite (anomaly detection, reports, chat) |
| **Backend** | Python, Flask, JWT, SQLAlchemy |
| **Frontend** | React 19, Vite, TailwindCSS, Framer Motion, Recharts |
| **Blockchain** | Simulated Ethereum ledger (extensible to Web3) |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+** & **pip**
- **Node.js 18+** & **npm**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pharmachain.git
cd pharmachain

# Install Python backend dependencies
pip install -r backend/requirements.txt

# Install React frontend dependencies
cd frontend && npm install && cd ..
```

### Configuration

1. Create backend `.env`:
```bash
# Windows
copy backend\.env.example backend\.env
# Mac/Linux
cp backend/.env.example backend/.env
```

2. Add your **Gemini API key** (free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)):
```env
GEMINI_API_KEY=your_key_here
```

### Run

```bash
# Terminal 1: API server
cd backend && python run.py

# Terminal 2: React app
cd frontend && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## 🎯 UN Sustainable Development Goals

| SDG | How PharmaChain Contributes |
|-----|---------------------------|
| **SDG 3: Good Health & Well-Being** | Directly prevents counterfeit and degraded drugs from reaching patients |
| **SDG 9: Industry, Innovation & Infrastructure** | Builds resilient pharmaceutical supply chain infrastructure using AI + blockchain |
| **SDG 12: Responsible Consumption & Production** | Ensures drug quality and integrity throughout the production-to-patient lifecycle |

---

## 🏗️ Google Technologies Used

1. **Google Gemini Flash Lite** — Real-time AI anomaly detection, safety report generation, and conversational supply chain assistant (`/api/chat` and `/api/alerts`).
2. **Google Cloud Run & Cloud Build** — Native `cloudbuild.yaml` and production `Dockerfile` provided for instant, serverless deployment to Google Cloud Platform.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">

**Built with ❤️ for the Google Solution Challenge 2026**

*Protecting pharmaceutical integrity, one batch at a time.*

</div>
