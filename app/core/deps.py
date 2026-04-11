"""Shared FastAPI dependency functions."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header
from supabase import Client
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.supabase import get_supabase_client
from app.services.ai_service import AIService

DBSession = Annotated[AsyncSession, Depends(get_db)]


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str | None = None
    full_name: str | None = None


def _get_supabase_client_dep() -> Client:
    return get_supabase_client()


SupabaseClientDep = Annotated[Client, Depends(_get_supabase_client_dep)]


def get_current_auth_user(authorization: str = Header(...)) -> AuthenticatedUser:
    """Extract and validate the authenticated Supabase user."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise UnauthorizedException()

    try:
        user = get_supabase_client().auth.get_user(token).user
    except Exception as exc:
        raise UnauthorizedException(detail=str(exc)) from exc

    user_id = user.id if user is not None else None
    if user_id is None:
        raise UnauthorizedException()

    metadata = user.user_metadata if isinstance(user.user_metadata, dict) else {}
    full_name = metadata.get("full_name") if isinstance(metadata.get("full_name"), str) else None
    email = user.email if isinstance(user.email, str) else None

    return AuthenticatedUser(
        id=str(user_id),
        email=email,
        full_name=full_name,
    )


CurrentAuthUser = Annotated[AuthenticatedUser, Depends(get_current_auth_user)]


def get_current_user_id(current_user: CurrentAuthUser) -> str:
    return current_user.id


CurrentUserID = Annotated[str, Depends(get_current_user_id)]


def get_ai_service() -> AIService:
    """Return a configured AI service (raises 503 if API key missing)."""
    return AIService.default()


AIServiceDep = Annotated[AIService, Depends(get_ai_service)]
