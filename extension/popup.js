/**
 * Sentinel-AI — Popup Script
 * Reads the last scan result from chrome.storage and displays it.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("lastResult");
  const scanBtn = document.getElementById("scanBtn");

  scanBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "FORCE_SCAN" });
      scanBtn.textContent = "Scanning...";
      setTimeout(() => { scanBtn.textContent = "FORCE SCAN PAGE"; }, 2000);
    });
  });

  try {
    const stored = await chrome.storage.local.get("sentinel_last_result");
    const result = stored.sentinel_last_result;

    if (!result) {
      el.textContent = "No scans yet. Browse a page to trigger analysis.";
      return;
    }

    const verdictClass =
      result.verdict === "Safe"
        ? "safe"
        : result.verdict === "Suspicious"
        ? "suspicious"
        : "malicious";

    el.innerHTML = `
      <div class="verdict ${verdictClass}">${result.verdict} — ${(result.threat_score * 100).toFixed(0)}%</div>
      <div>Type: ${result.content_type} | Factors: ${result.explanations?.length || 0}</div>
    `;
  } catch (err) {
    el.textContent = "Could not load last result.";
  }
});
