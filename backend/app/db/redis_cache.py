"""
Sentinel-AI — Async Redis Cache
Manages the lifecycle of the redis.asyncio client for local caching.
"""

import redis.asyncio as aioredis
from app.core.config import settings


class RedisCache:
    """Wrapper around redis.asyncio for caching and rate-limiting."""

    client: aioredis.Redis | None = None

    async def connect(self) -> None:
        """Open the async Redis connection."""
        self.client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
        await self.client.ping()
        print(f"[✓] Redis connected — {settings.REDIS_URL}")

    async def disconnect(self) -> None:
        """Gracefully close the Redis connection."""
        if self.client:
            await self.client.close()
            print("[✗] Redis disconnected.")

    async def ping(self) -> bool:
        """Return True if Redis responds to PING."""
        try:
            return await self.client.ping()
        except Exception:
            return False


redis_cache = RedisCache()
