"""Data access layer for JobApplication."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job_application import JobApplication
from app.repositories.base import BaseRepository


class JobApplicationRepository(BaseRepository[JobApplication]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(JobApplication, session)

    async def get_by_user(
        self,
        user_id: uuid.UUID,
        *,
        status: str | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> Sequence[JobApplication]:
        stmt = select(JobApplication).where(JobApplication.user_id == user_id)
        if status is not None:
            stmt = stmt.where(JobApplication.status == status)
        stmt = stmt.order_by(JobApplication.created_at.desc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count_by_user(self, user_id: uuid.UUID, *, status: str | None = None) -> int:
        stmt = select(func.count()).select_from(JobApplication).where(
            JobApplication.user_id == user_id
        )
        if status is not None:
            stmt = stmt.where(JobApplication.status == status)
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_owned(
        self, application_id: uuid.UUID, user_id: uuid.UUID
    ) -> JobApplication | None:
        stmt = select(JobApplication).where(
            JobApplication.id == application_id,
            JobApplication.user_id == user_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
