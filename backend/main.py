"""
Sentinel-AI — Main Application Entry Point
Phase 6: Loads BERT-tiny model on startup via lifespan.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import mongodb
from app.db.redis_cache import redis_cache
from app.api.v1.scanner import router as scanner_router
from app.api.v1.integrity import router as integrity_router
from app.api.v1.chatbot import router as chatbot_router
from app.api.v1.auth import router as auth_router

# ── Logging config ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-22s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("sentinel.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup:
      1. Connect to MongoDB Atlas & Redis.
      2. Load BERT-tiny ML model into app.state (one-time).
    Shutdown:
      3. Disconnect databases.
    """
    logger.info(f"🚀 Starting {settings.APP_NAME}...")
    await mongodb.connect()
    await redis_cache.connect()

    # ── Load BERT-tiny model (Phase 6) ───────────────────────────────────
    logger.info("🤖 Loading BERT-tiny ML model (NumPy inference)...")
    try:
        from app.core.ml_model import load_bert_tiny
        model_pipeline = load_bert_tiny()
        app.state.model_pipeline = model_pipeline
        logger.info("✅ BERT-tiny model loaded successfully (pure NumPy).")
    except Exception as e:
        logger.warning(f"⚠️ Could not load ML model (will use heuristic-only): {e}")
        app.state.model_pipeline = None

    logger.info(f"✅ {settings.APP_NAME} is online.")
    yield
    logger.info(f"🛑 Shutting down {settings.APP_NAME}...")
    await mongodb.disconnect()
    await redis_cache.disconnect()


app = FastAPI(
    title=settings.APP_NAME,
    description="Cybersecurity threat detection platform — Phishing, Deepfakes, Misinformation.",
    version="0.6.0",
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
app.include_router(integrity_router, prefix="/api/v1")
app.include_router(chatbot_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    """
    Ping MongoDB, Redis, and check AI Model.
    Target response: {"status": "online", "mongodb": "connected", "redis": "connected", "ai_engine": "online"}
    """
    mongo_ok = await mongodb.ping()
    redis_ok = await redis_cache.ping()
    ai_ok = getattr(app.state, "model_pipeline", None) is not None

    return {
        "status": "online" if (mongo_ok and redis_ok) else "degraded",
        "mongodb": "connected" if mongo_ok else "disconnected",
        "redis": "connected" if redis_ok else "disconnected",
        "ai_engine": "online" if ai_ok else "offline",
    }
