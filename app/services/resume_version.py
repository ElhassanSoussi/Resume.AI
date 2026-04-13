"""Business logic for ResumeVersion — snapshot-based versioning."""

from __future__ import annotations

import uuid
from typing import Any, Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.logging import get_logger
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.repositories.resume import ResumeRepository
from app.repositories.resume_version import ResumeVersionRepository
from app.schemas.resume_version import ResumeVersionUpdate

logger = get_logger(__name__)


def _resume_to_snapshot(resume: Resume) -> dict[str, Any]:
    """Serialize a Resume ORM object into a plain dict snapshot for versioning."""
    pi = resume.personal_info
    return {
        "title": resume.title,
        "template_key": resume.template_key,
        "personal_info": {
            "first_name": pi.first_name,
            "last_name": pi.last_name,
            "email": pi.email,
            "phone": pi.phone,
            "location": pi.location,
            "website": pi.website,
            "linkedin_url": pi.linkedin_url,
            "github_url": pi.github_url,
        } if pi else None,
        "summary": resume.summary.body if resume.summary else None,
        "experiences": [
            {
                "company": e.company,
                "job_title": e.job_title,
                "location": e.location,
                "start_date": e.start_date.isoformat(),
                "end_date": e.end_date.isoformat() if e.end_date else None,
                "is_current": e.is_current,
                "bullets": list(e.bullets),
                "sort_order": e.sort_order,
            }
            for e in resume.experiences
        ],
        "educations": [
            {
                "institution": e.institution,
                "degree": e.degree,
                "field_of_study": e.field_of_study,
                "location": e.location,
                "start_date": e.start_date.isoformat(),
                "end_date": e.end_date.isoformat() if e.end_date else None,
                "gpa": e.gpa,
                "description": e.description,
                "sort_order": e.sort_order,
            }
            for e in resume.educations
        ],
        "skills": [
            {"category": s.category, "items": list(s.items), "sort_order": s.sort_order}
            for s in resume.skills
        ],
    }


class ResumeVersionService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ResumeVersionRepository(session)
        self._resume_repo = ResumeRepository(session)

    async def _get_resume_owned(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> Resume:
        resume = await self._resume_repo.get_by_user_eager(user_id, resume_id)
        if resume is None:
            raise NotFoundException("Resume")
        return resume

    async def list_for_resume(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[Sequence[ResumeVersion], int]:
        await self._get_resume_owned(resume_id, user_id)
        items = await self._repo.get_by_resume(resume_id, user_id, offset=offset, limit=limit)
        total = await self._repo.count_by_resume(resume_id, user_id)
        return items, total

    async def get(
        self, version_id: uuid.UUID, user_id: uuid.UUID
    ) -> ResumeVersion:
        version = await self._repo.get_owned(version_id, user_id)
        if version is None:
            raise NotFoundException("ResumeVersion")
        return version

    async def snapshot_current(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
        *,
        label: str = "Snapshot",
    ) -> ResumeVersion:
        """Create a version from the current live resume state."""
        resume = await self._get_resume_owned(resume_id, user_id)
        snapshot = _resume_to_snapshot(resume)
        data: dict[str, Any] = {
            "resume_id": resume_id,
            "user_id": user_id,
            "label": label,
            "snapshot": snapshot,
            "is_tailored": False,
        }
        return await self._repo.create(data)

    async def duplicate(
        self,
        version_id: uuid.UUID,
        user_id: uuid.UUID,
        *,
        label: str | None = None,
    ) -> ResumeVersion:
        source = await self.get(version_id, user_id)
        new_label = label or f"{source.label} (copy)"
        data: dict[str, Any] = {
            "resume_id": source.resume_id,
            "user_id": user_id,
            "label": new_label,
            "snapshot": source.snapshot,
            "is_tailored": source.is_tailored,
            "job_description": source.job_description,
            "source_version_id": source.id,
        }
        return await self._repo.create(data)

    async def rename(
        self,
        version_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: ResumeVersionUpdate,
    ) -> ResumeVersion:
        await self.get(version_id, user_id)
        data = payload.model_dump(exclude_unset=True)
        updated = await self._repo.update(version_id, data)
        if updated is None:
            raise NotFoundException("ResumeVersion")
        return updated

    async def delete(self, version_id: uuid.UUID, user_id: uuid.UUID) -> None:
        await self.get(version_id, user_id)
        await self._repo.delete(version_id)

    async def create_tailored(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
        *,
        label: str,
        job_description: str,
        tailored_snapshot: dict[str, Any],
    ) -> ResumeVersion:
        """Persist a tailored snapshot as a new ResumeVersion."""
        await self._get_resume_owned(resume_id, user_id)
        data: dict[str, Any] = {
            "resume_id": resume_id,
            "user_id": user_id,
            "label": label,
            "snapshot": tailored_snapshot,
            "is_tailored": True,
            "job_description": job_description,
        }
        return await self._repo.create(data)
