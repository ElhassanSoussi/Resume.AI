"""Resume CRUD + versioning + tailoring endpoints.

POST   /resumes                           → create
GET    /resumes                           → list (paginated, current user only)
GET    /resumes/{id}                      → detail with all sections
PUT    /resumes/{id}                      → full replacement (scalars + all sections)
PATCH  /resumes/{id}                      → partial update (scalars only)
DELETE /resumes/{id}                      → soft-cascade delete

GET    /resumes/{id}/versions             → list versions
POST   /resumes/{id}/versions/snapshot    → snapshot current state as new version
POST   /resumes/{id}/versions/{vid}/duplicate → duplicate a version
PATCH  /resumes/{id}/versions/{vid}       → rename a version
DELETE /resumes/{id}/versions/{vid}       → delete a version
GET    /resumes/{id}/versions/{vid}       → get version detail

POST   /resumes/{id}/tailor               → AI tailor resume for job description
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from app.core.deps import AIServiceDep, CurrentUserID, DBSession
from app.schemas.common import MessageResponse
from app.schemas.resume import (
    ResumeCreate,
    ResumeFullUpdate,
    ResumeListItem,
    ResumeListResponse,
    ResumeRead,
    ResumeUpdate,
)
from app.schemas.resume_version import (
    ResumeVersionListItem,
    ResumeVersionListResponse,
    ResumeVersionRead,
    ResumeVersionUpdate,
    TailorResumeRequest,
    TailorResumeResponse,
)
from app.services.resume import ResumeService
from app.services.resume_version import ResumeVersionService, _resume_to_snapshot

router = APIRouter()


@router.post("", response_model=ResumeRead, status_code=201, include_in_schema=False)
@router.post("/", response_model=ResumeRead, status_code=201)
async def create_resume(
    payload: ResumeCreate,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumeRead:
    resume = await ResumeService(session).create(uuid.UUID(user_id), payload)
    return ResumeRead.model_validate(resume)


@router.get("", response_model=ResumeListResponse, include_in_schema=False)
@router.get("/", response_model=ResumeListResponse)
async def list_resumes(
    user_id: CurrentUserID,
    session: DBSession,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> ResumeListResponse:
    items, total = await ResumeService(session).list_for_user(
        uuid.UUID(user_id), offset=offset, limit=limit
    )
    return ResumeListResponse(
        items=[ResumeListItem.model_validate(r) for r in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/{resume_id}", response_model=ResumeRead)
async def get_resume(
    resume_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumeRead:
    resume = await ResumeService(session).get(resume_id, uuid.UUID(user_id))
    return ResumeRead.model_validate(resume)


@router.put("/{resume_id}", response_model=ResumeRead)
async def replace_resume(
    resume_id: uuid.UUID,
    payload: ResumeFullUpdate,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumeRead:
    resume = await ResumeService(session).full_update(
        resume_id, uuid.UUID(user_id), payload
    )
    return ResumeRead.model_validate(resume)


@router.patch("/{resume_id}", response_model=ResumeRead)
async def update_resume(
    resume_id: uuid.UUID,
    payload: ResumeUpdate,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumeRead:
    resume = await ResumeService(session).partial_update(
        resume_id, uuid.UUID(user_id), payload
    )
    return ResumeRead.model_validate(resume)


@router.delete("/{resume_id}", response_model=MessageResponse)
async def delete_resume(
    resume_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> MessageResponse:
    await ResumeService(session).delete(resume_id, uuid.UUID(user_id))
    return MessageResponse(message="Resume deleted.")


# ── Versioning ────────────────────────────────────────────────────────────────

@router.get("/{resume_id}/versions", response_model=ResumeVersionListResponse)
async def list_versions(
    resume_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> ResumeVersionListResponse:
    items, total = await ResumeVersionService(session).list_for_resume(
        resume_id, uuid.UUID(user_id), offset=offset, limit=limit
    )
    return ResumeVersionListResponse(
        items=[ResumeVersionListItem.model_validate(v) for v in items],
        total=total,
    )


@router.post("/{resume_id}/versions/snapshot", response_model=ResumeVersionRead, status_code=201)
async def snapshot_version(
    resume_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
    label: str = Query("Snapshot", min_length=1, max_length=255),
) -> ResumeVersionRead:
    version = await ResumeVersionService(session).snapshot_current(
        resume_id, uuid.UUID(user_id), label=label
    )
    return ResumeVersionRead.model_validate(version)


@router.get("/{resume_id}/versions/{version_id}", response_model=ResumeVersionRead)
async def get_version(
    resume_id: uuid.UUID,
    version_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumeVersionRead:
    version = await ResumeVersionService(session).get(version_id, uuid.UUID(user_id))
    return ResumeVersionRead.model_validate(version)


@router.patch("/{resume_id}/versions/{version_id}", response_model=ResumeVersionRead)
async def rename_version(
    resume_id: uuid.UUID,
    version_id: uuid.UUID,
    payload: ResumeVersionUpdate,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumeVersionRead:
    version = await ResumeVersionService(session).rename(
        version_id, uuid.UUID(user_id), payload
    )
    return ResumeVersionRead.model_validate(version)


@router.post("/{resume_id}/versions/{version_id}/duplicate", response_model=ResumeVersionRead, status_code=201)
async def duplicate_version(
    resume_id: uuid.UUID,
    version_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
    label: str | None = Query(None, max_length=255),
) -> ResumeVersionRead:
    version = await ResumeVersionService(session).duplicate(
        version_id, uuid.UUID(user_id), label=label
    )
    return ResumeVersionRead.model_validate(version)


@router.delete("/{resume_id}/versions/{version_id}", response_model=MessageResponse)
async def delete_version(
    resume_id: uuid.UUID,
    version_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> MessageResponse:
    await ResumeVersionService(session).delete(version_id, uuid.UUID(user_id))
    return MessageResponse(message="Version deleted.")


# ── AI Tailoring ──────────────────────────────────────────────────────────────

@router.post("/{resume_id}/tailor", response_model=TailorResumeResponse, status_code=201)
async def tailor_resume(
    resume_id: uuid.UUID,
    payload: TailorResumeRequest,
    user_id: CurrentUserID,
    session: DBSession,
    ai: AIServiceDep,
) -> TailorResumeResponse:
    uid = uuid.UUID(user_id)
    resume = await ResumeService(session).get(resume_id, uid)
    snapshot = _resume_to_snapshot(resume)

    tailored = await ai.tailor_resume(
        resume_snapshot=snapshot,
        job_description=payload.job_description,
        n_experiences=len(resume.experiences),
    )

    # Merge AI output back into snapshot
    tailored_snapshot = dict(snapshot)
    if tailored.summary is not None:
        tailored_snapshot["summary"] = tailored.summary
    for i, exp in enumerate(tailored_snapshot.get("experiences", [])):
        if i < len(tailored.experience_bullets):
            exp["bullets"] = tailored.experience_bullets[i]
    if tailored.skill_phrases:
        tailored_snapshot["ats_skill_phrases"] = tailored.skill_phrases
    tailored_snapshot["ats_notes"] = tailored.ats_notes

    version = await ResumeVersionService(session).create_tailored(
        resume_id,
        uid,
        label=payload.label,
        job_description=payload.job_description,
        tailored_snapshot=tailored_snapshot,
    )
    return TailorResumeResponse(version=ResumeVersionRead.model_validate(version))
