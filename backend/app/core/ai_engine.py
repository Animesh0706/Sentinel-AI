"""
Sentinel-AI — Mock AI Engine (SentinelBrain)
Phase 2: Regex & keyword-based threat analysis with Explainable AI output.
"""

import re
import logging

logger = logging.getLogger("sentinel.brain")


class SentinelBrain:
    """
    Mock intelligence engine that simulates multi-modal threat detection.
    Uses regex patterns and keyword dictionaries to produce XAI-style results.
    """

    # ── Phishing indicators ──────────────────────────────────────────────
    URGENCY_KEYWORDS = [
        "urgent", "immediately", "act now", "expires", "suspended",
        "verify your account", "confirm your identity", "unauthorized",
        "security alert", "limited time",
    ]

    SOCIAL_ENGINEERING_KEYWORDS = [
        "click here", "click below", "log in", "update your",
        "dear customer", "dear user", "congratulations", "you have won",
        "inheritance", "prince", "lottery",
    ]

    SUSPICIOUS_URL_PATTERN = re.compile(
        r"https?://(?!(?:www\.)?(?:google|github|stackoverflow|microsoft|apple)\.\w+)[^\s]+",
        re.IGNORECASE,
    )

    OBFUSCATION_PATTERNS = [
        (re.compile(r"[a-zA-Z0-9]{30,}\.(?:com|net|org|xyz|top|info)", re.IGNORECASE), "Abnormally long domain"),
        (re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"), "Raw IP address in URL"),
        (re.compile(r"bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy", re.IGNORECASE), "URL shortener detected"),
    ]

    # ── Misinformation indicators ────────────────────────────────────────
    MISINFO_KEYWORDS = [
        "exposed", "they don't want you to know", "mainstream media",
        "cover-up", "leaked", "shocking truth", "wake up",
        "banned video", "censored",
    ]

    def analyze_content(self, content: str, content_type: str = "text") -> dict:
        """
        Analyze content for threats and return an XAI result dict.

        Returns:
            dict with keys: threat_score, verdict, explanations[]
        """
        logger.info("═" * 60)
        logger.info("🧠 SentinelBrain — ANALYSIS STARTED")
        logger.info(f"   Content type : {content_type}")
        logger.info(f"   Content len  : {len(content)} chars")
        logger.info(f"   Preview      : {content[:80]}...")
        logger.info("═" * 60)

        explanations: list[dict] = []
        content_lower = content.lower()

        # ── 1. Urgency scan ──────────────────────────────────────────────
        urgency_hits = [kw for kw in self.URGENCY_KEYWORDS if kw in content_lower]
        if urgency_hits:
            weight = min(0.35, len(urgency_hits) * 0.12)
            explanation = {
                "indicator": "Urgency language",
                "weight": round(weight, 2),
                "detail": f"Detected {len(urgency_hits)} urgency trigger(s): {urgency_hits}",
            }
            explanations.append(explanation)
            logger.info(f"   🔴 URGENCY    → {explanation['detail']} [+{weight:.2f}]")

        # ── 2. Social engineering scan ───────────────────────────────────
        social_hits = [kw for kw in self.SOCIAL_ENGINEERING_KEYWORDS if kw in content_lower]
        if social_hits:
            weight = min(0.30, len(social_hits) * 0.10)
            explanation = {
                "indicator": "Social engineering",
                "weight": round(weight, 2),
                "detail": f"Detected {len(social_hits)} manipulation phrase(s): {social_hits}",
            }
            explanations.append(explanation)
            logger.info(f"   🟠 SOCIAL ENG → {explanation['detail']} [+{weight:.2f}]")

        # ── 3. Suspicious URL scan ───────────────────────────────────────
        url_matches = self.SUSPICIOUS_URL_PATTERN.findall(content)
        if url_matches:
            weight = min(0.40, len(url_matches) * 0.20)
            explanation = {
                "indicator": "Suspicious URL",
                "weight": round(weight, 2),
                "detail": f"Found {len(url_matches)} suspicious URL(s): {url_matches[:3]}",
            }
            explanations.append(explanation)
            logger.info(f"   🔗 SUSP URL   → {explanation['detail']} [+{weight:.2f}]")

        # ── 4. Obfuscation scan ──────────────────────────────────────────
        for pattern, label in self.OBFUSCATION_PATTERNS:
            if pattern.search(content):
                weight = 0.15
                explanation = {
                    "indicator": "Obfuscation technique",
                    "weight": weight,
                    "detail": label,
                }
                explanations.append(explanation)
                logger.info(f"   🕵️ OBFUSCATE  → {label} [+{weight:.2f}]")

        # ── 5. Misinformation scan ───────────────────────────────────────
        misinfo_hits = [kw for kw in self.MISINFO_KEYWORDS if kw in content_lower]
        if misinfo_hits:
            weight = min(0.25, len(misinfo_hits) * 0.10)
            explanation = {
                "indicator": "Misinformation language",
                "weight": round(weight, 2),
                "detail": f"Detected {len(misinfo_hits)} misinformation cue(s): {misinfo_hits}",
            }
            explanations.append(explanation)
            logger.info(f"   📰 MISINFO    → {explanation['detail']} [+{weight:.2f}]")

        # ── Aggregate score ──────────────────────────────────────────────
        threat_score = min(1.0, round(sum(e["weight"] for e in explanations), 2))

        if threat_score >= 0.7:
            verdict = "Malicious"
        elif threat_score >= 0.35:
            verdict = "Suspicious"
        else:
            verdict = "Safe"

        logger.info("─" * 60)
        logger.info(f"   📊 SCORE   : {threat_score}")
        logger.info(f"   🏷️  VERDICT : {verdict}")
        logger.info(f"   📝 FACTORS : {len(explanations)}")
        logger.info("═" * 60)

        return {
            "threat_score": threat_score,
            "verdict": verdict,
            "explanations": explanations,
        }


# Singleton instance
sentinel_brain = SentinelBrain()
