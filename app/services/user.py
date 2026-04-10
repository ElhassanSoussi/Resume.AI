"""Business logic for user operations."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = UserRepository(session)

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
