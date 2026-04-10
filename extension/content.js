/**
 * Sentinel-AI — Content Script
 * Runs at document_idle on every page.
 * Extracts page metadata and a text snippet, then forwards to the background
 * service worker. Includes a per-URL cooldown to avoid spamming the backend.
 */

(async () => {
  const COOLDOWN_MS = 5000; // 5-second cooldown per unique URL

  const currentUrl = window.location.href;

  // ── Skip non-http pages (chrome://, about:, extensions, etc.) ─────────
  if (!currentUrl.startsWith("http")) return;

  // ── Cooldown: check if we already scanned this URL recently ───────────
  try {
    const stored = await chrome.storage.local.get("sentinel_last_scan");
    const last = stored.sentinel_last_scan || {};

    if (last.url === currentUrl && Date.now() - last.timestamp < COOLDOWN_MS) {
      console.log("[Sentinel-AI] Cooldown active — skipping scan for:", currentUrl);
      return;
    }
  } catch (e) {
    // storage may not be available in some contexts — continue anyway
  }

  // ── Extract page content ──────────────────────────────────────────────
  const title = document.title || "";
  const bodyText = (document.body?.innerText || "").substring(0, 2000); // first 2000 chars
  const snippet = `[Title: ${title}] [URL: ${currentUrl}] ${bodyText}`;

  // ── Send to background service worker ─────────────────────────────────
  chrome.runtime.sendMessage(
    {
      type: "SENTINEL_SCAN",
      payload: {
        content: snippet,
        content_type: "text",
        source: "extension",
        url: currentUrl,
        title: title,
      },
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[Sentinel-AI] Could not reach background:", chrome.runtime.lastError.message);
        return;
      }
      console.log("[Sentinel-AI] Scan result:", response);
    }
  );

  // ── Update cooldown timestamp ─────────────────────────────────────────
  try {
    await chrome.storage.local.set({
      sentinel_last_scan: { url: currentUrl, timestamp: Date.now() },
    });
  } catch (e) {
    // non-critical
  }
})();
