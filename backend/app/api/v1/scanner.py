"""
Sentinel-AI — Scanner API (v1)
POST /scan endpoint with Redis caching and MongoDB persistence.
"""

import hashlib
import json
import logging
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.core.ai_engine import sentinel_brain
from app.db.mongodb import mongodb
from app.db.redis_cache import redis_cache
from app.models.threat import ScanRequest, ScanResponse, ThreatExplanation

logger = logging.getLogger("sentinel.scanner")

router = APIRouter(prefix="/scan", tags=["Scanner"])

CACHE_TTL_SECONDS = 3600  # 1 hour


def _content_hash(content: str) -> str:
    """Deterministic SHA-256 hash for cache keying."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


@router.post("", response_model=ScanResponse)
async def scan_content(request: ScanRequest):
    """
    Analyze content for phishing, misinformation, and other threats.

    Flow:
      1. Check Redis cache for a previous result.
      2. If miss → run SentinelBrain analysis.
      3. Store result in MongoDB (threat_events collection).
      4. Cache result in Redis.
      5. Return XAI-enriched ScanResponse.
    """
    content_key = _content_hash(request.content)
    scan_id = str(uuid4())

    logger.info(f"📥 Incoming scan request — id={scan_id}, type={request.content_type}, hash={content_key[:12]}...")

    # ── 1. Redis cache lookup ────────────────────────────────────────────
    try:
        cached_raw = await redis_cache.client.get(f"scan:{content_key}")
    except Exception as e:
        logger.warning(f"⚠️  Redis read failed: {e}")
        cached_raw = None

    if cached_raw:
        logger.info(f"⚡ Cache HIT for hash {content_key[:12]}")
        cached_data = json.loads(cached_raw)
        cached_data["scan_id"] = scan_id
        cached_data["cached"] = True
        return ScanResponse(**cached_data)

    logger.info(f"💨 Cache MISS — invoking SentinelBrain...")

    # ── 2. AI analysis ───────────────────────────────────────────────────
    try:
        result = sentinel_brain.analyze_content(
            content=request.content,
            content_type=request.content_type,
        )
    except Exception as e:
        logger.error(f"❌ SentinelBrain failed: {e}")
        raise HTTPException(status_code=500, detail="AI analysis engine error.")

    # ── 3. Build response ────────────────────────────────────────────────
    now = datetime.now(IST)
    response = ScanResponse(
        scan_id=scan_id,
        threat_score=result["threat_score"],
        verdict=result["verdict"],
        content_type=request.content_type,
        explanations=[ThreatExplanation(**e) for e in result["explanations"]],
        cached=False,
        scanned_at=now,
    )

    # ── 4. Persist to MongoDB ────────────────────────────────────────────
    try:
        doc = response.model_dump()
        doc["content_hash"] = content_key
        doc["source"] = request.source
        doc["scanned_at"] = now

        db = mongodb.database
        insert_result = await db.threat_events.insert_one(doc)
        logger.info(f"💾 Saved to MongoDB — _id={insert_result.inserted_id}")
    except Exception as e:
        logger.error(f"⚠️  MongoDB write failed (non-fatal): {e}")

    # ── 5. Cache in Redis ────────────────────────────────────────────────
    try:
        cache_payload = response.model_dump(mode="json")
        await redis_cache.client.setex(
            f"scan:{content_key}",
            CACHE_TTL_SECONDS,
            json.dumps(cache_payload),
        )
        logger.info(f"📦 Cached in Redis — TTL={CACHE_TTL_SECONDS}s")
    except Exception as e:
        logger.warning(f"⚠️  Redis write failed (non-fatal): {e}")

    logger.info(f"✅ Scan complete — verdict={response.verdict}, score={response.threat_score}")
    return response


@router.get("s", response_model=list[ScanResponse], tags=["Scanner"])
async def get_scan_history():
    """
    Fetch the last 20 scans from MongoDB Atlas, sorted newest first.
    """
    logger.info("📜 Fetching scan history from MongoDB...")
    try:
        db = mongodb.database
        cursor = db.threat_events.find(
            {},
            {"_id": 0},  # Exclude Mongo's _id field
        ).sort("scanned_at", -1).limit(20)

        results = await cursor.to_list(length=20)
        logger.info(f"📜 Returning {len(results)} historical scans.")
        return results
    except Exception as e:
        logger.error(f"❌ Failed to fetch history: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve scan history.")
