"""Business logic for resume CRUD with relational sections."""

from __future__ import annotations

import asyncio
import uuid
from typing import Sequence

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundException
from app.core.logging import get_logger
from app.models.resume import Resume
from app.models.resume_education import ResumeEducation
from app.models.resume_experience import ResumeExperience
from app.models.resume_personal_info import ResumePersonalInfo
from app.models.resume_skill import ResumeSkill
from app.models.resume_summary import ResumeSummary
from app.repositories.resume import ResumeRepository
from app.schemas.resume import ResumeCreate, ResumeFullUpdate, ResumeUpdate
from app.services.supabase_resume_mirror import delete_resume_graph, sync_resume_graph
from app.services.supabase_resume_reader import fetch_resume_detail, fetch_resume_list
from app.services.supabase_resume_writer import (
    create_resume_graph,
    delete_resume_graph as delete_resume_graph_direct,
    full_replace_resume_graph,
    patch_resume_graph,
)

logger = get_logger(__name__)


class ResumeService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ResumeRepository(session)

    # ── helpers ──────────────────────────────────────────

    def _build_children(
        self,
        resume_id: uuid.UUID,
        payload: ResumeCreate | ResumeFullUpdate,
    ) -> None:
        if payload.personal_info:
            self._session.add(
                ResumePersonalInfo(
                    resume_id=resume_id,
                    **payload.personal_info.model_dump(),
                )
            )

        if payload.summary:
            self._session.add(
                ResumeSummary(
                    resume_id=resume_id,
                    **payload.summary.model_dump(),
                )
            )

        for idx, exp in enumerate(payload.experiences):
            self._session.add(
                ResumeExperience(
                    resume_id=resume_id,
                    sort_order=exp.sort_order or idx,
                    **exp.model_dump(exclude={"sort_order"}),
                )
            )

        for idx, edu in enumerate(payload.educations):
            self._session.add(
                ResumeEducation(
                    resume_id=resume_id,
                    sort_order=edu.sort_order or idx,
                    **edu.model_dump(exclude={"sort_order"}),
                )
            )

        for idx, skill in enumerate(payload.skills):
            self._session.add(
                ResumeSkill(
                    resume_id=resume_id,
                    sort_order=skill.sort_order or idx,
                    **skill.model_dump(exclude={"sort_order"}),
                )
            )

    async def _delete_children(self, resume_id: uuid.UUID) -> None:
        for model in (
            ResumePersonalInfo,
            ResumeSummary,
            ResumeExperience,
            ResumeEducation,
            ResumeSkill,
        ):
            await self._session.execute(
                delete(model).where(model.resume_id == resume_id)  # type: ignore[attr-defined]
            )

    async def _get_owned(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> Resume:
        resume = await self._repo.get_by_user_eager(user_id, resume_id)
        if resume is None:
            raise NotFoundException("Resume")
        return resume

    async def _mirror_resume_best_effort(self, resume: Resume) -> None:
        try:
            await asyncio.to_thread(sync_resume_graph, resume)
        except Exception as exc:
            logger.warning(
                "resume.supabase_mirror_failed",
                resume_id=str(resume.id),
                error=str(exc),
            )

    async def _delete_resume_mirror_best_effort(self, resume_id: uuid.UUID) -> None:
        try:
            await asyncio.to_thread(delete_resume_graph, resume_id)
        except Exception as exc:
            logger.warning(
                "resume.supabase_mirror_delete_failed",
                resume_id=str(resume_id),
                error=str(exc),
            )

    # ── public API ───────────────────────────────────────

    async def create(self, user_id: uuid.UUID, payload: ResumeCreate) -> Resume:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(create_resume_graph, user_id, payload)
            except Exception as exc:
                logger.warning(
                    "resume.supabase_write_create_failed",
                    user_id=str(user_id),
                    error=str(exc),
                )

        resume = await self._repo.create(
            {
                "user_id": user_id,
                "title": payload.title,
                "template_key": payload.template_key,
            }
        )
        self._build_children(resume.id, payload)
        await self._session.flush()

        result = await self._repo.get_by_id_eager(resume.id)
        if result is None:
            raise NotFoundException("Resume")
        await self._mirror_resume_best_effort(result)
        return result

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[Sequence[Resume], int]:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(
                    fetch_resume_list,
                    user_id,
                    offset=offset,
                    limit=limit,
                )
            except Exception as exc:
                logger.warning(
                    "resume.supabase_read_list_failed",
                    user_id=str(user_id),
                    error=str(exc),
                )

        items = await self._repo.get_by_user(user_id, offset=offset, limit=limit)
        total = await self._repo.count_by_user(user_id)
        return items, total

    async def get(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> Resume:
        if settings.supabase_configured:
            try:
                remote_resume = await asyncio.to_thread(fetch_resume_detail, user_id, resume_id)
            except Exception as exc:
                logger.warning(
                    "resume.supabase_read_detail_failed",
                    resume_id=str(resume_id),
                    error=str(exc),
                )
            else:
                if remote_resume is not None:
                    return remote_resume

        return await self._get_owned(resume_id, user_id)

    async def partial_update(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: ResumeUpdate,
    ) -> Resume:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(patch_resume_graph, user_id, resume_id, payload)
            except Exception as exc:
                logger.warning(
                    "resume.supabase_write_patch_failed",
                    resume_id=str(resume_id),
                    error=str(exc),
                )

        await self._get_owned(resume_id, user_id)
        data = payload.model_dump(exclude_unset=True)
        if not data:
            return await self._get_owned(resume_id, user_id)
        updated = await self._repo.update(resume_id, data)
        if updated is None:
            raise NotFoundException("Resume")
        result = await self._repo.get_by_id_eager(updated.id)
        if result is None:
            raise NotFoundException("Resume")
        await self._mirror_resume_best_effort(result)
        return result

    async def full_update(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: ResumeFullUpdate,
    ) -> Resume:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(full_replace_resume_graph, user_id, resume_id, payload)
            except Exception as exc:
                logger.warning(
                    "resume.supabase_write_replace_failed",
                    resume_id=str(resume_id),
                    error=str(exc),
                )

        await self._get_owned(resume_id, user_id)

        await self._repo.update(
            resume_id,
            {
                "title": payload.title,
                "template_key": payload.template_key,
                "status": payload.status,
            },
        )

        await self._delete_children(resume_id)
        self._build_children(resume_id, payload)
        await self._session.flush()

        result = await self._repo.get_by_id_eager(resume_id)
        if result is None:
            raise NotFoundException("Resume")
        await self._mirror_resume_best_effort(result)
        return result

    async def delete(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> None:
        if settings.supabase_configured:
            try:
                await asyncio.to_thread(delete_resume_graph_direct, user_id, resume_id)
                return
            except Exception as exc:
                logger.warning(
                    "resume.supabase_write_delete_failed",
                    resume_id=str(resume_id),
                    error=str(exc),
                )

        await self._get_owned(resume_id, user_id)
        await self._repo.delete(resume_id)
        await self._delete_resume_mirror_best_effort(resume_id)
