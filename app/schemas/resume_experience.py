from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator


class ExperienceBase(BaseModel):
    company: str = Field(min_length=1, max_length=255)
    job_title: str = Field(min_length=1, max_length=255)
    location: str | None = Field(None, max_length=255)
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    bullets: list[str] = Field(default_factory=list)
    sort_order: int = 0

    @model_validator(mode="after")
    def validate_dates(self) -> "ExperienceBase":
        if self.is_current and self.end_date is not None:
            raise ValueError("end_date must be null when is_current is true")
        if not self.is_current and self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    company: str | None = Field(None, min_length=1, max_length=255)
    job_title: str | None = Field(None, min_length=1, max_length=255)
    location: str | None = Field(None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    bullets: list[str] | None = None
    sort_order: int | None = None


class ExperienceRead(ExperienceBase):
    id: uuid.UUID
    resume_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
