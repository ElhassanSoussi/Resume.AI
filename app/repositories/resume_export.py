from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resume import Resume
from app.models.resume_export import ResumeExport
from app.repositories.base import BaseRepository


class ResumeExportRepository(BaseRepository[ResumeExport]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(ResumeExport, session)

    async def get_by_user(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> Sequence[ResumeExport]:
        stmt = (
            select(ResumeExport)
            .where(ResumeExport.user_id == user_id)
            .order_by(ResumeExport.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def get_by_resume(
        self,
        resume_id: uuid.UUID,
    ) -> Sequence[ResumeExport]:
        stmt = (
            select(ResumeExport)
            .where(ResumeExport.resume_id == resume_id)
            .order_by(ResumeExport.created_at.desc())
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def get_latest_for_resume_and_user(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ResumeExport | None:
        stmt = (
            select(ResumeExport)
            .where(
                ResumeExport.resume_id == resume_id,
                ResumeExport.user_id == user_id,
            )
            .order_by(ResumeExport.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_with_resume_title_for_user(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> Sequence[tuple[ResumeExport, str]]:
        stmt = (
            select(ResumeExport, Resume.title)
            .join(Resume, Resume.id == ResumeExport.resume_id)
            .where(ResumeExport.user_id == user_id)
            .order_by(ResumeExport.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.all()
