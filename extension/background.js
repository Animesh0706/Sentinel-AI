/**
 * Sentinel-AI — Background Service Worker (Manifest V3)
 * Listens for messages from the content script and forwards them
 * to the FastAPI backend at POST /api/v1/scan.
 */

const API_URL = "http://localhost:8000/api/v1/scan";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SENTINEL_SCAN") return;

  const { content, content_type, source } = message.payload;

  console.log("[Sentinel-AI BG] Received scan request from tab:", sender.tab?.url);

  // Use fetch() to POST to the backend (async in service worker)
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, content_type, source }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("[Sentinel-AI BG] Verdict:", data.verdict, "| Score:", data.threat_score);

      // Store the latest result so the popup can display it
      chrome.storage.local.set({ sentinel_last_result: data });

      sendResponse({ success: true, data });
    })
    .catch((err) => {
      console.error("[Sentinel-AI BG] Scan failed:", err.message);
      sendResponse({ success: false, error: err.message });
    });

  // Return true to indicate we will respond asynchronously
  return true;
});
