"""
Sentinel-AI — Integrity Verification API (CIA Triad)
GET /api/v1/integrity/verify/{scan_id}
Recalculates the SHA-256 hash and compares with the stored hash.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.security import calculate_integrity_hash
from app.db.mongodb import mongodb

logger = logging.getLogger("sentinel.integrity")

router = APIRouter(prefix="/integrity", tags=["Integrity"])


class IntegrityResponse(BaseModel):
    scan_id: str
    is_tampered: bool
    stored_hash: str | None
    recalculated_hash: str
    status: str


@router.get("/verify/{scan_id}", response_model=IntegrityResponse)
async def verify_integrity(scan_id: str):
    """
    Verify the integrity of a stored scan record by recalculating
    its SHA-256 hash and comparing it against the stored hash.

    Returns is_tampered = True if the hashes don't match.
    """
    logger.info(f"🔍 Integrity check requested for scan_id={scan_id}")

    db = mongodb.database
    doc = await db.threat_events.find_one({"scan_id": scan_id}, {"_id": 0})

    if not doc:
        raise HTTPException(status_code=404, detail=f"Scan {scan_id} not found.")

    # Recalculate the hash from the stored fields
    content = doc.get("content_hash", "")
    # Use the exact timestamp string that was used during original signing
    timestamp = doc.get("integrity_timestamp", str(doc.get("scanned_at", "")))
    verdict = doc.get("verdict", "")

    recalculated = calculate_integrity_hash(content, timestamp, verdict)
    stored = doc.get("integrity_hash")

    is_tampered = stored != recalculated

    status = "⚠️ INTEGRITY BREACH DETECTED" if is_tampered else "✅ DATA VERIFIED"
    logger.info(f"   Result: {status} | stored={stored and stored[:16]}... | recalc={recalculated[:16]}...")

    return IntegrityResponse(
        scan_id=scan_id,
        is_tampered=is_tampered,
        stored_hash=stored,
        recalculated_hash=recalculated,
        status=status,
    )
