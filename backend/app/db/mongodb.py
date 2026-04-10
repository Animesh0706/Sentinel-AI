"""
Sentinel-AI — Async MongoDB Driver (Motor)
Manages the lifecycle of the Motor async client connected to MongoDB Atlas.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class MongoDB:
    """Wrapper around the Motor async client for MongoDB Atlas."""

    client: AsyncIOMotorClient | None = None
    db_name: str = "sentinel_ai"

    async def connect(self) -> None:
        """Open the Motor client connection."""
        import certifi
        self.client = AsyncIOMotorClient(settings.MONGODB_URL, tlsCAFile=certifi.where())
        # Force a connection attempt so we fail fast on bad URIs
        await self.client.admin.command("ping")
        print(f"[✓] MongoDB connected — cluster: {settings.MONGODB_URL[:30]}...")

    async def disconnect(self) -> None:
        """Gracefully close the Motor client."""
        if self.client:
            self.client.close()
            print("[✗] MongoDB disconnected.")

    async def ping(self) -> bool:
        """Return True if the cluster responds to a ping."""
        try:
            await self.client.admin.command("ping")
            return True
        except Exception:
            return False

    @property
    def database(self):
        """Return the default database handle."""
        return self.client[self.db_name]


mongodb = MongoDB()
