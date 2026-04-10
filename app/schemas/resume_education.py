from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class EducationBase(BaseModel):
    institution: str = Field(min_length=1, max_length=255)
    degree: str = Field(min_length=1, max_length=255)
    field_of_study: str | None = Field(None, max_length=255)
    location: str | None = Field(None, max_length=255)
    start_date: date
    end_date: date | None = None
    gpa: str | None = Field(None, max_length=20)
    description: str | None = None
    sort_order: int = 0


class EducationCreate(EducationBase):
    pass


class EducationUpdate(BaseModel):
    institution: str | None = Field(None, min_length=1, max_length=255)
    degree: str | None = Field(None, min_length=1, max_length=255)
    field_of_study: str | None = Field(None, max_length=255)
    location: str | None = Field(None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    gpa: str | None = Field(None, max_length=20)
    description: str | None = None
    sort_order: int | None = None


class EducationRead(EducationBase):
    id: uuid.UUID
    resume_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
