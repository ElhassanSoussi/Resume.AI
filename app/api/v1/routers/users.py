"""User profile endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.core.deps import CurrentUserID, DBSession
from app.schemas.user import UserRead, UserUpdate
from app.services.user import UserService

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_current_user(user_id: CurrentUserID, session: DBSession) -> UserRead:
    user = await UserService(session).get(uuid.UUID(user_id))
    return UserRead.model_validate(user)


@router.patch("/me", response_model=UserRead)
async def update_current_user(
    payload: UserUpdate,
    user_id: CurrentUserID,
    session: DBSession,
) -> UserRead:
    user = await UserService(session).update(uuid.UUID(user_id), payload)
    return UserRead.model_validate(user)
