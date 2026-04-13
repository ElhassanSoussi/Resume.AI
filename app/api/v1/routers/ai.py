"""AI-powered resume optimization endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.deps import AIServiceDep, CurrentUserID
from app.schemas.ai import (
    OptimizeResumeRequest,
    OptimizeResumeResponse,
    RewriteExperienceRequest,
    RewriteExperienceResponse,
    RewriteSummaryRequest,
    RewriteSummaryResponse,
)

router = APIRouter()


@router.post("/rewrite-summary", response_model=RewriteSummaryResponse)
async def rewrite_summary(
    payload: RewriteSummaryRequest,
    _user_id: CurrentUserID,
    ai: AIServiceDep,
) -> RewriteSummaryResponse:
    """Rewrite a professional summary using only supplied facts and the selected writing mode."""
    return await ai.rewrite_summary(
        summary_body=payload.summary_body,
        target_role=payload.target_role,
        job_description=payload.job_description,
        writing_mode=payload.writing_mode,
    )


@router.post("/rewrite-experience", response_model=RewriteExperienceResponse)
async def rewrite_experience(
    payload: RewriteExperienceRequest,
    _user_id: CurrentUserID,
    ai: AIServiceDep,
) -> RewriteExperienceResponse:
    """Improve bullet wording for a single role without inventing achievements."""
    return await ai.rewrite_experience(payload)


@router.post("/optimize-resume", response_model=OptimizeResumeResponse)
async def optimize_resume(
    payload: OptimizeResumeRequest,
    _user_id: CurrentUserID,
    ai: AIServiceDep,
) -> OptimizeResumeResponse:
    """Fact-preserving optimization pass across summary, experiences, and skills."""
    return await ai.optimize_resume(payload)
