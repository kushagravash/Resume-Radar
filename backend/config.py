"""
config.py — Centralized Application Configuration
==================================================
Uses pydantic-settings to load all configuration from the .env file.
This is the SINGLE SOURCE OF TRUTH for all settings in the application.

Every setting that could vary between environments (dev/staging/prod) or
contain a secret MUST be defined here — never hardcoded elsewhere.

Usage:
    from config import get_settings
    settings = get_settings()
    print(settings.DATABASE_URL)
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables / .env file.
    pydantic-settings automatically reads from the .env file in the
    working directory and validates types.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore any extra env vars not defined here
    )

    # ── Database ──────────────────────────────────────────────────────────────
    # SQLite by default. Change to postgresql://... in .env for production.
    DATABASE_URL: str = "sqlite:///./app.db"

    # ── JWT Authentication ────────────────────────────────────────────────────
    # REQUIRED: Must be set in .env. Generate with:
    #   python -c "import secrets; print(secrets.token_hex(32))"
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    # Token lifespan in minutes (default: 24 hours = 1440 minutes)
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # ── CORS ──────────────────────────────────────────────────────────────────
    # The URL of your Next.js frontend. Only this origin will be allowed.
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # ── File Upload Limits ────────────────────────────────────────────────────
    # 5 MB default (5 * 1024 * 1024 bytes)
    MAX_FILE_SIZE_BYTES: int = 5_242_880

    # ── Application Behavior ─────────────────────────────────────────────────
    APP_ENV: str = "development"
    # Set to True to see SQL queries in the terminal (useful in dev only)
    DEBUG: bool = False

    # ── Email Verification ────────────────────────────────────────────────────
    # Base URL used when constructing simulated verification links
    VERIFY_BASE_URL: str = "http://localhost:8000"

    # ── SMTP Configuration ────────────────────────────────────────────────────
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Returns a cached singleton of Settings.
    Uses lru_cache so the .env file is only read once on application startup.
    """
    return Settings()
