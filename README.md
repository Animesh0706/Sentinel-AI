<div align="center">
  
  # Sentinel-AI 🛡️

  **Next-Generation Cybersecurity Threat Intelligence Platform**
  
  Detecting Phishing, Misinformation, and Anomalies in Real-Time using Hybrid AI.

  ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
  ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

</div>

---

## 🌟 Overview

**Sentinel-AI** is a robust, end-to-end platform engineered to protect users from modern web threats such as sophisticated phishing campaigns, deepfakes, and malicious URLs. By leveraging a multi-modal analysis pipeline that combines on-device heuristics with a cloud-based Hybrid AI scoring system (powered by BERT-tiny), Sentinel-AI delivers real-time threat intelligence right to your browser and aggregates data into a powerful security dashboard.

---

## 🔥 Key Features

- **🧠 Hybrid AI Threat Scoring**: Fuses heuristic pattern matching with an onboard **BERT-tiny Machine Learning Model** for high-precision semantic analysis of web content and text.
- **🌍 Global Threat Intelligence**: Real-time integration with **Google Safe Browsing** and **VirusTotal** APIs to instantly flag known malicious URLs and IP addresses.
- **🔐 CIA Triad Enforcement**: Ensures data **Integrity** using cryptographic hashing, validating that threat logs and verdicts are completely tamper-proof.
- **⚡ Blazing Fast Architecture**: Built on an asynchronous **FastAPI** backend with **Redis** caching to eliminate redundant analysis and ensure millisecond response times.
- **💎 Premium Dashboard UI**: An aesthetic, dark-mode, glassmorphic React frontend featuring **Framer Motion** micro-animations and **Tailwind CSS**.
- **🧩 Browser Extension**: An unobtrusive Manifest V3 browser extension acting as the first line of defense, scanning pages on the fly and reporting anomalies securely to the backend.

---

## 🏗️ Architecture & Tech Stack

Sentinel-AI is organized as a full-stack monorepo with clear separation of concerns.

### 🌐 Frontend (React Dashboard)
* **Framework:** React 19 + Vite
* **Styling:** Tailwind CSS v4 + Vanilla CSS + Glassmorphism UI
* **Animations & Icons:** Framer Motion, Lucide React
* **State & Networking:** Axios, Context API, JWT authentication

### ⚙️ Backend (API & ML Engine)
* **Framework:** FastAPI (Python)
* **AI/ML:** HuggingFace Transformers (`BERT-tiny`), ONNX Runtime
* **Databases:** **MongoDB Atlas** (persistent threat logs) & **Redis** (high-speed caching & rate limiting)
* **Security:** bcrypt, PyJWT, custom CIA Integrity Hash calculations

### 🔌 Browser Extension
* **Architecture:** Manifest V3
* **Flow:** Scans the active tab DOM elements passively, scrubs PII, and sends anonymized payloads for cloud analysis.

---

## 📂 Project Structure

```text
Sentinel-AI/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # API Route handlers (Auth, Scanner, Integrity)
│   │   ├── core/             # AI Engine, Threat Intel, and Config
│   │   ├── db/               # MongoDB Motor & Redis Cache clients
│   │   └── models/           # Pydantic Schemas
│   ├── main.py               # Uvicorn entry point
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React Unified Dashboard
│   ├── src/
│   │   ├── components/       # Visual UI components & Layouts
│   │   ├── services/         # API integration
│   │   ├── App.jsx           # Main views and Auth routing
│   │   └── index.css         # Global aesthetics and standard design tokens
│   └── package.json          # Vite and node modules config 
│
└── extension/                # Manifest V3 Implementation
    ├── background.js         # Service workers for threat relay
    ├── content.js            # DOM Parsing & local intelligence
    ├── manifest.json
    └── popup.html            # Extension GUI
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Active MongoDB Atlas Cluster
- Redis Server (local or cloud)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Create a .env file with your specific variables
# MONGODB_URL=...
# REDIS_URL=...
# JWT_SECRET=...

uvicorn main:app --reload
```
*The api endpoints will be available at `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will be available at `http://localhost:5173`*

### 3. Extension Setup
1. Open Google Chrome or any Chromium-based browser.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the `/extension` directory in this repository.

---

## 🔒 Privacy by Design

Sentinel-AI is built with maximum data privacy in mind:
- **No PII Sent to Cloud:** Data sent via the extension is rigorously scrubbed on-device prior to transmission.
- **Ephemerality:** The API processes data in memory and only logs strictly required threat metadata into MongoDB MongoDB.

---

<div align="center">
  <i>Defending the web, one byte at a time.</i>
</div>
