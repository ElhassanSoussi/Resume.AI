"""Request/response schemas for AI resume optimization endpoints."""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

ResumeWritingMode = Literal["balanced", "concise", "achievement_focused", "ats_focused"]


class RewriteSummaryRequest(BaseModel):
    summary_body: str = Field(min_length=1, max_length=5000)
    target_role: str | None = Field(None, max_length=255)
    job_description: str | None = Field(None, max_length=20000)
    writing_mode: ResumeWritingMode = "balanced"


class RewriteSummaryResponse(BaseModel):
    rewritten_summary: str


class RewriteExperienceRequest(BaseModel):
    company: str = Field(min_length=1, max_length=255)
    job_title: str = Field(min_length=1, max_length=255)
    location: str | None = Field(None, max_length=255)
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    bullets: list[str] = Field(default_factory=list)
    writing_mode: ResumeWritingMode = "balanced"


class RewriteExperienceResponse(BaseModel):
    bullets: list[str]


class OptimizePersonalInfoInput(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = Field(None, max_length=50)
    location: str | None = Field(None, max_length=255)


class OptimizeEducationInput(BaseModel):
    institution: str
    degree: str
    field_of_study: str | None = None


class OptimizeSkillCategoryInput(BaseModel):
    category: str
    items: list[str]


class OptimizeResumeRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    personal_info: OptimizePersonalInfoInput | None = None
    summary_body: str | None = Field(None, max_length=5000)
    experiences: list[RewriteExperienceRequest] = Field(default_factory=list)
    educations: list[OptimizeEducationInput] = Field(default_factory=list)
    skills: list[OptimizeSkillCategoryInput] = Field(default_factory=list)
    writing_mode: ResumeWritingMode = "balanced"


class OptimizeResumeResponse(BaseModel):
    summary: str | None = None
    experience_bullets: list[list[str]]
    skill_phrases: list[str] = Field(default_factory=list)
    ats_notes: str = ""


# ── Cover Letter generation ───────────────────────────────────────────────────

class GenerateCoverLetterAIRequest(BaseModel):
    """Internal DTO passed to AIService.generate_cover_letter."""

    resume_snapshot: dict = Field(default_factory=dict)
    job_description: str = Field(min_length=10, max_length=20000)
    company_name: str | None = Field(None, max_length=255)
    target_role: str | None = Field(None, max_length=255)


class GenerateCoverLetterAIResponse(BaseModel):
    body: str


# ── Resume tailoring ──────────────────────────────────────────────────────────

class TailorResumeAIRequest(BaseModel):
    """Internal DTO passed to AIService.tailor_resume."""

    resume_snapshot: dict = Field(default_factory=dict)
    job_description: str = Field(min_length=10, max_length=20000)


class TailorResumeAIResponse(BaseModel):
    """Tailored resume — same shape as OptimizeResumeResponse."""

    summary: str | None = None
    experience_bullets: list[list[str]]
    skill_phrases: list[str] = Field(default_factory=list)
    ats_notes: str = ""
