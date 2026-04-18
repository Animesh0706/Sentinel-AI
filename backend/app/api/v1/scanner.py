"""
Sentinel-AI — Scanner API (v1)
Phase 6: Hybrid AI scoring + CIA Integrity hashing.
POST /scan endpoint with Redis caching and MongoDB persistence.
"""

import hashlib
import json
import logging
import re
import asyncio
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, Depends

from app.core.ai_engine import sentinel_brain
from app.core.security import calculate_integrity_hash
from app.core.threat_intel import check_google_safe_browsing, check_virustotal
from app.db.mongodb import mongodb
from app.db.redis_cache import redis_cache
from app.models.threat import ScanRequest, ScanResponse, ThreatExplanation
from app.core.auth import get_current_user, get_current_user_optional
from app.models.user import UserResponse

logger = logging.getLogger("sentinel.scanner")

router = APIRouter(prefix="/scan", tags=["Scanner"])

CACHE_TTL_SECONDS = 3600  # 1 hour


def _content_hash(content: str) -> str:
    """Deterministic SHA-256 hash for cache keying."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


@router.post("", response_model=ScanResponse)
async def scan_content(request: ScanRequest, req: Request, current_user: UserResponse | None = Depends(get_current_user_optional)):
    """
    Analyze content for phishing, misinformation, and other threats.

    Flow:
      1. Check Redis cache for a previous result.
      2. If miss → run SentinelBrain hybrid analysis (heuristic + ML).
      3. Compute integrity hash (CIA).
      4. Store result in MongoDB (threat_events collection).
      5. Cache result in Redis.
      6. Return XAI-enriched ScanResponse.
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

    logger.info(f"💨 Cache MISS — Checking Global Intel (Phase 8)...")

    # ── 1.5 Global Threat Intelligence (Phase 8) ─────────────────────────
    url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
    urls = url_pattern.findall(request.content)
    
    external_exps = []
    if urls:
        logger.info(f"🌍 Found {len(urls)} URLs. Fusing API logic...")
        tasks = [check_google_safe_browsing(urls)]
        for u in urls[:3]:  # Check up to 3 URLs with VT
            tasks.append(check_virustotal(u))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        gsb_malicious = results[0] if not isinstance(results[0], Exception) else []
        vt_results = results[1:]
        
        if gsb_malicious:
            external_exps.append({
                "indicator": "Google Safe Browsing Match",
                "weight": 1.0,
                "detail": f"URLs flagged as malicious by Google: {gsb_malicious}"
            })
            
        for i, vt_res in enumerate(vt_results):
            if not isinstance(vt_res, Exception) and isinstance(vt_res, dict):
                if vt_res.get("malicious", 0) > 0:
                    external_exps.append({
                        "indicator": "VirusTotal Match",
                        "weight": 1.0,
                        "detail": f"URL '{urls[i]}' flagged by {vt_res.get('malicious')} engines on VirusTotal."
                    })

    if external_exps:
        logger.warning(f"🚨 Global Intel flagged threat. Short-circuiting ML.")
        result = {
            "threat_score": 1.0,
            "verdict": "Malicious",
            "explanations": external_exps
        }
        ml_confidence = None
    else:
        # ── 2. Hybrid AI analysis (heuristic × 0.3 + ML × 0.7) ──────────────
        model_pipeline = getattr(req.app.state, "model_pipeline", None)
        ml_confidence = None
    
        try:
            if model_pipeline:
                result = sentinel_brain.hybrid_analyze(
                    content=request.content,
                    model_pipeline=model_pipeline,
                    content_type=request.content_type,
                    sender=request.sender,
                    subject=request.subject,
                )
                ml_confidence = result.get("ml_confidence")
            else:
                # Fallback: heuristic-only if model didn't load
                logger.warning("⚠️ ML model not available — using heuristic-only scoring.")
                result = sentinel_brain.analyze_content(
                    content=request.content,
                    content_type=request.content_type,
                    sender=request.sender,
                    subject=request.subject,
                )
        except Exception as e:
            logger.error(f"❌ SentinelBrain failed: {e}")
            raise HTTPException(status_code=500, detail="AI analysis engine error.")

    # ── 3. Build response ────────────────────────────────────────────────
    now = datetime.now(IST)
    now_str = str(now)  # exact string used for hashing

    # CIA Integrity: compute hash over content + timestamp + verdict
    integrity_hash = calculate_integrity_hash(
        content=content_key,
        timestamp=now_str,
        verdict=result["verdict"],
    )

    response = ScanResponse(
        scan_id=scan_id,
        threat_score=result["threat_score"],
        verdict=result["verdict"],
        content_type=request.content_type,
        explanations=[ThreatExplanation(**e) for e in result["explanations"]],
        cached=False,
        scanned_at=now,
        sender=request.sender,
        subject=request.subject,
        ml_confidence=ml_confidence,
        integrity_hash=integrity_hash,
    )

    # ── 4. Persist to MongoDB ────────────────────────────────────────────
    try:
        doc = response.model_dump()
        doc["content_hash"] = content_key
        doc["source"] = request.source
        doc["sender"] = request.sender
        doc["subject"] = request.subject
        doc["scanned_at"] = now
        doc["integrity_hash"] = integrity_hash
        doc["integrity_timestamp"] = now_str  # exact string for hash reproduction
        doc["ml_confidence"] = ml_confidence
        if current_user:
            doc["user_id"] = current_user.id

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

    logger.info(f"✅ Scan complete — verdict={response.verdict}, score={response.threat_score}, ml={ml_confidence}")
    return response


@router.get("s", response_model=list[ScanResponse], tags=["Scanner"])
async def get_scan_history(current_user: UserResponse = Depends(get_current_user)):
    """
    Fetch the last 20 scans from MongoDB Atlas, sorted newest first.
    """
    logger.info("📜 Fetching scan history from MongoDB...")
    try:
        db = mongodb.database
        cursor = db.threat_events.find(
            {"$or": [{"user_id": current_user.id}, {"user_id": {"$exists": False}}]},
            {"_id": 0},  # Exclude Mongo's _id field
        ).sort("scanned_at", -1).limit(20)

        results = await cursor.to_list(length=20)
        logger.info(f"📜 Returning {len(results)} historical scans.")
        return results
    except Exception as e:
        logger.error(f"❌ Failed to fetch history: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve scan history.")
