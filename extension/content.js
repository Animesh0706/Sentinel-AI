/**
 * Sentinel-AI — Content Script (Phase 5 fix)
 * Detects context (Gmail, WhatsApp Web, generic page) and extracts
 * platform-specific data before forwarding to the background worker.
 * Uses SPA tracking & DOM polling to wait for elements to render.
 */

// ══════════════════════════════════════════════════════════════════════════
// ── SPA Navigation Tracking ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

let lastUrl = window.location.href;
const COOLDOWN_MS = 5000; // 5-second cooldown per unique URL

// Initial run
setTimeout(() => {
  runScanner(window.location.href);
}, 1000);

// Watch for URL changes (Single Page Applications)
const spaObserver = new MutationObserver(() => {
  if (!chrome.runtime?.id) {
    spaObserver.disconnect();
    return;
  }

  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("[Sentinel-AI] SPA Navigation detected:", currentUrl);
    // Wait for the new view framework to boot before scanning
    setTimeout(() => runScanner(currentUrl), 500);
  }
});
// Re-running on root body
if (document.body) {
  spaObserver.observe(document.body, { childList: true, subtree: true });
}

// ══════════════════════════════════════════════════════════════════════════
// ── Main Scanner Runner ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "FORCE_SCAN") {
    console.log("[Sentinel-AI] ⚡ Force scan requested by user.");
    runScanner(window.location.href, true);
  }
});

async function runScanner(currentUrl, force = false) {
  if (!chrome.runtime?.id) return;

  const hostname = window.location.hostname;

  // Skip non-http pages and local development servers
  if (!currentUrl.startsWith("http") || hostname === "localhost" || hostname === "127.0.0.1") return;

  // ── Cooldown check
  if (!force) {
    try {
      const stored = await chrome.storage.local.get("sentinel_last_scan");
      const last = stored.sentinel_last_scan || {};

      if (last.url === currentUrl && Date.now() - last.timestamp < COOLDOWN_MS) {
        console.log("[Sentinel-AI] Cooldown active — skipping scan for:", currentUrl);
        return;
      }
    } catch (e) {
      // Ignore storage errors safely
    }
  }

  // ── Context Detection & Extraction
  const payload = await detectContext(hostname, currentUrl);

  if (!payload || !payload.content) {
    console.log("[Sentinel-AI] No actionable content found on this page.");
    return;
  }

  // ── Send to background
  try {
    chrome.runtime.sendMessage(
      {
        type: "SENTINEL_SCAN",
        payload: payload,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("[Sentinel-AI] Could not reach background:", chrome.runtime.lastError.message);
          return;
        }
        console.log("[Sentinel-AI] Scan result:", response);
      }
    );
  } catch (err) {
    if (err.message.includes("Extension context invalidated")) {
      console.warn("[Sentinel-AI] Extension was reloaded. Please refresh this page.");
      return; 
    }
    console.error("[Sentinel-AI] Error communicating with background:", err);
  }

  // ── Update cooldown timestamp
  try {
    await chrome.storage.local.set({
      sentinel_last_scan: { url: currentUrl, timestamp: Date.now() },
    });
  } catch (e) {}
}

// ══════════════════════════════════════════════════════════════════════════
// ── Utility: Safe DOM Polling ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

function waitForElement(selector, timeout = 3000) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

// ══════════════════════════════════════════════════════════════════════════
// ── detectContext & Async Scrapers ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

async function detectContext(hostname, url) {
  if (hostname === "mail.google.com") {
    return await scrapeGmail(url);
  }
  if (hostname === "web.whatsapp.com") {
    return await scrapeWhatsApp(url);
  }
  return scrapeGenericPage(url);
}

// ── Gmail ───────────────────────────────────────────────────────────────
async function scrapeGmail(url) {
  try {
    // Wait up to 10 seconds for the main email text container to appear
    const bodyEl = await waitForElement("div.a3s.aiL", 10000);
    
    if (!bodyEl) {
      console.log("[Sentinel-AI] Gmail view detected but no open email parsed in time. Falling back.");
      return scrapeGenericPage(url);
    }

    // Since we now have the body, we can query subject and sender
    const subjectEl = document.querySelector("h2.hP");
    const subject = subjectEl ? subjectEl.textContent.trim() : "";

    const senderEl = document.querySelector("span.gD[email]") || document.querySelector("[data-hovercard-id]");
    let sender = "";
    if (senderEl) {
      sender = senderEl.getAttribute("email") || senderEl.getAttribute("data-hovercard-id") || senderEl.textContent.trim();
    }

    const body = bodyEl.innerText.substring(0, 3000);
    const content = `[Subject: ${subject}] [From: ${sender}] ${body}`;

    console.log("[Sentinel-AI] 📧 Gmail content extracted asynchronously:", { sender, subject, bodyLen: body.length });

    return {
      content: content,
      content_type: "email",
      source: "extension",
      url: url,
      title: subject || document.title,
      sender: sender || null,
      subject: subject || null,
    };
  } catch (e) {
    console.warn("[Sentinel-AI] Async Gmail scraping failed, falling back:", e.message);
    return scrapeGenericPage(url);
  }
}

// ── WhatsApp Web ────────────────────────────────────────────────────────
async function scrapeWhatsApp(url) {
  try {
    // Wait up to 15 seconds for at least one message bubble to load (WhatsApp is slow)
    // We try multiple generic selectors in case Meta obfuscates .message-in
    const msgEl = await waitForElement(".message-in, div[data-id], ._amk4", 15000);

    if (!msgEl) {
      console.log("[Sentinel-AI] WhatsApp Web but no messages loaded yet. Falling back.");
      return scrapeGenericPage(url);
    }

    // Try finding the last incoming message
    let incomingMessages = document.querySelectorAll(".message-in");
    let lastMessage = null;
    
    if (incomingMessages.length > 0) {
      lastMessage = incomingMessages[incomingMessages.length - 1];
    } else {
      // Obfuscated fallback: just grab the last message in the main panel
      const allMessages = document.querySelectorAll("div[data-id]");
      if (allMessages.length > 0) {
        lastMessage = allMessages[allMessages.length - 1];
      }
    }

    if (!lastMessage) return scrapeGenericPage(url);

    const textEl = lastMessage.querySelector("span.selectable-text")
                || lastMessage.querySelector("._ao3e")
                || lastMessage.querySelector("[dir='ltr']");

    const messageText = textEl ? textEl.innerText.trim() : "";

    if (!messageText) {
      console.log("[Sentinel-AI] WhatsApp message bubble empty. Falling back.");
      return scrapeGenericPage(url);
    }

    const headerEl = document.querySelector("header span[title]");
    const sender = headerEl ? headerEl.getAttribute("title") : "Unknown Contact";

    console.log("[Sentinel-AI] 💬 WhatsApp content extracted asynchronously!");

    return {
      content: `[From: ${sender}] ${messageText}`,
      content_type: "message",
      source: "extension",
      url: url,
      title: `WhatsApp: ${sender}`,
      sender: sender,
      subject: null,
    };
  } catch (e) {
    console.warn("[Sentinel-AI] Async WhatsApp scraping failed, falling back:", e.message);
    return scrapeGenericPage(url);
  }
}

// ── Generic Page ────────────────────────────────────────────────────────
function scrapeGenericPage(url) {
  const title = document.title || "";
  const bodyText = (document.body?.innerText || "").substring(0, 2000);
  const snippet = `[Title: ${title}] [URL: ${url}] ${bodyText}`;

  return {
    content: snippet,
    content_type: "url",
    source: "extension",
    url: url,
    title: title,
    sender: null,
    subject: null,
  };
}
