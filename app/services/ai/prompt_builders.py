"""Strict, modular system/user prompts — no fabrication of facts."""

from __future__ import annotations

import json
from typing import Any

from app.schemas.ai import ResumeWritingMode

_JSON_ONLY_RULES = """
OUTPUT RULES (mandatory):
- Respond with a single JSON object only. No markdown fences, no commentary.
- Never invent employers, titles, dates, degrees, tools, metrics, awards, certifications, scope, or achievements.
- Preserve truth. Only rephrase, reorder, tighten, or organize wording using facts already present in the input.
- If the input is sparse, keep the output sparse. Do not compensate with generic AI filler.
- Prefer recruiter-friendly language, precise verbs, and concrete phrasing over hype, clichés, or corporate jargon.
- Avoid repetitive openings such as repeatedly starting bullets with "Responsible for", "Worked on", or "Helped".
- Only mention outcomes, scale, or impact when the input explicitly supports them.
"""

_QUALITY_RULES = """
QUALITY RULES:
- Keep tone professional, calm, and credible.
- Improve clarity before trying to sound impressive.
- Prefer action + scope + outcome structure when the source facts support it.
- Keep sentences scannable and useful to a recruiter reading quickly.
- Do not use vague phrases like "results-driven", "team player", "go-getter", or "hard-working professional" unless already present in the input.
"""

_SECTION_RULES = """
SECTION RULES:
- Summary: 2-4 sentences, specific to seniority and role direction, no generic aspiration fluff.
- Experience bullets: concise, readable, and fact-bound; start with varied action verbs when possible.
- Education: preserve institution, degree, field, dates, and only tighten descriptions if they exist.
- Skills: group or reorder only using provided skills; do not introduce tools or platforms not already present.
"""


def _writing_mode_rules(mode: ResumeWritingMode) -> str:
    return {
        "balanced": (
            "Write with balanced professional tone: strong but not flashy, concise but not overly terse."
        ),
        "concise": (
            "Prioritize brevity and scanning speed. Use shorter sentences and fewer words per bullet while preserving meaning."
        ),
        "achievement_focused": (
            "Emphasize outcomes, ownership, and impact only when the input clearly supports them. Never fabricate metrics."
        ),
        "ats_focused": (
            "Prioritize clear role-relevant terminology, direct phrasing, and standard recruiter vocabulary that remains easy to parse."
        ),
    }[mode]


def _infer_experience_level_from_snapshot(resume_snapshot: dict[str, Any]) -> str:
    title = str(resume_snapshot.get("title") or "").lower()
    experiences = list(resume_snapshot.get("experiences") or [])
    summary = str(resume_snapshot.get("summary") or "").lower()
    combined = " ".join(
        [
            title,
            summary,
            " ".join(str(exp.get("job_title") or "") for exp in experiences).lower(),
        ]
    )

    if any(token in combined for token in ("chief", "vp", "vice president", "head of", "director", "executive")):
        return "senior/executive"
    if any(token in combined for token in ("principal", "staff", "lead", "manager", "senior")):
        return "experienced"
    if any(token in combined for token in ("intern", "student", "graduate", "entry", "junior")):
        return "early-career"
    if len(experiences) <= 1:
        return "early-career"
    if len(experiences) >= 4:
        return "experienced"
    return "mid-level"


def _infer_industry_tone_from_snapshot(resume_snapshot: dict[str, Any]) -> str:
    title = str(resume_snapshot.get("title") or "").lower()
    skills = " ".join(
        item.lower()
        for group in list(resume_snapshot.get("skills") or [])
        for item in list(group.get("items") or [])
    )
    combined = f"{title} {skills}"

    if any(token in combined for token in ("software", "engineer", "developer", "python", "data", "cloud", "analytics")):
        return "technical and precise"
    if any(token in combined for token in ("designer", "brand", "marketing", "content", "creative")):
        return "creative but still professional"
    if any(token in combined for token in ("finance", "analyst", "consulting", "operations", "strategy")):
        return "analytical and business-formal"
    if any(token in combined for token in ("sales", "account", "customer", "success", "partnership")):
        return "commercial and relationship-oriented"
    return "general professional"


def _resume_context_payload(resume_snapshot: dict[str, Any]) -> dict[str, Any]:
    return {
        "target_role_hint": resume_snapshot.get("title"),
        "experience_level": _infer_experience_level_from_snapshot(resume_snapshot),
        "industry_tone": _infer_industry_tone_from_snapshot(resume_snapshot),
    }


def system_rewrite_summary(mode: ResumeWritingMode) -> str:
    return f"""You are an expert resume writer improving a professional summary.
{_JSON_ONLY_RULES}
{_QUALITY_RULES}
{_SECTION_RULES}
WRITING MODE:
- {_writing_mode_rules(mode)}
The JSON object must have exactly one key: "rewritten_summary" (string).
The rewritten_summary must use only information implied by the user's summary text and optional job context provided in the user message."""


def user_rewrite_summary(
    *,
    summary_body: str,
    target_role: str | None,
    job_description: str | None,
    writing_mode: ResumeWritingMode,
) -> str:
    payload: dict[str, Any] = {
        "task": "rewrite_professional_summary",
        "writing_mode": writing_mode,
        "current_summary_text": summary_body,
    }
    if target_role:
        payload["target_role_context"] = target_role
    if job_description:
        payload["job_description_context"] = job_description
    return json.dumps(payload, ensure_ascii=False)


def system_rewrite_experience(mode: ResumeWritingMode) -> str:
    return f"""You are an expert resume writer improving experience bullets.
{_JSON_ONLY_RULES}
{_QUALITY_RULES}
{_SECTION_RULES}
WRITING MODE:
- {_writing_mode_rules(mode)}
The JSON object must have exactly one key: "bullets" (array of strings).
Each bullet must reflect only facts present in the input experience, including existing bullets and metadata.
Keep bullets concise, varied, and recruiter-friendly without adding new claims."""


def user_rewrite_experience(experience: dict[str, Any], *, writing_mode: ResumeWritingMode) -> str:
    payload = {
        "task": "rewrite_experience_bullets",
        "writing_mode": writing_mode,
        "experience": experience,
    }
    return json.dumps(payload, ensure_ascii=False)


def system_optimize_resume(mode: ResumeWritingMode) -> str:
    return f"""You are an expert resume writer optimizing a full resume.
{_JSON_ONLY_RULES}
{_QUALITY_RULES}
{_SECTION_RULES}
WRITING MODE:
- {_writing_mode_rules(mode)}
Return a JSON object with these keys:
- "summary" (string or null): If input included a summary, return a tighter rewrite using only that text. If no summary was provided, use null.
- "experience_bullets" (array of arrays of strings): Must have the same length as input.experiences. For each experience at index i, return improved bullet strings using only facts from that experience's bullets and metadata.
- "skill_phrases" (array of strings, optional): Up to 12 short phrases drawn only from words already present in input skills/items; may reorder or regroup, but do not invent.
- "ats_notes" (string): Brief notes (max 400 chars) about clarity, keyword alignment, or format using only the provided resume content and context."""


def user_optimize_resume(
    resume_snapshot: dict[str, Any],
    *,
    writing_mode: ResumeWritingMode,
) -> str:
    payload = {
        "task": "optimize_full_resume",
        "writing_mode": writing_mode,
        "context": _resume_context_payload(resume_snapshot),
        "resume": resume_snapshot,
    }
    return json.dumps(payload, ensure_ascii=False)


def system_generate_cover_letter(*, tone: str = "professional") -> str:
    tone_line = {
        "professional": "Tone: confident, professional, and restrained — no hype or exclamation marks.",
        "direct": "Tone: direct and efficient — short sentences, minimal flourish, still courteous.",
        "warm": "Tone: warm and personable while staying credible — conversational but not casual slang.",
    }.get(tone, "Tone: confident, professional, and restrained — no hype or exclamation marks.")
    return f"""You are a professional cover letter writer.
{_JSON_ONLY_RULES}
{_QUALITY_RULES}
The JSON object must have exactly one key: "body" (string).
Write a compelling, concise 3-paragraph cover letter under 400 words.
Use only information present in the resume snapshot and job description.
Keep the tone credible, specific, and human — never generic or overblown.
{tone_line}"""


def user_generate_cover_letter(
    *,
    resume_snapshot: dict[str, Any],
    job_description: str,
    company_name: str | None,
    target_role: str | None,
    tone: str = "professional",
) -> str:
    payload: dict[str, Any] = {
        "task": "generate_cover_letter",
        "tone": tone,
        "context": _resume_context_payload(resume_snapshot),
        "resume": resume_snapshot,
        "job_description": job_description,
    }
    if company_name:
        payload["company_name"] = company_name
    if target_role:
        payload["target_role"] = target_role
    return json.dumps(payload, ensure_ascii=False)


def system_tailor_resume() -> str:
    return f"""You are an expert resume writer optimizing for a specific job description.
{_JSON_ONLY_RULES}
{_QUALITY_RULES}
{_SECTION_RULES}
Return a JSON object with these keys:
- "summary" (string or null): Job-aligned rewrite using only existing summary facts.
- "experience_bullets" (array of arrays of strings): Must have the same length as input.experiences. Rewrite bullets to mirror relevant job wording using only existing facts.
- "skill_phrases" (array of strings, optional): Up to 12 phrases from existing skills/items that best match the job.
- "ats_notes" (string): Brief notes (max 400 chars) on keyword alignment or remaining gaps using only the provided resume and job description."""


def user_tailor_resume(
    *,
    resume_snapshot: dict[str, Any],
    job_description: str,
) -> str:
    payload = {
        "task": "tailor_resume_for_job",
        "context": _resume_context_payload(resume_snapshot),
        "resume": resume_snapshot,
        "job_description": job_description,
    }
    return json.dumps(payload, ensure_ascii=False)
