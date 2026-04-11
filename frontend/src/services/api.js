import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Mock Initial History in case endpoint doesn't exist
export const mockHistory = [
  {
    scan_id: "scan-123",
    scanned_at: new Date().toISOString(),
    content_type: "email",
    threat_score: 0.85,
    verdict: "Malicious",
    ml_confidence: 0.92,
    integrity_hash: "abc123",
    explanations: [
      { indicator: "Urgency language", weight: 0.35, detail: "Detected 2 urgency trigger(s): ['urgent', 'suspended']" },
      { indicator: "Social engineering", weight: 0.10, detail: "Detected 1 manipulation phrase(s): ['click here']" },
      { indicator: "Suspicious URL", weight: 0.40, detail: "Found 1 suspicious URL(s): ['http://evil-phishing.xyz/login']" }
    ]
  },
  {
    scan_id: "scan-124",
    scanned_at: new Date(Date.now() - 60000).toISOString(),
    content_type: "text",
    threat_score: 0.15,
    verdict: "Safe",
    ml_confidence: 0.05,
    integrity_hash: "def456",
    explanations: [
      { indicator: "Obfuscation technique", weight: 0.15, detail: "URL shortener detected" }
    ]
  },
  {
    scan_id: "scan-125",
    scanned_at: new Date(Date.now() - 120000).toISOString(),
    content_type: "text",
    threat_score: 0.45,
    verdict: "Suspicious",
    ml_confidence: 0.55,
    integrity_hash: "ghi789",
    explanations: [
      { indicator: "Misinformation language", weight: 0.25, detail: "Detected 2 misinformation cue(s): ['shocking truth', 'exposed']" },
      { indicator: "Urgency language", weight: 0.20, detail: "Detected 2 urgency trigger(s): ['act now']" }
    ]
  }
];

export const checkHealth = async () => {
  try {
    const res = await axios.get('http://localhost:8000/health');
    return res.data;
  } catch (err) {
    return { status: "offline" };
  }
};

export const fetchScanHistory = async () => {
  try {
    const res = await api.get('/scans');
    return res.data;
  } catch (err) {
    console.warn("⚠️ Could not fetch scan history, using mock data:", err.message);
    return mockHistory;
  }
};

export const verifyIntegrity = async (scanId) => {
  try {
    const res = await api.get(`/integrity/verify/${scanId}`);
    return res.data;
  } catch (err) {
    console.warn("⚠️ Integrity check failed:", err.message);
    return { is_tampered: null, status: "Check failed" };
  }
};
