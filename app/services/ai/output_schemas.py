"""Pydantic models validating JSON returned by the LLM."""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class RewriteSummaryAIOutput(BaseModel):
    rewritten_summary: str = Field(min_length=1, max_length=5000)


class RewriteExperienceAIOutput(BaseModel):
    bullets: list[str] = Field(default_factory=list)

    @field_validator("bullets")
    @classmethod
    def cap_bullets(cls, v: list[str]) -> list[str]:
        cleaned = [b.strip() for b in v if b and b.strip()]
        return cleaned[:25]


class OptimizeResumeAIOutput(BaseModel):
    summary: str | None = Field(default=None, max_length=5000)
    experience_bullets: list[list[str]] = Field(default_factory=list)
    skill_phrases: list[str] = Field(default_factory=list)
    ats_notes: str = Field(default="", max_length=400)

    @field_validator("experience_bullets")
    @classmethod
    def normalize_exp_bullets(cls, v: list[list[str]]) -> list[list[str]]:
        out: list[list[str]] = []
        for group in v[:50]:
            row = [b.strip() for b in group if b and str(b).strip()][:25]
            out.append(row)
        return out

    @field_validator("skill_phrases")
    @classmethod
    def cap_skills(cls, v: list[str]) -> list[str]:
        result: list[str] = []
        for s in v[:12]:
            t = s.strip()
            if t:
                result.append(t[:200])
        return result


class GenerateCoverLetterAIOutput(BaseModel):
    body: str = Field(min_length=1, max_length=10000)

    @field_validator("body")
    @classmethod
    def clean_body(cls, v: str) -> str:
        return v.strip()


class TailorResumeAIOutput(BaseModel):
    """Same shape as OptimizeResumeAIOutput — reused for tailoring."""

    summary: str | None = Field(default=None, max_length=5000)
    experience_bullets: list[list[str]] = Field(default_factory=list)
    skill_phrases: list[str] = Field(default_factory=list)
    ats_notes: str = Field(default="", max_length=400)

    @field_validator("experience_bullets")
    @classmethod
    def normalize_exp_bullets(cls, v: list[list[str]]) -> list[list[str]]:
        out: list[list[str]] = []
        for group in v[:50]:
            row = [b.strip() for b in group if b and str(b).strip()][:25]
            out.append(row)
        return out

    @field_validator("skill_phrases")
    @classmethod
    def cap_skills(cls, v: list[str]) -> list[str]:
        result: list[str] = []
        for s in v[:12]:
            t = s.strip()
            if t:
                result.append(t[:200])
        return result
