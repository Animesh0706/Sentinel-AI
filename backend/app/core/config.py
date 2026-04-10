"""
Sentinel-AI Configuration
Loads environment variables from .env using Pydantic BaseSettings.
"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    MONGODB_URL: str = "mongodb://localhost:27017"
    REDIS_URL: str = "redis://localhost:6379"

    APP_NAME: str = "Sentinel-AI"
    DEBUG: bool = True

    model_config = {
        "env_file": Path(__file__).resolve().parent.parent.parent / ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
