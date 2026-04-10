"""Authentication endpoints – register, login, refresh."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.deps import DBSession
from app.core.exceptions import UnauthorizedException
from app.core.security import create_access_token, create_refresh_token
from app.schemas.auth import LoginRequest, TokenPair
from app.schemas.user import UserCreate, UserRead
from app.services.user import UserService

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
async def register(payload: UserCreate, session: DBSession) -> UserRead:
    user = await UserService(session).register(payload)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, session: DBSession) -> TokenPair:
    user = await UserService(session).authenticate(payload.email, payload.password)
    if user is None:
        raise UnauthorizedException("Invalid email or password.")
    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )
