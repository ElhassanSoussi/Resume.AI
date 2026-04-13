"""Business logic for CoverLetter CRUD and AI generation."""

from __future__ import annotations

import uuid
from typing import Any, Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.logging import get_logger
from app.models.cover_letter import CoverLetter
from app.repositories.cover_letter import CoverLetterRepository
from app.repositories.resume import ResumeRepository
from app.schemas.cover_letter import CoverLetterCreate, CoverLetterUpdate

logger = get_logger(__name__)


class CoverLetterService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = CoverLetterRepository(session)
        self._resume_repo = ResumeRepository(session)

    async def create(self, user_id: uuid.UUID, payload: CoverLetterCreate) -> CoverLetter:
        if payload.resume_id is not None:
            resume = await self._resume_repo.get_by_user_eager(user_id, payload.resume_id)
            if resume is None:
                raise NotFoundException("Resume")
        data: dict[str, Any] = {
            "user_id": user_id,
            **payload.model_dump(),
        }
        letter = await self._repo.create(data)
        return letter

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[Sequence[CoverLetter], int]:
        items = await self._repo.get_by_user(user_id, offset=offset, limit=limit)
        total = await self._repo.count_by_user(user_id)
        return items, total

    async def get(self, cover_letter_id: uuid.UUID, user_id: uuid.UUID) -> CoverLetter:
        letter = await self._repo.get_by_user_and_id(user_id, cover_letter_id)
        if letter is None:
            raise NotFoundException("CoverLetter")
        return letter

    async def update(
        self,
        cover_letter_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: CoverLetterUpdate,
    ) -> CoverLetter:
        await self.get(cover_letter_id, user_id)
        data = payload.model_dump(exclude_unset=True)
        updated = await self._repo.update(cover_letter_id, data)
        if updated is None:
            raise NotFoundException("CoverLetter")
        return updated

    async def delete(self, cover_letter_id: uuid.UUID, user_id: uuid.UUID) -> None:
        await self.get(cover_letter_id, user_id)
        await self._repo.delete(cover_letter_id)

    async def create_from_ai(
        self,
        user_id: uuid.UUID,
        *,
        resume_id: uuid.UUID,
        body: str,
        title: str,
        company_name: str | None,
        target_role: str | None,
        job_description: str,
    ) -> CoverLetter:
        data: dict[str, Any] = {
            "user_id": user_id,
            "resume_id": resume_id,
            "title": title,
            "company_name": company_name,
            "target_role": target_role,
            "job_description": job_description,
            "body": body,
            "status": "draft",
        }
        return await self._repo.create(data)
