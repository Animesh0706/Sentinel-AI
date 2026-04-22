# Sentinel-AI: Platform Architecture & Implementation Plan

## 1. User Flow
**From Browser Extension Detection to Admin Dashboard Alert**
1. **Detection:** The Sentinel-AI browser extension passively monitors user activity (e.g., text inputs, media consumption, URL navigations).
2. **Local Pre-Processing:** The extension performs initial, lightweight anomaly detection on-device using quantized models and heuristics to ensure user privacy.
3. **Anonymized Ingestion:** If an artifact is classified as highly suspicious, it is anonymized (scrubbing PII) and sent securely via websockets/HTTPS to the backend API.
4. **Deep Analysis:** The backend orchestrates multi-modal AI analysis (NLP for phishing/misinformation, Computer Vision for deepfakes).
5. **Caching & DB Logging:** Results are cached in Redis to prevent redundant analysis of identical threats. Event logs and threat metrics are persistently stored in MongoDB.
6. **Dashboard Alert:** Critical threat alerts are pushed in real-time to the React-based admin dashboard, enabling security analysts to review and respond immediately.

## 2. Architecture
- **Backend (API):** FastAPI (Python) for asynchronous, high-performance web endpoints and seamless integration with ML models.
- **Frontend (Dashboard):** React with Tailwind CSS for clean, responsive, and rapid UI development.
- **Caching Layer:** Redis for real-time state management, rate limiting, and caching analysis results.
- **Database:** MongoDB Atlas M0 (Cloud) for flexible, high-volume document storage of threat telemetry, user configurations, and historical reporting. We will use the Motor library to handle asynchronous connections to the cluster.

## 3. AI Strategy
**Multi-modal Analysis Pipeline**
- **Text (Phishing & Misinformation):** Fine-tuned Hugging Face Transformers (e.g., RoBERTa/DistilBERT) for semantic analysis, sentiment evaluation, and identifying manipulative/coercive language.
- **Media (Deepfakes):** TensorFlow-based vision models (e.g., EfficientNet or custom CNNs) to detect facial inconsistencies, blending artifacts, and frequency-domain anomalies in images/videos.
- **Orchestration:** The FastAPI backend will serve these models using optimized runtimes (e.g., ONNX/TensorRT) to achieve low-latency inference.

## 4. Security
**Privacy-by-Design**
- **Local Processing First:** The extension relies heavily on on-device checks and bloom filters (for known malicious URLs/hashes) to minimize data exfiltration.
- **Aggressive Anonymization:** Any data sent to the cloud is aggressively scrubbed of Personally Identifiable Information (PII) before leaving the client.
- **Transport & Storage Security:** Enforced TLS 1.3 for all client-server communication. MongoDB documents will utilize field-level encryption for sensitive metadata.

## 5. Folder Structure
Standard Full-stack Monorepo Layout with a clear `/backend` separation:

```text
sentinel-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routes
│   │   ├── core/         # Config, security, DB connections
│   │   ├── models/       # Pydantic validation & MongoDB schemas
│   │   ├── services/     # Business logic & data flow integration
│   │   └── ai_engine/    # Hugging Face & TensorFlow model wrappers
│   ├── requirements.txt
│   ├── .env              # Environment variables (e.g., MONGODB_URL)
│   └── main.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable Tailwind UI components
│   │   ├── pages/        # Dashboard views
│   │   ├── hooks/        # React hooks (e.g., websockets, API calls)
│   │   └── utils/
│   ├── package.json
│   └── tailwind.config.js
├── extension/
│   ├── public/
│   ├── src/
│   │   ├── background/   # Service worker, local inference triggers
│   │   ├── content/      # Page DOM interaction
│   │   └── popup/        # User-facing extension UI
│   └── manifest.json
└── PLAN.md
```

## 6. Phase-based Roadmap

### Phase 1: Backend & DB Setup
- Initialize FastAPI project structure with routing.
- Create a `.env` file that specifically stores the `MONGODB_URL` (Atlas connection string) and other backend secrets.
- Set up MongoDB schemas (using Pydantic/Motor) for Threat Event logs.
- Integrate Redis for caching and rate-limiting.
- Create basic API skeleton (endpoints returning 200 OK stubs).

### Phase 2: Mock AI Logic & API Contracts
- Integrate stub Python services that simulate Hugging Face/TensorFlow inference logic.
- Define explicit JSON contracts for the Extension -> API -> Dashboard flow.
- Add robust data validation to ensure incoming payloads adhere to anonymization standards.

### Phase 3: Real-time Frontend Dashboard
- Scaffold React + Tailwind application.
- Build visual dashboard components (Charts, Real-time Alert Feeds, Threat Severity tables).
- Connect Dashboard to FastAPI websockets/polling to receive mocked threat data streams.
- Ensure performant rendering of large alert datasets.

### Phase 4: Browser Extension Prototype
- Scaffold Manifest V3 extension structure.
- Develop basic content script to monitor and capture simulated triggers (e.g., highlighting specific text or images).
- Implement background script to securely format and ship payloads to the FastAPI backend.
- End-to-End local testing by running the backend and Redis cache locally, alongside the frontend while connected to Atlas.
