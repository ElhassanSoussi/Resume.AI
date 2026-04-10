from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.resume_education import EducationCreate, EducationRead
from app.schemas.resume_experience import ExperienceCreate, ExperienceRead
from app.schemas.resume_personal_info import PersonalInfoCreate, PersonalInfoRead
from app.schemas.resume_skill import SkillCreate, SkillRead
from app.schemas.resume_summary import SummaryCreate, SummaryRead


class ResumeCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    template_key: str = Field(default="modern", max_length=100)

    personal_info: PersonalInfoCreate | None = None
    summary: SummaryCreate | None = None
    experiences: list[ExperienceCreate] = Field(default_factory=list)
    educations: list[EducationCreate] = Field(default_factory=list)
    skills: list[SkillCreate] = Field(default_factory=list)


class ResumeFullUpdate(BaseModel):
    """Full replacement schema for PUT – every field is required or
    explicitly defaulted.  All child sections are replaced wholesale."""

    title: str = Field(min_length=1, max_length=255)
    template_key: str = Field(default="modern", max_length=100)
    status: str = Field(default="draft", pattern=r"^(draft|complete)$")

    personal_info: PersonalInfoCreate | None = None
    summary: SummaryCreate | None = None
    experiences: list[ExperienceCreate] = Field(default_factory=list)
    educations: list[EducationCreate] = Field(default_factory=list)
    skills: list[SkillCreate] = Field(default_factory=list)


class ResumeUpdate(BaseModel):
    """Partial update schema for PATCH – top-level scalars only."""

    title: str | None = Field(None, min_length=1, max_length=255)
    template_key: str | None = Field(None, max_length=100)
    status: str | None = Field(None, pattern=r"^(draft|complete)$")


class ResumeRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    template_key: str
    status: str
    created_at: datetime
    updated_at: datetime

    personal_info: PersonalInfoRead | None = None
    summary: SummaryRead | None = None
    experiences: list[ExperienceRead] = Field(default_factory=list)
    educations: list[EducationRead] = Field(default_factory=list)
    skills: list[SkillRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ResumeListItem(BaseModel):
    """Lightweight representation for list endpoints (no nested sections)."""

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    template_key: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeListResponse(BaseModel):
    items: list[ResumeListItem]
    total: int
    offset: int
    limit: int
