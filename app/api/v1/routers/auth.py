"""Authentication endpoints – register, login, refresh."""

from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.core.deps import CurrentAuthUser, DBSession
from app.core.exceptions import BadRequestException, ConflictException, UnauthorizedException
from app.core.supabase import get_supabase_auth_client
from app.schemas.auth import LoginRequest, TokenPair
from app.schemas.user import UserCreate, UserRead
from app.services.user import UserService

router = APIRouter()


def _full_name_from_auth_user(auth_user) -> str | None:
    metadata = auth_user.user_metadata if isinstance(auth_user.user_metadata, dict) else {}
    full_name = metadata.get("full_name")
    return full_name if isinstance(full_name, str) else None


def _map_auth_exception(exc: Exception, *, fallback: str):
    detail = str(exc).strip() or fallback
    lowered = detail.lower()
    if "already" in lowered and ("registered" in lowered or "exists" in lowered):
        raise ConflictException(detail) from exc
    if "invalid login credentials" in lowered or "email not confirmed" in lowered:
        raise UnauthorizedException(detail) from exc
    raise BadRequestException(detail) from exc


@router.post("/register", status_code=201)
async def register(payload: UserCreate, session: DBSession) -> UserRead:
    try:
        auth_response = get_supabase_auth_client().auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
                "options": {"data": {"full_name": payload.full_name}},
            }
        )
    except Exception as exc:
        _map_auth_exception(exc, fallback="Could not create account.")

    auth_user = auth_response.user
    if auth_user is None or not auth_user.email:
        raise BadRequestException("Supabase sign-up did not return a valid user.")

    user = await UserService(session).sync_auth_user(
        user_id=uuid.UUID(auth_user.id),
        email=auth_user.email,
        full_name=_full_name_from_auth_user(auth_user) or payload.full_name,
    )
    return UserRead.model_validate(user)


@router.post("/login")
async def login(payload: LoginRequest, session: DBSession) -> TokenPair:
    try:
        auth_response = get_supabase_auth_client().auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )
    except Exception as exc:
        _map_auth_exception(exc, fallback="Invalid email or password.")

    auth_user = auth_response.user
    auth_session = auth_response.session
    if auth_user is None or auth_session is None or not auth_user.email:
        raise UnauthorizedException("Invalid email or password.")

    await UserService(session).sync_auth_user(
        user_id=uuid.UUID(auth_user.id),
        email=auth_user.email,
        full_name=_full_name_from_auth_user(auth_user),
    )

    return TokenPair(
        access_token=auth_session.access_token,
        refresh_token=auth_session.refresh_token,
        token_type=auth_session.token_type or "bearer",
    )


@router.post("/sync")
async def sync_authenticated_user(current_user: CurrentAuthUser, session: DBSession) -> UserRead:
    if not current_user.email:
        raise UnauthorizedException("Authenticated Supabase user is missing an email address.")

    user = await UserService(session).sync_auth_user(
        user_id=uuid.UUID(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
    )
    return UserRead.model_validate(user)
