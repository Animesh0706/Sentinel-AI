"""
Sentinel-AI — Pydantic Schemas for Threat Scanning
Defines the API contract for the /scan endpoint.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ScanRequest(BaseModel):
    """Incoming payload from the browser extension or direct API call."""

    content: str = Field(
        ...,
        min_length=1,
        description="The raw text content to analyze for threats.",
        examples=["URGENT: Your account has been compromised! Click http://evil.phish.net to verify."],
    )
    content_type: str = Field(
        default="text",
        description="Type of content being scanned.",
        examples=["text", "url", "email"],
    )
    source: Optional[str] = Field(
        default=None,
        description="Origin of the content (e.g., 'extension', 'api', 'dashboard').",
        examples=["extension"],
    )


class ThreatExplanation(BaseModel):
    """A single XAI reasoning step."""

    indicator: str = Field(..., description="What was detected.")
    weight: float = Field(..., ge=0, le=1, description="How much this indicator contributed to the score.")
    detail: str = Field(..., description="Human-readable explanation.")


class ScanResponse(BaseModel):
    """Explainable AI result returned to the caller."""

    scan_id: str = Field(..., description="Unique identifier for this scan.")
    threat_score: float = Field(..., ge=0, le=1, description="Overall threat score (0 = safe, 1 = critical).")
    verdict: str = Field(..., description="Human-readable verdict: Safe, Suspicious, or Malicious.")
    content_type: str = Field(..., description="Type of content that was scanned.")
    explanations: list[ThreatExplanation] = Field(
        default_factory=list,
        description="List of XAI reasoning steps explaining the verdict.",
    )
    cached: bool = Field(default=False, description="Whether this result was served from cache.")
    scanned_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of the scan.")
