"""Data access layer for ResumeVersion."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resume_version import ResumeVersion
from app.repositories.base import BaseRepository


class ResumeVersionRepository(BaseRepository[ResumeVersion]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(ResumeVersion, session)

    async def get_by_resume(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> Sequence[ResumeVersion]:
        stmt = (
            select(ResumeVersion)
            .where(
                ResumeVersion.resume_id == resume_id,
                ResumeVersion.user_id == user_id,
            )
            .order_by(ResumeVersion.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count_by_resume(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(ResumeVersion)
            .where(
                ResumeVersion.resume_id == resume_id,
                ResumeVersion.user_id == user_id,
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_owned(
        self, version_id: uuid.UUID, user_id: uuid.UUID
    ) -> ResumeVersion | None:
        stmt = select(ResumeVersion).where(
            ResumeVersion.id == version_id,
            ResumeVersion.user_id == user_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
