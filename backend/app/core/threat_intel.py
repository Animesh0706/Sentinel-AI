"""
Sentinel-AI — Global Threat Intelligence Fusion
Integrates Google Safe Browsing and VirusTotal for URL reputation scoring.
"""

import base64
import logging
import httpx
from pydantic import HttpUrl

from app.core.config import settings

logger = logging.getLogger("sentinel.threat_intel")


async def check_google_safe_browsing(urls: list[str]) -> list[str]:
    """
    Check a list of URLs against Google Safe Browsing v4 API.
    Returns a list of URLs that are flagged as malicious.
    """
    if not settings.GOOGLE_SAFE_BROWSING_KEY or not urls:
        return []

    # Prepare v4 payload
    payload = {
        "client": {
            "clientId": settings.APP_NAME,
            "clientVersion": "0.6.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url} for url in urls]
        }
    }

    url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.GOOGLE_SAFE_BROWSING_KEY}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Extract matched URLs
            matches = data.get("matches", [])
            malicious_urls = [match["threat"]["url"] for match in matches]
            
            if malicious_urls:
                logger.warning(f"🚨 Google Safe Browsing flagged URLs: {malicious_urls}")
                
            return malicious_urls
            
    except Exception as e:
        logger.warning(f"⚠️ Google Safe Browsing API failed: {e}")
        return []


async def check_virustotal(url: str) -> dict:
    """
    Check a single URL's reputation score on VirusTotal v3 API.
    Returns stats dict e.g. {"malicious": 2, "suspicious": 1, "harmless": 50, "undetected": 10}
    """
    if not settings.VIRUSTOTAL_KEY or not url:
        return {}

    # VT v3 expects the URL to be base64url encoded without padding
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    
    headers = {
        "x-apikey": settings.VIRUSTOTAL_KEY
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(api_url, headers=headers)
            
            if response.status_code == 404:
                # 404 just means VT hasn't analyzed this URL yet
                return {}
                
            response.raise_for_status()
            data = response.json()
            
            stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            
            if stats.get("malicious", 0) > 0:
                logger.warning(f"🚨 VirusTotal flagged URL ({stats.get('malicious')} malicious votes): {url}")
                
            return stats
            
    except Exception as e:
        logger.warning(f"⚠️ VirusTotal API failed for url {url}: {e}")
        return {}
