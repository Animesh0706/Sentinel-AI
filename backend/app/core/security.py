"""
Sentinel-AI — Security Utilities (CIA Integrity)
SHA-256 integrity hashing for tamper detection on scan records.
"""

import hashlib
import logging

logger = logging.getLogger("sentinel.security")


def calculate_integrity_hash(content: str, timestamp: str, verdict: str) -> str:
    """
    Compute a SHA-256 integrity hash over the critical fields of a scan record.

    This hash is stored alongside the record in MongoDB. If any of these fields
    are tampered with after the fact, recalculating the hash will produce a
    different value, exposing the tampering.

    Args:
        content: The original scanned content.
        timestamp: ISO-format timestamp string of the scan.
        verdict: The verdict string (Safe / Suspicious / Malicious).

    Returns:
        A hex-encoded SHA-256 digest string.
    """
    combined = f"{content}|{timestamp}|{verdict}"
    digest = hashlib.sha256(combined.encode("utf-8")).hexdigest()
    logger.info(f"🔐 Integrity hash computed: {digest[:16]}...")
    return digest
