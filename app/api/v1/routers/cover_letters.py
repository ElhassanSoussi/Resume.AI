"""Cover Letter CRUD + AI generation endpoints.

POST   /cover-letters                        → create
GET    /cover-letters                        → list
GET    /cover-letters/{id}                   → detail
PATCH  /cover-letters/{id}                   → update
DELETE /cover-letters/{id}                   → delete
POST   /cover-letters/generate               → AI generate from resume + job description
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from app.core.deps import AIServiceDep, CurrentUserID, DBSession
from app.schemas.common import MessageResponse
from app.schemas.cover_letter import (
    CoverLetterCreate,
    CoverLetterListResponse,
    CoverLetterRead,
    CoverLetterUpdate,
    GenerateCoverLetterRequest,
    GenerateCoverLetterResponse,
)
from app.services.cover_letter import CoverLetterService
from app.services.resume import ResumeService
from app.services.resume_version import _resume_to_snapshot

router = APIRouter()


@router.post("", response_model=CoverLetterRead, status_code=201, include_in_schema=False)
@router.post("/", response_model=CoverLetterRead, status_code=201)
async def create_cover_letter(
    payload: CoverLetterCreate,
    user_id: CurrentUserID,
    session: DBSession,
) -> CoverLetterRead:
    letter = await CoverLetterService(session).create(uuid.UUID(user_id), payload)
    return CoverLetterRead.model_validate(letter)


@router.get("", response_model=CoverLetterListResponse, include_in_schema=False)
@router.get("/", response_model=CoverLetterListResponse)
async def list_cover_letters(
    user_id: CurrentUserID,
    session: DBSession,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> CoverLetterListResponse:
    from app.schemas.cover_letter import CoverLetterListItem

    items, total = await CoverLetterService(session).list_for_user(
        uuid.UUID(user_id), offset=offset, limit=limit
    )
    return CoverLetterListResponse(
        items=[CoverLetterListItem.model_validate(c) for c in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/{cover_letter_id}", response_model=CoverLetterRead)
async def get_cover_letter(
    cover_letter_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> CoverLetterRead:
    letter = await CoverLetterService(session).get(cover_letter_id, uuid.UUID(user_id))
    return CoverLetterRead.model_validate(letter)


@router.patch("/{cover_letter_id}", response_model=CoverLetterRead)
async def update_cover_letter(
    cover_letter_id: uuid.UUID,
    payload: CoverLetterUpdate,
    user_id: CurrentUserID,
    session: DBSession,
) -> CoverLetterRead:
    letter = await CoverLetterService(session).update(
        cover_letter_id, uuid.UUID(user_id), payload
    )
    return CoverLetterRead.model_validate(letter)


@router.delete("/{cover_letter_id}", response_model=MessageResponse)
async def delete_cover_letter(
    cover_letter_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> MessageResponse:
    await CoverLetterService(session).delete(cover_letter_id, uuid.UUID(user_id))
    return MessageResponse(message="Cover letter deleted.")


@router.post("/generate", response_model=GenerateCoverLetterResponse, status_code=201)
async def generate_cover_letter(
    payload: GenerateCoverLetterRequest,
    user_id: CurrentUserID,
    session: DBSession,
    ai: AIServiceDep,
) -> GenerateCoverLetterResponse:
    uid = uuid.UUID(user_id)

    resume = await ResumeService(session).get(payload.resume_id, uid)
    snapshot = _resume_to_snapshot(resume)

    body = await ai.generate_cover_letter(
        resume_snapshot=snapshot,
        job_description=payload.job_description,
        company_name=payload.company_name,
        target_role=payload.target_role,
    )

    letter = await CoverLetterService(session).create_from_ai(
        uid,
        resume_id=payload.resume_id,
        body=body,
        title=payload.title,
        company_name=payload.company_name,
        target_role=payload.target_role,
        job_description=payload.job_description,
    )
    return GenerateCoverLetterResponse(cover_letter=CoverLetterRead.model_validate(letter))
