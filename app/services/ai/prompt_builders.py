"""Strict, modular system/user prompts — no fabrication of facts."""

from __future__ import annotations

import json
from typing import Any

_JSON_ONLY_RULES = """
OUTPUT RULES (mandatory):
- Respond with a single JSON object only. No markdown fences, no commentary.
- Do not invent employers, titles, dates, degrees, tools, metrics, or achievements.
- Only rephrase, reorder, tighten, or ATS-optimize wording using facts present in the input.
- If the input is sparse, keep output concise; do not add filler credentials.
"""


def system_rewrite_summary() -> str:
    return f"""You are an expert resume editor for ATS systems.
{_JSON_ONLY_RULES}
The JSON object must have exactly one key: "rewritten_summary" (string).
The rewritten_summary must use only information implied by the user's summary text and optional job context provided in the user message."""


def user_rewrite_summary(
    *,
    summary_body: str,
    target_role: str | None,
    job_description: str | None,
) -> str:
    payload: dict[str, Any] = {
        "task": "rewrite_professional_summary",
        "current_summary_text": summary_body,
    }
    if target_role:
        payload["target_role_context"] = target_role
    if job_description:
        payload["job_description_context"] = job_description
    return json.dumps(payload, ensure_ascii=False)


def system_rewrite_experience() -> str:
    return f"""You are an expert resume editor for ATS systems.
{_JSON_ONLY_RULES}
The JSON object must have exactly one key: "bullets" (array of strings).
Each bullet must reflect only facts present in the input experience (including existing bullets). Improve clarity, action verbs, and scannability without adding new claims."""


def user_rewrite_experience(experience: dict[str, Any]) -> str:
    payload = {
        "task": "rewrite_experience_bullets",
        "experience": experience,
    }
    return json.dumps(payload, ensure_ascii=False)


def system_optimize_resume() -> str:
    return f"""You are an expert resume editor for ATS systems.
{_JSON_ONLY_RULES}
Return a JSON object with these keys:
- "summary" (string or null): If input included a summary, return a tightened ATS-friendly rewrite using only that text. If no summary was provided, use null.
- "experience_bullets" (array of arrays of strings): Must have the same length as input.experiences. For each experience at index i, return improved bullet strings using only facts from that experience's bullets and metadata (company, title, dates). Do not add new employers or dates.
- "skill_phrases" (array of strings, optional): Up to 12 short phrases drawn only from words already present in input skills/items; may reorder or group; empty array if no skills provided.
- "ats_notes" (string): Brief notes (max 400 chars) about formatting/keyword alignment using ONLY words that appear in the input resume JSON; no new credentials.
"""


def user_optimize_resume(resume_snapshot: dict[str, Any]) -> str:
    payload = {
        "task": "optimize_full_resume",
        "resume": resume_snapshot,
    }
    return json.dumps(payload, ensure_ascii=False)
