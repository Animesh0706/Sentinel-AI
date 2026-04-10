"""
Sentinel-AI — Main Application Entry Point
Uses FastAPI lifespan to manage async DB connections.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import mongodb
from app.db.redis_cache import redis_cache
from app.api.v1.scanner import router as scanner_router

# ── Logging config ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-22s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("sentinel.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect to MongoDB Atlas & Redis. Shutdown: disconnect."""
    logger.info(f"🚀 Starting {settings.APP_NAME}...")
    await mongodb.connect()
    await redis_cache.connect()
    logger.info(f"✅ {settings.APP_NAME} is online.")
    yield
    logger.info(f"🛑 Shutting down {settings.APP_NAME}...")
    await mongodb.disconnect()
    await redis_cache.disconnect()


app = FastAPI(
    title=settings.APP_NAME,
    description="Cybersecurity threat detection platform — Phishing, Deepfakes, Misinformation.",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Register routers ────────────────────────────────────────────────────
app.include_router(scanner_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    """
    Ping both MongoDB and Redis and return their connection status.
    Target response: {"status": "online", "mongodb": "connected", "redis": "connected"}
    """
    mongo_ok = await mongodb.ping()
    redis_ok = await redis_cache.ping()

    return {
        "status": "online" if (mongo_ok and redis_ok) else "degraded",
        "mongodb": "connected" if mongo_ok else "disconnected",
        "redis": "connected" if redis_ok else "disconnected",
    }
