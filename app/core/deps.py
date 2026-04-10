"""Shared FastAPI dependency functions."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_token
from app.services.ai_service import AIService

DBSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract and validate the user id from a Bearer token.

    This is a stub that will be expanded once auth is fully wired.
    """
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise UnauthorizedException()
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise UnauthorizedException(detail=str(exc)) from exc
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise UnauthorizedException()
    return user_id


CurrentUserID = Annotated[str, Depends(get_current_user_id)]


def get_ai_service() -> AIService:
    """Return a configured AI service (raises 503 if API key missing)."""
    return AIService.default()


AIServiceDep = Annotated[AIService, Depends(get_ai_service)]
