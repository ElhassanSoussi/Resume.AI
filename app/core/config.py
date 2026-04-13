from __future__ import annotations

from pathlib import Path
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def _is_placeholder(value: str) -> bool:
    normalized = value.strip().lower()
    return normalized in {
        "",
        "https://your-project-ref.supabase.co",
        "your-public-anon-key",
        "your-service-role-key",
    }


def _is_stripe_placeholder(value: str, *, exact_placeholders: set[str]) -> bool:
    normalized = value.strip()
    lowered = normalized.lower()
    if lowered == "" or "..." in normalized or "replace" in lowered:
        return True
    return lowered in exact_placeholders


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────
    APP_NAME: str = "ResumeForge AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # ── Server ───────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/resumeforge"
    DATABASE_ECHO: bool = False
    AUTO_CREATE_SCHEMA: bool = True

    # ── Supabase ─────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""


    # ── Auth / JWT ───────────────────────────────────────
    JWT_SECRET_KEY: str = "CHANGE_ME"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── AI (OpenAI-compatible) ───────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    AI_REQUEST_TIMEOUT_SECONDS: float = 60.0
    AI_MAX_RETRIES: int = 3
    AI_RETRY_BACKOFF_BASE_SECONDS: float = 0.5
    AI_TEMPERATURE: float = 0.2
    AI_MAX_OUTPUT_TOKENS_SUMMARY: int = 800
    AI_MAX_OUTPUT_TOKENS_EXPERIENCE: int = 1200
    AI_MAX_OUTPUT_TOKENS_OPTIMIZE: int = 4096

    # ── Stripe ───────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID_SINGLE_EXPORT: str = ""

    # ── Storage / PDF exports ──────────────────────────────
    EXPORT_STORAGE_ROOT: Path = BASE_DIR / "data" / "exports"
    """Root directory for generated PDFs (local filesystem; swap for S3-compatible backend later)."""

    SUPABASE_EXPORTS_BUCKET: str = "resume-exports"
    SUPABASE_STORAGE_SIGNED_URL_EXPIRES_SECONDS: int = 3600

    PUBLIC_FILES_BASE_URL: str = ""
    """Optional base URL for building public links, e.g. https://cdn.example.com/exports"""

    # ── Logging ──────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = False

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.strip("[]").split(",")]
        return v

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_flag(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            normalized = v.strip().lower()
            if normalized in {"1", "true", "t", "yes", "y", "on", "debug", "development"}:
                return True
            if normalized in {"0", "false", "f", "no", "n", "off", "release", "production"}:
                return False
        return bool(v)

    @field_validator("EXPORT_STORAGE_ROOT", mode="before")
    @classmethod
    def parse_export_root(cls, v: Any) -> Path:
        if isinstance(v, Path):
            return v
        return Path(str(v))

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def supabase_configured(self) -> bool:
        return bool(
            not _is_placeholder(self.SUPABASE_URL)
            and not _is_placeholder(self.SUPABASE_ANON_KEY)
            and not _is_placeholder(self.SUPABASE_SERVICE_ROLE_KEY)
        )

    @property
    def supabase_storage_configured(self) -> bool:
        return bool(self.supabase_configured and self.SUPABASE_EXPORTS_BUCKET.strip())

    @property
    def ai_configured(self) -> bool:
        return bool(self.OPENAI_API_KEY.strip())

    @property
    def stripe_secret_key_configured(self) -> bool:
        return not _is_stripe_placeholder(
            self.STRIPE_SECRET_KEY,
            exact_placeholders={"sk_test_", "sk_live_"},
        )

    @property
    def stripe_price_configured(self) -> bool:
        return not _is_stripe_placeholder(
            self.STRIPE_PRICE_ID_SINGLE_EXPORT,
            exact_placeholders={"price_"},
        )

    @property
    def stripe_webhook_configured(self) -> bool:
        return not _is_stripe_placeholder(
            self.STRIPE_WEBHOOK_SECRET,
            exact_placeholders={"whsec_"},
        )

    @property
    def stripe_checkout_config_errors(self) -> list[str]:
        errors: list[str] = []
        if not self.stripe_secret_key_configured:
            errors.append("STRIPE_SECRET_KEY")
        if not self.stripe_price_configured:
            errors.append("STRIPE_PRICE_ID_SINGLE_EXPORT")
        return errors

    @property
    def stripe_webhook_config_errors(self) -> list[str]:
        errors: list[str] = []
        if not self.stripe_webhook_configured:
            errors.append("STRIPE_WEBHOOK_SECRET")
        return errors

    @property
    def stripe_configured(self) -> bool:
        return not self.stripe_checkout_config_errors


settings = Settings()
