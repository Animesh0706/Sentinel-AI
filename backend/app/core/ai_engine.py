"""
Sentinel-AI — Hybrid AI Engine (SentinelBrain)
Phase 6: Combines heuristic analysis (30%) with BERT-tiny ML classification (70%).
"""

import re
import logging

logger = logging.getLogger("sentinel.brain")


class SentinelBrain:
    """
    Hybrid intelligence engine combining:
    - Rule-based heuristic scanning (urgency, social engineering, URLs, etc.)
    - BERT-tiny ML classification for semantic spam/threat detection
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
        r"https?://(?!(?:www\.)?(?:google|github|stackoverflow|microsoft|apple)\.(?:com|org|net)\b)[^\s]+",
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

    # ── OmniHeuristics: Platform-Specific Rules (Phase 5) ────────────────
    EMAIL_THREAT_KEYWORDS = [
        "account suspension", "verify identity", "urgent action required",
        "password expired", "unauthorized login", "confirm your payment",
        "invoice attached", "reset your password", "unusual sign-in",
        "billing information", "account terminated", "final warning",
    ]

    MESSAGE_THREAT_KEYWORDS = [
        "otp", "send money", "qr code", "upi", "bank transfer",
        "share code", "pin number", "payment link", "google pay",
        "phonepe", "paytm", "cash prize", "lottery winner",
        "forward this", "share with contacts",
    ]

    def analyze_content(self, content: str, content_type: str = "text",
                        sender: str = None, subject: str = None) -> dict:
        """
        Pure heuristic analysis — returns threat_score, verdict, explanations.
        This method is UNTOUCHED from Phase 5.
        """
        logger.info("═" * 60)
        logger.info("🧠 SentinelBrain — HEURISTIC ANALYSIS")
        logger.info(f"   Content type : {content_type}")
        logger.info(f"   Content len  : {len(content)} chars")
        if sender:
            logger.info(f"   Sender       : {sender}")
        if subject:
            logger.info(f"   Subject      : {subject}")
        logger.info(f"   Preview      : {content[:80]}...")
        logger.info("═" * 60)

        explanations: list[dict] = []
        searchable = content.lower()
        if subject:
            searchable = f"{subject.lower()} {searchable}"

        # ── 1. Urgency scan
        urgency_hits = [kw for kw in self.URGENCY_KEYWORDS if kw in searchable]
        if urgency_hits:
            weight = min(0.35, len(urgency_hits) * 0.12)
            explanations.append({
                "indicator": "Urgency language",
                "weight": round(weight, 2),
                "detail": f"Detected {len(urgency_hits)} urgency trigger(s): {urgency_hits}",
            })
            logger.info(f"   🔴 URGENCY    → {len(urgency_hits)} hits [+{weight:.2f}]")

        # ── 2. Social engineering scan
        social_hits = [kw for kw in self.SOCIAL_ENGINEERING_KEYWORDS if kw in searchable]
        if social_hits:
            weight = min(0.30, len(social_hits) * 0.10)
            explanations.append({
                "indicator": "Social engineering",
                "weight": round(weight, 2),
                "detail": f"Detected {len(social_hits)} manipulation phrase(s): {social_hits}",
            })
            logger.info(f"   🟠 SOCIAL ENG → {len(social_hits)} hits [+{weight:.2f}]")

        # ── 3. Suspicious URL scan
        url_matches = self.SUSPICIOUS_URL_PATTERN.findall(content)
        if url_matches:
            weight = min(0.40, len(url_matches) * 0.20)
            explanations.append({
                "indicator": "Suspicious URL",
                "weight": round(weight, 2),
                "detail": f"Found {len(url_matches)} suspicious URL(s): {url_matches[:3]}",
            })
            logger.info(f"   🔗 SUSP URL   → {len(url_matches)} hits [+{weight:.2f}]")

        # ── 4. Obfuscation scan
        for pattern, label in self.OBFUSCATION_PATTERNS:
            if pattern.search(content):
                explanations.append({
                    "indicator": "Obfuscation technique",
                    "weight": 0.15,
                    "detail": label,
                })
                logger.info(f"   🕵️ OBFUSCATE  → {label} [+0.15]")

        # ── 5. Misinformation scan
        misinfo_hits = [kw for kw in self.MISINFO_KEYWORDS if kw in searchable]
        if misinfo_hits:
            weight = min(0.25, len(misinfo_hits) * 0.10)
            explanations.append({
                "indicator": "Misinformation language",
                "weight": round(weight, 2),
                "detail": f"Detected {len(misinfo_hits)} misinformation cue(s): {misinfo_hits}",
            })
            logger.info(f"   📰 MISINFO    → {len(misinfo_hits)} hits [+{weight:.2f}]")

        # ── 6. OmniHeuristics: Email-specific scan
        if content_type == "email":
            email_hits = [kw for kw in self.EMAIL_THREAT_KEYWORDS if kw in searchable]
            if email_hits:
                weight = min(0.35, len(email_hits) * 0.12)
                explanations.append({
                    "indicator": "Email threat pattern",
                    "weight": round(weight, 2),
                    "detail": f"Detected {len(email_hits)} email-specific threat(s): {email_hits}",
                })
                logger.info(f"   📧 EMAIL THR  → {len(email_hits)} hits [+{weight:.2f}]")

            if sender and sender.count("@") == 1:
                domain = sender.split("@")[1].lower()
                trusted_domains = ["google.com", "gmail.com", "outlook.com", "microsoft.com",
                                   "apple.com", "amazon.com", "paypal.com", "yahoo.com"]
                if domain not in trusted_domains and any(kw in searchable for kw in ["verify", "suspend", "urgent", "password"]):
                    explanations.append({
                        "indicator": "Untrusted sender",
                        "weight": 0.20,
                        "detail": f"Sender domain '{domain}' is not in the trusted list, combined with suspicious keywords.",
                    })
                    logger.info(f"   📧 BAD SENDER → {domain} [+0.20]")

        # ── 7. OmniHeuristics: Message-specific scan
        if content_type == "message":
            msg_hits = [kw for kw in self.MESSAGE_THREAT_KEYWORDS if kw in searchable]
            if msg_hits:
                weight = min(0.40, len(msg_hits) * 0.15)
                explanations.append({
                    "indicator": "Messaging threat pattern",
                    "weight": round(weight, 2),
                    "detail": f"Detected {len(msg_hits)} messaging threat(s): {msg_hits}",
                })
                logger.info(f"   💬 MSG THREAT → {len(msg_hits)} hits [+{weight:.2f}]")

        # ── Aggregate heuristic score
        threat_score = min(1.0, round(sum(e["weight"] for e in explanations), 2))

        if threat_score >= 0.7:
            verdict = "Malicious"
        elif threat_score >= 0.35:
            verdict = "Suspicious"
        else:
            verdict = "Safe"

        logger.info("─" * 60)
        logger.info(f"   📊 HEURISTIC SCORE : {threat_score}")
        logger.info(f"   🏷️  VERDICT         : {verdict}")
        logger.info("═" * 60)

        return {
            "threat_score": threat_score,
            "verdict": verdict,
            "explanations": explanations,
        }

    # ══════════════════════════════════════════════════════════════════════
    # ── Phase 6: Hybrid Analysis (Heuristic × 0.3 + ML × 0.7) ───────────
    # ══════════════════════════════════════════════════════════════════════

    def hybrid_analyze(self, content: str, model_pipeline,
                       content_type: str = "text",
                       sender: str = None, subject: str = None) -> dict:
        """
        Hybrid threat analysis combining heuristic rules with BERT-tiny ML.

        Scoring formula:
            final_score = (heuristic_score × 0.3) + (ml_confidence × 0.7)

        Args:
            content: Raw text to analyze.
            model_pipeline: The HuggingFace text-classification pipeline.
            content_type: One of text, url, email, message.
            sender: Optional sender.
            subject: Optional email subject.

        Returns:
            dict with: threat_score, verdict, explanations[], ml_confidence
        """
        # ── Step 1: Run full heuristic analysis (untouched)
        heuristic_result = self.analyze_content(
            content=content,
            content_type=content_type,
            sender=sender,
            subject=subject,
        )
        heuristic_score = heuristic_result["threat_score"]
        explanations = heuristic_result["explanations"]

        # ── Step 2: Run BERT-tiny ML classification
        ml_confidence = 0.0
        try:
            # Truncate for the model (BERT-tiny has 512 token limit)
            ml_input = content[:512]
            prediction = model_pipeline.predict(ml_input)

            # The model returns: {"label": "LABEL_0" (ham) or "LABEL_1" (spam), "score": float}
            if prediction:
                label = prediction["label"]
                score = prediction["score"]

                # LABEL_1 = spam/threat, LABEL_0 = ham/safe
                if label == "LABEL_1":
                    ml_confidence = round(score, 4)
                else:
                    ml_confidence = round(1.0 - score, 4)

                explanations.append({
                    "indicator": "Semantic analysis (BERT-tiny)",
                    "weight": round(ml_confidence * 0.7, 2),
                    "detail": f"ML model classified content as {'spam/threat' if label == 'LABEL_1' else 'safe'} "
                              f"with {score:.1%} confidence. Raw label: {label}",
                })

            logger.info(f"   🤖 ML CONFIDENCE : {ml_confidence:.4f}")

        except Exception as e:
            logger.warning(f"   ⚠️ ML pipeline failed (using heuristic-only): {e}")
            ml_confidence = 0.0

        # ── Step 3: Compute hybrid weighted score
        final_score = min(1.0, round((heuristic_score * 0.3) + (ml_confidence * 0.7), 2))

        if final_score >= 0.7:
            verdict = "Malicious"
        elif final_score >= 0.35:
            verdict = "Suspicious"
        else:
            verdict = "Safe"

        logger.info("═" * 60)
        logger.info(f"   🧬 HYBRID SCORING")
        logger.info(f"      Heuristic : {heuristic_score} × 0.3 = {heuristic_score * 0.3:.2f}")
        logger.info(f"      ML        : {ml_confidence} × 0.7 = {ml_confidence * 0.7:.2f}")
        logger.info(f"      FINAL     : {final_score}")
        logger.info(f"      VERDICT   : {verdict}")
        logger.info("═" * 60)

        return {
            "threat_score": final_score,
            "verdict": verdict,
            "explanations": explanations,
            "ml_confidence": ml_confidence,
        }


# Singleton instance
sentinel_brain = SentinelBrain()
