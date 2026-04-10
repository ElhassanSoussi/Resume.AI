"""Resume CRUD endpoints.

POST   /resumes          → create
GET    /resumes          → list (paginated, current user only)
GET    /resumes/{id}     → detail with all sections
PUT    /resumes/{id}     → full replacement (scalars + all sections)
PATCH  /resumes/{id}     → partial update (scalars only)
DELETE /resumes/{id}     → soft-cascade delete
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from app.core.deps import CurrentUserID, DBSession
from app.schemas.common import MessageResponse
from app.schemas.resume import (
    ResumeCreate,
    ResumeFullUpdate,
    ResumeListItem,
    ResumeListResponse,
    ResumeRead,
    ResumeUpdate,
)
from app.services.resume import ResumeService

router = APIRouter()


@router.post("/", response_model=ResumeRead, status_code=201)
async def create_resume(
    payload: ResumeCreate,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumeRead:
    resume = await ResumeService(session).create(uuid.UUID(user_id), payload)
    return ResumeRead.model_validate(resume)


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
