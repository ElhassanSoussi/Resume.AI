"""Data access layer for CoverLetter."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cover_letter import CoverLetter
from app.repositories.base import BaseRepository


class CoverLetterRepository(BaseRepository[CoverLetter]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(CoverLetter, session)

    async def get_by_user(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> Sequence[CoverLetter]:
        stmt = (
            select(CoverLetter)
            .where(CoverLetter.user_id == user_id)
            .order_by(CoverLetter.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count_by_user(self, user_id: uuid.UUID) -> int:
        stmt = select(func.count()).select_from(CoverLetter).where(CoverLetter.user_id == user_id)
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_by_user_and_id(
        self, user_id: uuid.UUID, cover_letter_id: uuid.UUID
    ) -> CoverLetter | None:
        stmt = select(CoverLetter).where(
            CoverLetter.user_id == user_id,
            CoverLetter.id == cover_letter_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
