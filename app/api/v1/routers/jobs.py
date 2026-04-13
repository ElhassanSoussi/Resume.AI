"""Job Application tracker endpoints (lightweight CRM).

POST   /jobs          → create
GET    /jobs          → list (with optional status filter)
GET    /jobs/{id}     → detail
PATCH  /jobs/{id}     → update
DELETE /jobs/{id}     → delete
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from app.core.deps import CurrentUserID, DBSession
from app.schemas.common import MessageResponse
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationListResponse,
    JobApplicationRead,
    JobApplicationUpdate,
)
from app.services.job_application import JobApplicationService

router = APIRouter()


@router.post("", response_model=JobApplicationRead, status_code=201, include_in_schema=False)
@router.post("/", response_model=JobApplicationRead, status_code=201)
async def create_job_application(
    payload: JobApplicationCreate,
    user_id: CurrentUserID,
    session: DBSession,
) -> JobApplicationRead:
    job = await JobApplicationService(session).create(uuid.UUID(user_id), payload)
    return JobApplicationRead.model_validate(job)


@router.get("", response_model=JobApplicationListResponse, include_in_schema=False)
@router.get("/", response_model=JobApplicationListResponse)
async def list_job_applications(
    user_id: CurrentUserID,
    session: DBSession,
    status: str | None = Query(None, pattern="^(applied|interview|offer|rejected)$"),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
) -> JobApplicationListResponse:
    items, total = await JobApplicationService(session).list_for_user(
        uuid.UUID(user_id), status=status, offset=offset, limit=limit
    )
    return JobApplicationListResponse(
        items=[JobApplicationRead.model_validate(j) for j in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/{application_id}", response_model=JobApplicationRead)
async def get_job_application(
    application_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> JobApplicationRead:
    job = await JobApplicationService(session).get(application_id, uuid.UUID(user_id))
    return JobApplicationRead.model_validate(job)


@router.patch("/{application_id}", response_model=JobApplicationRead)
async def update_job_application(
    application_id: uuid.UUID,
    payload: JobApplicationUpdate,
    user_id: CurrentUserID,
    session: DBSession,
) -> JobApplicationRead:
    job = await JobApplicationService(session).update(
        application_id, uuid.UUID(user_id), payload
    )
    return JobApplicationRead.model_validate(job)


@router.delete("/{application_id}", response_model=MessageResponse)
async def delete_job_application(
    application_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> MessageResponse:
    await JobApplicationService(session).delete(application_id, uuid.UUID(user_id))
    return MessageResponse(message="Job application deleted.")
