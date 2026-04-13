"""Pydantic schemas for CoverLetter CRUD and AI generation."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CoverLetterCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    resume_id: uuid.UUID | None = None
    company_name: str | None = Field(None, max_length=255)
    target_role: str | None = Field(None, max_length=255)
    job_description: str | None = Field(None, max_length=20000)
    body: str = Field(default="", max_length=50000)
    status: str = Field(default="draft", pattern="^(draft|final)$")


class CoverLetterUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    company_name: str | None = Field(None, max_length=255)
    target_role: str | None = Field(None, max_length=255)
    job_description: str | None = Field(None, max_length=20000)
    body: str | None = Field(None, max_length=50000)
    status: str | None = Field(None, pattern="^(draft|final)$")


class CoverLetterRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    resume_id: uuid.UUID | None
    title: str
    company_name: str | None
    target_role: str | None
    job_description: str | None
    body: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CoverLetterListItem(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    resume_id: uuid.UUID | None
    title: str
    company_name: str | None
    target_role: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CoverLetterListResponse(BaseModel):
    items: list[CoverLetterListItem]
    total: int
    offset: int
    limit: int


class GenerateCoverLetterRequest(BaseModel):
    resume_id: uuid.UUID
    company_name: str | None = Field(None, max_length=255)
    target_role: str | None = Field(None, max_length=255)
    job_description: str = Field(min_length=10, max_length=20000)
    title: str = Field(default="Cover Letter", max_length=255)


class GenerateCoverLetterResponse(BaseModel):
    cover_letter: CoverLetterRead
