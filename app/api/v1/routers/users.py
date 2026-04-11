"""User profile endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.core.deps import CurrentAuthUser, DBSession
from app.core.exceptions import NotFoundException
from app.schemas.user import UserRead, UserUpdate
from app.services.user import UserService

router = APIRouter()


async def _get_or_sync_current_user(current_user: CurrentAuthUser, session) -> object:
    service = UserService(session)
    user_id = uuid.UUID(current_user.id)
    try:
        return await service.get(user_id)
    except NotFoundException:
        if not current_user.email:
            raise
        return await service.sync_auth_user(
            user_id=user_id,
            email=current_user.email,
            full_name=current_user.full_name,
        )


@router.get("/me")
async def get_current_user(current_user: CurrentAuthUser, session: DBSession) -> UserRead:
    user = await _get_or_sync_current_user(current_user, session)
    return UserRead.model_validate(user)


@router.patch("/me")
async def update_current_user(
    payload: UserUpdate,
    current_user: CurrentAuthUser,
    session: DBSession,
) -> UserRead:
    service = UserService(session)
    user_id = uuid.UUID(current_user.id)
    try:
        user = await service.update(user_id, payload)
    except NotFoundException:
        if not current_user.email:
            raise
        await service.sync_auth_user(
            user_id=user_id,
            email=current_user.email,
            full_name=current_user.full_name,
        )
        user = await service.update(user_id, payload)
    return UserRead.model_validate(user)
