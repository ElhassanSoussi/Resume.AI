"""High-level AI resume optimization — provider-agnostic, validated outputs."""

from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.core.exceptions import AIServiceException, BadRequestException
from app.core.logging import get_logger
from app.schemas.ai import (
    OptimizeResumeRequest,
    OptimizeResumeResponse,
    RewriteExperienceRequest,
    RewriteExperienceResponse,
    RewriteSummaryResponse,
)
from app.services.ai.output_schemas import (
    GenerateCoverLetterAIOutput,
    OptimizeResumeAIOutput,
    RewriteExperienceAIOutput,
    RewriteSummaryAIOutput,
    TailorResumeAIOutput,
)
from app.services.ai import prompt_builders
from app.services.llm_provider import LLMProvider, LLMProviderError, OpenAICompatibleLLM, parse_json_object

logger = get_logger(__name__)


class AIService:
    """Resume copy optimization using a pluggable LLM provider."""

    def __init__(self, provider: LLMProvider) -> None:
        self._provider = provider

    @staticmethod
    def default() -> "AIService":
        if not settings.ai_configured:
            raise AIServiceException(
                detail="AI provider is not configured. Set OPENAI_API_KEY.",
                status_code=503,
            )
        return AIService(OpenAICompatibleLLM.from_settings())

    async def rewrite_summary(
        self,
        *,
        summary_body: str,
        target_role: str | None,
        job_description: str | None,
        writing_mode: str,
    ) -> RewriteSummaryResponse:
        system = prompt_builders.system_rewrite_summary(writing_mode)
        user = prompt_builders.user_rewrite_summary(
            summary_body=summary_body,
            target_role=target_role,
            job_description=job_description,
            writing_mode=writing_mode,
        )
        raw = await self._complete_and_parse(
            system=system,
            user=user,
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS_SUMMARY,
        )
        try:
            validated = RewriteSummaryAIOutput.model_validate(raw)
        except Exception as exc:
            logger.warning("ai.summary_validation_failed", error=str(exc))
            raise BadRequestException(
                detail="AI returned data that failed validation. Try again with clearer input.",
            ) from exc
        return RewriteSummaryResponse(rewritten_summary=validated.rewritten_summary)

    async def rewrite_experience(self, experience: RewriteExperienceRequest) -> RewriteExperienceResponse:
        system = prompt_builders.system_rewrite_experience(experience.writing_mode)
        exp_dict = _experience_to_dict(experience)
        user = prompt_builders.user_rewrite_experience(exp_dict, writing_mode=experience.writing_mode)
        raw = await self._complete_and_parse(
            system=system,
            user=user,
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS_EXPERIENCE,
        )
        try:
            validated = RewriteExperienceAIOutput.model_validate(raw)
        except Exception as exc:
            logger.warning("ai.experience_validation_failed", error=str(exc))
            raise BadRequestException(
                detail="AI returned data that failed validation. Try again with clearer input.",
            ) from exc
        return RewriteExperienceResponse(bullets=validated.bullets)

    async def optimize_resume(self, payload: OptimizeResumeRequest) -> OptimizeResumeResponse:
        system = prompt_builders.system_optimize_resume(payload.writing_mode)
        snapshot = _optimize_request_to_snapshot(payload)
        user = prompt_builders.user_optimize_resume(snapshot, writing_mode=payload.writing_mode)
        raw = await self._complete_and_parse(
            system=system,
            user=user,
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS_OPTIMIZE,
        )
        try:
            validated = OptimizeResumeAIOutput.model_validate(raw)
        except Exception as exc:
            logger.warning("ai.optimize_validation_failed", error=str(exc))
            raise BadRequestException(
                detail="AI returned data that failed validation. Try again with clearer input.",
            ) from exc

        n_exp = len(payload.experiences)
        if len(validated.experience_bullets) != n_exp:
            raise BadRequestException(
                detail=(
                    "AI output did not match resume structure (experience count). "
                    "Please retry the request."
                ),
            )

        has_summary = bool(payload.summary_body and payload.summary_body.strip())
        if has_summary:
            if validated.summary is None or not str(validated.summary).strip():
                raise BadRequestException(
                    detail="AI did not return a summary rewrite. Please retry.",
                )
            summary_out = str(validated.summary).strip()
        else:
            summary_out = None

        return OptimizeResumeResponse(
            summary=summary_out,
            experience_bullets=validated.experience_bullets,
            skill_phrases=validated.skill_phrases,
            ats_notes=validated.ats_notes.strip(),
        )

    async def generate_cover_letter(
        self,
        *,
        resume_snapshot: dict,
        job_description: str,
        company_name: str | None,
        target_role: str | None,
    ) -> str:
        """Return a plain-text cover letter body generated from the resume + job description."""
        system = prompt_builders.system_generate_cover_letter()
        user = prompt_builders.user_generate_cover_letter(
            resume_snapshot=resume_snapshot,
            job_description=job_description,
            company_name=company_name,
            target_role=target_role,
        )
        raw = await self._complete_and_parse(
            system=system,
            user=user,
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS_SUMMARY * 2,
        )
        try:
            validated = GenerateCoverLetterAIOutput.model_validate(raw)
        except Exception as exc:
            logger.warning("ai.cover_letter_validation_failed", error=str(exc))
            raise BadRequestException(
                detail="AI returned data that failed validation. Try again with clearer input.",
            ) from exc
        return validated.body

    async def tailor_resume(
        self,
        *,
        resume_snapshot: dict,
        job_description: str,
        n_experiences: int,
    ) -> TailorResumeAIOutput:
        """Return a tailored resume snapshot aligned with the given job description."""
        system = prompt_builders.system_tailor_resume()
        user = prompt_builders.user_tailor_resume(
            resume_snapshot=resume_snapshot,
            job_description=job_description,
        )
        raw = await self._complete_and_parse(
            system=system,
            user=user,
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS_OPTIMIZE,
        )
        try:
            validated = TailorResumeAIOutput.model_validate(raw)
        except Exception as exc:
            logger.warning("ai.tailor_validation_failed", error=str(exc))
            raise BadRequestException(
                detail="AI returned data that failed validation. Try again with clearer input.",
            ) from exc

        if len(validated.experience_bullets) != n_experiences:
            raise BadRequestException(
                detail="AI output did not match resume structure. Please retry.",
            )
        return validated

    async def _complete_and_parse(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int,
    ) -> dict[str, Any]:
        try:
            text = await self._provider.complete_json(
                system_prompt=system,
                user_prompt=user,
                max_output_tokens=max_tokens,
            )
            return parse_json_object(text)
        except LLMProviderError as exc:
            logger.error("ai.llm_failure", error=str(exc))
            raise AIServiceException(
                detail="The AI service failed to produce a valid response. Please try again shortly.",
            ) from exc


def _experience_to_dict(exp: RewriteExperienceRequest) -> dict[str, Any]:
    return {
        "company": exp.company,
        "job_title": exp.job_title,
        "location": exp.location,
        "start_date": exp.start_date.isoformat(),
        "end_date": exp.end_date.isoformat() if exp.end_date else None,
        "is_current": exp.is_current,
        "bullets": list(exp.bullets),
    }


def _optimize_request_to_snapshot(req: OptimizeResumeRequest) -> dict[str, Any]:
    out: dict[str, Any] = {
        "title": req.title,
        "summary": req.summary_body,
        "experiences": [_experience_to_dict(e) for e in req.experiences],
        "educations": [
            {
                "institution": e.institution,
                "degree": e.degree,
                "field_of_study": e.field_of_study,
            }
            for e in req.educations
        ],
        "skills": [{"category": s.category, "items": list(s.items)} for s in req.skills],
    }
    if req.personal_info:
        out["personal_info"] = {
            "first_name": req.personal_info.first_name,
            "last_name": req.personal_info.last_name,
            "email": str(req.personal_info.email),
            "phone": req.personal_info.phone,
            "location": req.personal_info.location,
        }
    return out
