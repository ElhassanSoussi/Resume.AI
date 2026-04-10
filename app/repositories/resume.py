from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.resume import Resume
from app.repositories.base import BaseRepository


class ResumeRepository(BaseRepository[Resume]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Resume, session)

    @staticmethod
    def _eager_options() -> list:
        return [
            selectinload(Resume.personal_info),
            selectinload(Resume.summary),
            selectinload(Resume.experiences),
            selectinload(Resume.educations),
            selectinload(Resume.skills),
        ]

    async def get_by_id_eager(self, resume_id: uuid.UUID) -> Resume | None:
        stmt = (
            select(Resume)
            .where(Resume.id == resume_id)
            .options(*self._eager_options())
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> Sequence[Resume]:
        stmt = (
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count_by_user(self, user_id: uuid.UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(Resume)
            .where(Resume.user_id == user_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_by_user_eager(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
    ) -> Resume | None:
        stmt = (
            select(Resume)
            .where(Resume.id == resume_id, Resume.user_id == user_id)
            .options(*self._eager_options())
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
