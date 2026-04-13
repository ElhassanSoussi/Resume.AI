"""Business logic for JobApplication (lightweight job tracker CRM)."""

from __future__ import annotations

import uuid
from typing import Any, Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.logging import get_logger
from app.models.job_application import JobApplication
from app.repositories.job_application import JobApplicationRepository
from app.schemas.job_application import JobApplicationCreate, JobApplicationUpdate

logger = get_logger(__name__)


class JobApplicationService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = JobApplicationRepository(session)

    async def create(
        self, user_id: uuid.UUID, payload: JobApplicationCreate
    ) -> JobApplication:
        data: dict[str, Any] = {"user_id": user_id, **payload.model_dump()}
        return await self._repo.create(data)

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        status: str | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> tuple[Sequence[JobApplication], int]:
        items = await self._repo.get_by_user(
            user_id, status=status, offset=offset, limit=limit
        )
        total = await self._repo.count_by_user(user_id, status=status)
        return items, total

    async def get(
        self, application_id: uuid.UUID, user_id: uuid.UUID
    ) -> JobApplication:
        job = await self._repo.get_owned(application_id, user_id)
        if job is None:
            raise NotFoundException("JobApplication")
        return job

    async def update(
        self,
        application_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: JobApplicationUpdate,
    ) -> JobApplication:
        await self.get(application_id, user_id)
        data = payload.model_dump(exclude_unset=True)
        updated = await self._repo.update(application_id, data)
        if updated is None:
            raise NotFoundException("JobApplication")
        return updated

    async def delete(self, application_id: uuid.UUID, user_id: uuid.UUID) -> None:
        await self.get(application_id, user_id)
        await self._repo.delete(application_id)
