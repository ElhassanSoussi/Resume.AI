from __future__ import annotations

import uuid

from app.core.supabase import get_supabase_client
from app.schemas.resume import ResumeListItem, ResumeRead

_RESUME_DETAIL_SELECT = (
    "id,user_id,title,template_key,status,created_at,updated_at,"
    "personal_info:resume_personal_info(*),"
    "summary:resume_summaries(*),"
    "experiences:resume_experiences(*),"
    "educations:resume_educations(*),"
    "skills:resume_skills(*)"
)

_RESUME_LIST_SELECT = "id,user_id,title,template_key,status,created_at,updated_at"


def _normalize_one_to_one(value: object) -> object | None:
    if isinstance(value, list):
        return value[0] if value else None
    return value


def _normalize_many(value: object) -> list[object]:
    if isinstance(value, list):
        return value
    return []


def _row_to_resume_read(row: dict) -> ResumeRead:
    payload = {
        **row,
        "personal_info": _normalize_one_to_one(row.get("personal_info")),
        "summary": _normalize_one_to_one(row.get("summary")),
        "experiences": _normalize_many(row.get("experiences")),
        "educations": _normalize_many(row.get("educations")),
        "skills": _normalize_many(row.get("skills")),
    }
    return ResumeRead.model_validate(payload)


def fetch_resume_detail(user_id: uuid.UUID, resume_id: uuid.UUID) -> ResumeRead | None:
    response = (
        get_supabase_client()
        .table("resumes")
        .select(_RESUME_DETAIL_SELECT)
        .eq("user_id", str(user_id))
        .eq("id", str(resume_id))
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_resume_read(rows[0])


def fetch_resume_list(
    user_id: uuid.UUID,
    *,
    offset: int = 0,
    limit: int = 50,
) -> tuple[list[ResumeListItem], int]:
    table = get_supabase_client().table("resumes")
    response = (
        table.select(_RESUME_LIST_SELECT, count="exact")
        .eq("user_id", str(user_id))
        .order("updated_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    rows = response.data or []
    items = [ResumeListItem.model_validate(row) for row in rows]
    total = response.count or 0
    return items, total
