"""Pydantic schemas for ResumeVersion — snapshot-based versioning."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ResumeVersionCreate(BaseModel):
    label: str = Field(default="Version", min_length=1, max_length=255)
    snapshot: dict[str, Any] = Field(default_factory=dict)
    is_tailored: bool = False
    job_description: str | None = Field(None, max_length=20000)
    source_version_id: uuid.UUID | None = None


class ResumeVersionUpdate(BaseModel):
    label: str | None = Field(None, min_length=1, max_length=255)


class ResumeVersionRead(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    user_id: uuid.UUID
    label: str
    snapshot: dict[str, Any]
    is_tailored: bool
    job_description: str | None
    source_version_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeVersionListItem(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    user_id: uuid.UUID
    label: str
    is_tailored: bool
    source_version_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeVersionListResponse(BaseModel):
    items: list[ResumeVersionListItem]
    total: int


class TailorResumeRequest(BaseModel):
    job_description: str = Field(min_length=10, max_length=20000)
    label: str = Field(default="Tailored Version", min_length=1, max_length=255)


class TailorResumeResponse(BaseModel):
    version: ResumeVersionRead
