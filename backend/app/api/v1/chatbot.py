"""
Sentinel-AI — Chatbot API (Phase 7: Groq AI Guardian)
POST /api/v1/chat
Context-aware threat explanation powered by Groq LLaMA 3.3 70B.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from groq import Groq

from app.core.config import settings
from app.db.mongodb import mongodb

logger = logging.getLogger("sentinel.chatbot")

router = APIRouter(prefix="/chat", tags=["Chatbot"])


# ── Request / Response schemas ───────────────────────────────────────────

class ChatRequest(BaseModel):
    scan_id: str = Field(..., description="The scan to provide context for.")
    user_message: str = Field(..., min_length=1, description="The user's question.")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="The AI assistant's response.")
    scan_id: str = Field(..., description="The scan this response is about.")


# ── Endpoint ─────────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat_with_sentinel(request: ChatRequest):
    """
    Ask Sentinel-AI to explain a scan result in natural language.

    Flow:
      1. Validate that a Groq API key exists.
      2. Fetch the scan document from MongoDB.
      3. Build a context-rich system prompt with the scan data.
      4. Call Groq API (LLaMA 3.3 70B Versatile).
      5. Return the assistant's reply.
    """
    # ── 1. Check API key
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY not configured. Add it to your .env file.",
        )

    # ── 2. Fetch scan from MongoDB
    logger.info(f"💬 Chat request for scan_id={request.scan_id}")

    db = mongodb.database
    doc = await db.threat_events.find_one({"scan_id": request.scan_id}, {"_id": 0})

    if not doc:
        raise HTTPException(status_code=404, detail=f"Scan {request.scan_id} not found.")

    # ── 3. Build context from scan data
    explanations_text = "\n".join(
        f"  - {exp.get('indicator', 'Unknown')}: {exp.get('detail', 'N/A')} (weight: {exp.get('weight', 0):.0%})"
        for exp in doc.get("explanations", [])
    )

    scan_context = f"""
SCAN ID: {doc.get('scan_id', 'N/A')}
CONTENT TYPE: {doc.get('content_type', 'N/A')}
VERDICT: {doc.get('verdict', 'N/A')}
THREAT SCORE: {doc.get('threat_score', 0):.0%}
ML CONFIDENCE: {doc.get('ml_confidence', 'N/A')}
SENDER: {doc.get('sender', 'N/A')}
SUBJECT: {doc.get('subject', 'N/A')}
DETECTED INDICATORS:
{explanations_text if explanations_text else '  None detected.'}
""".strip()

    system_prompt = (
        "You are Sentinel-AI, a cybersecurity expert assistant embedded in a threat detection dashboard. "
        "Use the following scan data to explain the threat to the user. "
        "Explain what the indicators mean (both Heuristic rules and ML Semantic Score). "
        "If the threat score is high (≥35%), advise the user on protective steps "
        "(e.g., 'Do not click any links', 'Change your password', 'Report as phishing'). "
        "If the content is safe, reassure them briefly. "
        "Keep your answers concise — under 100 words. Use a professional but approachable tone.\n\n"
        f"--- SCAN DATA ---\n{scan_context}\n--- END SCAN DATA ---"
    )

    logger.info(f"   System prompt built ({len(system_prompt)} chars)")

    # ── 4. Call Groq API
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.user_message},
            ],
            temperature=0.6,
            max_tokens=200,
        )

        reply = completion.choices[0].message.content.strip()
        logger.info(f"   🤖 Groq replied ({len(reply)} chars)")

    except Exception as e:
        logger.error(f"   ❌ Groq API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")

    return ChatResponse(reply=reply, scan_id=request.scan_id)
