"""Production configuration guardrails."""

from __future__ import annotations

import pytest

from app.core.config import Settings
from app.core.startup_checks import collect_production_config_errors


def _prod_settings(**kwargs: object) -> Settings:
    base = dict(
        APP_ENV="production",
        DEBUG=False,
        JWT_SECRET_KEY="x" * 32,
        DATABASE_URL="postgresql+asyncpg://u:p@db.example.com:5432/app?ssl=require",
        SUPABASE_URL="https://abc123.supabase.co",
        SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake",
        SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service",
        OPENAI_API_KEY="sk-proj-" + "a" * 40,
        STRIPE_SECRET_KEY="sk_test_" + "b" * 40,
        STRIPE_WEBHOOK_SECRET="whsec_" + "c" * 32,
        STRIPE_PRICE_ID_SINGLE_EXPORT="price_" + "d" * 24,
        BACKEND_CORS_ORIGINS=["https://app.example.com"],
    )
    base.update(kwargs)
    return Settings(**base)


def test_production_valid_minimal() -> None:
    s = _prod_settings()
    assert collect_production_config_errors(s) == []


def test_production_rejects_debug() -> None:
    s = _prod_settings(DEBUG=True)
    assert any("DEBUG" in e for e in collect_production_config_errors(s))


def test_production_rejects_local_database() -> None:
    s = _prod_settings(DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/x")
    assert any("localhost" in e.lower() for e in collect_production_config_errors(s))


def test_production_rejects_placeholder_supabase() -> None:
    s = _prod_settings(SUPABASE_URL="https://your-project-ref.supabase.co")
    assert collect_production_config_errors(s)


def test_development_skips_strict_checks() -> None:
    s = Settings(APP_ENV="development", DEBUG=True)
    assert collect_production_config_errors(s) == []


def test_production_rejects_plain_http_cors() -> None:
    s = _prod_settings(BACKEND_CORS_ORIGINS=["http://app.example.com"])
    assert any("https" in e.lower() for e in collect_production_config_errors(s))


@pytest.mark.parametrize(
    "stripe_key",
    ["sk_test_replace_with_your_real_secret_key", "sk_test_", "not_a_key"],
)
def test_production_rejects_bad_stripe_secret(stripe_key: str) -> None:
    s = _prod_settings(STRIPE_SECRET_KEY=stripe_key)
    errs = collect_production_config_errors(s)
    assert any("STRIPE_SECRET_KEY" in e for e in errs)
