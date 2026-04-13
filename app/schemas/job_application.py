"""Pydantic schemas for JobApplication (lightweight job CRM)."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

JOB_STATUSES = {"applied", "interview", "offer", "rejected"}


class JobApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=255)
    role: str = Field(min_length=1, max_length=255)
    status: str = Field(default="applied", pattern="^(applied|interview|offer|rejected)$")
    job_description: str | None = Field(None, max_length=20000)
    notes: str | None = Field(None, max_length=10000)
    applied_date: date | None = None
    follow_up_date: date | None = None
    job_posting_url: str | None = Field(None, max_length=2000)
    resume_version_id: uuid.UUID | None = None
    cover_letter_id: uuid.UUID | None = None


class JobApplicationUpdate(BaseModel):
    company: str | None = Field(None, min_length=1, max_length=255)
    role: str | None = Field(None, min_length=1, max_length=255)
    status: str | None = Field(None, pattern="^(applied|interview|offer|rejected)$")
    job_description: str | None = Field(None, max_length=20000)
    notes: str | None = Field(None, max_length=10000)
    applied_date: date | None = None
    follow_up_date: date | None = None
    job_posting_url: str | None = Field(None, max_length=2000)
    resume_version_id: uuid.UUID | None = None
    cover_letter_id: uuid.UUID | None = None


class JobApplicationRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    company: str
    role: str
    status: str
    job_description: str | None
    notes: str | None
    applied_date: date | None
    follow_up_date: date | None
    job_posting_url: str | None
    resume_version_id: uuid.UUID | None
    cover_letter_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobApplicationListResponse(BaseModel):
    items: list[JobApplicationRead]
    total: int
    offset: int
    limit: int
