from __future__ import annotations

from functools import lru_cache
import uuid

from supabase import Client, create_client

from app.core.config import settings


def _ensure_supabase_url() -> str:
    url = settings.SUPABASE_URL.strip()
    if not url:
        raise RuntimeError("Supabase auth is not configured. Set SUPABASE_URL.")
    return url


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    url = _ensure_supabase_url()
    service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY.strip()
    if not service_role_key:
        raise RuntimeError(
            "Supabase service client is not configured. Set SUPABASE_SERVICE_ROLE_KEY."
        )

    return create_client(url, service_role_key)


@lru_cache(maxsize=1)
def get_supabase_auth_client() -> Client:
    url = _ensure_supabase_url()
    anon_key = settings.SUPABASE_ANON_KEY.strip()
    if not anon_key:
        raise RuntimeError("Supabase auth client is not configured. Set SUPABASE_ANON_KEY.")

    return create_client(url, anon_key)


def upsert_supabase_user_profile(*, user_id: uuid.UUID, email: str, full_name: str) -> None:
    get_supabase_client().table("users").upsert(
        {
            "id": str(user_id),
            "email": email,
            "full_name": full_name,
            "is_active": True,
            "is_pro": False,
        },
        on_conflict="id",
    ).execute()
