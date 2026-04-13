"""Fail-fast validation when `APP_ENV=production` (before serving traffic)."""

from __future__ import annotations

from urllib.parse import urlparse

from app.core.config import Settings


def _jwt_too_weak(secret: str) -> bool:
    s = secret.strip()
    if len(s) < 32:
        return True
    low = s.lower()
    return "change" in low and "me" in low


def _database_url_is_local(database_url: str) -> bool:
    try:
        u = urlparse(database_url.replace("postgresql+asyncpg://", "postgresql://", 1))
    except ValueError:
        return True
    host = (u.hostname or "").lower()
    return host in {"", "localhost", "127.0.0.1", "::1"}


def _cors_origins_valid_for_production(origins: list[str]) -> list[str]:
    errors: list[str] = []
    if not origins:
        errors.append("BACKEND_CORS_ORIGINS must list at least one frontend origin in production.")
        return errors
    for o in origins:
        o = o.strip()
        if not o:
            continue
        if o.startswith("http://") and "localhost" not in o and "127.0.0.1" not in o:
            errors.append(
                f"In production, CORS origin should use https:// (except local dev): {o!r}",
            )
    return errors


def _stripe_key_suspicious(value: str) -> bool:
    v = value.strip()
    if not v.startswith(("sk_test_", "sk_live_")):
        return True
    low = v.lower()
    if "replace" in low or "your_" in low or "..." in v:
        return True
    # Real Stripe secret keys are longer than prefixes alone
    if len(v) < 40:
        return True
    return False


def _stripe_price_suspicious(value: str) -> bool:
    v = value.strip()
    if not v.startswith("price_"):
        return True
    low = v.lower()
    if "replace" in low or "..." in v:
        return True
    if len(v) < 20:
        return True
    return False


def _stripe_webhook_suspicious(value: str) -> bool:
    v = value.strip()
    if not v.startswith("whsec_"):
        return True
    low = v.lower()
    if "replace" in low or "..." in v:
        return True
    if len(v) < 20:
        return True
    return False


def collect_production_config_errors(settings: Settings) -> list[str]:
    """Return human-readable configuration problems. Empty means OK to boot."""
    if not settings.is_production:
        return []

    errors: list[str] = []

    if settings.DEBUG:
        errors.append("Set DEBUG=false (or 0) in production.")

    if _jwt_too_weak(settings.JWT_SECRET_KEY):
        errors.append("JWT_SECRET_KEY must be a strong secret (>= 32 characters, not a placeholder).")

    if _database_url_is_local(settings.DATABASE_URL):
        errors.append("DATABASE_URL must not point at localhost in production.")

    if not settings.supabase_configured:
        errors.append("Supabase URL and keys must be set to real values (not .env.example placeholders).")

    if not settings.OPENAI_API_KEY.strip():
        errors.append("OPENAI_API_KEY is required in production (AI features are part of the product).")

    if _stripe_key_suspicious(settings.STRIPE_SECRET_KEY):
        errors.append("STRIPE_SECRET_KEY must be a real Stripe secret key (sk_test_… or sk_live_…).")

    if _stripe_price_suspicious(settings.STRIPE_PRICE_ID_SINGLE_EXPORT):
        errors.append("STRIPE_PRICE_ID_SINGLE_EXPORT must be a real Stripe Price id (price_…).")

    if _stripe_webhook_suspicious(settings.STRIPE_WEBHOOK_SECRET):
        errors.append("STRIPE_WEBHOOK_SECRET must be a real webhook signing secret (whsec_…).")

    errors.extend(_cors_origins_valid_for_production(settings.BACKEND_CORS_ORIGINS))

    return errors


def assert_production_config_or_exit(settings: Settings) -> None:
    problems = collect_production_config_errors(settings)
    if not problems:
        return
    joined = "\n  - ".join([""] + problems)
    raise RuntimeError(f"Invalid production configuration:{joined}")
