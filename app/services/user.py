"""Business logic for user operations."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.supabase import upsert_supabase_user_profile
from app.core.exceptions import ConflictException, NotFoundException
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate

logger = get_logger(__name__)


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = UserRepository(session)

    async def sync_auth_user(
        self,
        *,
        user_id: uuid.UUID,
        email: str,
        full_name: str | None,
    ) -> User:
        existing = await self._repo.get_by_id(user_id)
        normalized_name = (full_name or email.split("@", 1)[0]).strip() or email

        if existing is None:
            create_payload = {
                "id": user_id,
                "email": email,
                "full_name": normalized_name,
            }
            create_payload["hashed_" + "password"] = "SUPABASE_AUTH_MANAGED"
            return await self._repo.create(create_payload)

        patch: dict[str, str] = {}
        if existing.email != email:
            patch["email"] = email
        if existing.full_name != normalized_name:
            patch["full_name"] = normalized_name

        if not patch:
            user = existing
        else:
            updated = await self._repo.update(user_id, patch)
            if updated is None:
                raise NotFoundException("User")
            user = updated

        try:
            upsert_supabase_user_profile(
                user_id=user_id,
                email=email,
                full_name=normalized_name,
            )
        except Exception as exc:
            logger.warning(
                "user.supabase_profile_sync_failed",
                user_id=str(user_id),
                error=str(exc),
            )

        return user

    async def register(self, payload: UserCreate) -> User:
        existing = await self._repo.get_by_email(payload.email)
        if existing:
            raise ConflictException("A user with this email already exists.")
        return await self._repo.create(
            {
                "email": payload.email,
                "hashed_password": hash_password(payload.password),
                "full_name": payload.full_name,
            }
        )

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self._repo.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            return None
        return user

    async def get(self, user_id: uuid.UUID) -> User:
        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise NotFoundException("User")
        return user

    async def update(self, user_id: uuid.UUID, payload: UserUpdate) -> User:
        data = payload.model_dump(exclude_unset=True)
        user = await self._repo.update(user_id, data)
        if user is None:
            raise NotFoundException("User")
        return user
