# Product Requirements Document (PRD)

## 1. Product Overview
**Product Name:** PharmaChain
**Tagline:** AI-Powered Decentralized Pharmaceutical Supply Chain
**Objective:** To provide a transparent, immutable, and intelligent supply chain ecosystem for pharmaceuticals. PharmaChain aims to eliminate counterfeit drugs, ensure proper storage conditions (cold-chain), and foster trust between manufacturers, regulators, pharmacies, and end-patients.

---

## 2. Target Audience & Value Proposition

### 2.1 Manufacturers
- **Needs:** Bulk batch registration, real-time tracking of goods in transit, immediate alerts on storage condition anomalies, and tools to recall compromised batches.
- **Value:** Reduces revenue loss from counterfeits, ensures compliance with global pharmaceutical regulations, and protects brand reputation.

### 2.2 Clients (Patients & Pharmacies)
- **Needs:** A simple way to verify the authenticity of a drug before consumption/sale, visibility into the drug's journey, and a channel to report suspicious items.
- **Value:** Guarantees health and safety by confirming drugs are genuine and haven't been subjected to adverse conditions during transit.

### 2.3 Regulators / Auditors
- **Needs:** Tamper-proof logs of all supply chain events for compliance auditing.
- **Value:** Significantly reduces the time and cost required to audit pharmaceutical companies through immutable blockchain records.

---

## 3. Core Features

### 3.1 Cross-Functional Features (Manufacturer & Client)
- **Public Provenance Verification (`VerifyDrug`):** End-users can enter a Batch ID (or scan a QR code) to instantly verify authenticity. Displays a full Supply Chain Timeline detailing checkpoints from manufacturing to delivery.
- **Counterfeit & Adverse Event Reporting:** Clients can submit official reports regarding suspected counterfeits or adverse reactions directly from the verification page, which instantly alerts the manufacturer's dashboard.

### 3.2 Manufacturer / Admin Features
- **Dashboard Analytics:** High-level overview of active shipments, AI-flagged anomalies, verified batches, and an overall Supply Chain "Trust Score".
- **Batch Inventory Management:** Register new batches directly onto the Ethereum blockchain, ensuring the genesis of the drug is irrevocably recorded.
- **AI Threat Detection (Alerts):** Gemini Flash Lite continuously monitors simulated IoT sensor data (e.g., temperature, humidity). If an anomaly occurs (like a temperature spike), the AI flags the batch and generates a critical alert.
- **AI Assistant Chatbot:** A Gemini-powered conversational interface allowing administrators to ask natural language questions about supply chain health (e.g., "Summarize the risk for Batch PC-2601").
- **Blockchain Audit Log:** A complete, tamper-proof historical record of all mints and transfers.

---

## 4. Technology Stack

PharmaChain is built with a modern, high-performance, and decentralized architecture tailored for the Google Solution Challenge 2026.

### 4.1 Frontend (Client & Admin Portals)
- **Framework:** React 18 with Vite for lightning-fast HMR and optimized builds.
- **Routing & State:** `react-router-dom` and `@tanstack/react-query` for robust server-state management.
- **Styling:** Vanilla CSS with custom CSS variables for a seamless, flicker-free Dual-Theme (Light/Dark) enterprise UI.
- **UI Components:** `framer-motion` for fluid micro-animations, `lucide-react` for iconography, and `recharts` for interactive dashboard analytics.

### 4.2 Backend (REST API)
- **Framework:** Python 3.13 with Flask.
- **Database:** SQLite (via Flask-SQLAlchemy) for relational data (users, alerts, sensor logs).
- **Authentication:** `Flask-JWT-Extended` for secure, role-based access control.

### 4.3 Artificial Intelligence
- **Model:** Google Gemini Flash Lite (Ultra-fast, optimized for real-time streams).
- **Integration:** Utilized for real-time sensor anomaly detection (interpreting raw IoT telemetry) and natural language processing in the AI Chatbot module.

### 4.4 Blockchain & Decentralization
- **Network:** Ethereum (Local Ganache used for the prototype).
- **Integration:** `web3.py` for interacting with smart contracts. Ensures all batch registrations and status updates are immutable.

### 4.5 IoT Simulation
- **Protocol:** MQTT.
- **Broker:** Eclipse Mosquitto (simulating real-time telemetry from transit vehicles and warehouses).

### 4.6 Cloud Deployment Architecture
- **Serverless Hosting:** Google Cloud Run.
- **Containerization:** A unified Docker container encapsulates both the built Vite frontend and the Flask API backend for seamless, highly scalable cloud execution.
- **CI/CD:** Google Cloud Build via `cloudbuild.yaml`.

---

## 5. Security & Privacy
- **API Keys:** Google Gemini API keys and Blockchain private keys are strictly isolated in local `.env` files and comprehensively ignored via `.gitignore` to prevent repository leakage.
- **Role-Based Access:** API routes strictly segregate manufacturer/admin functions from public client functions.
