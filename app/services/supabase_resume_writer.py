from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import NotFoundException
from app.core.supabase import get_supabase_client
from app.schemas.resume import ResumeCreate, ResumeFullUpdate, ResumeRead, ResumeUpdate
from app.services.supabase_resume_reader import fetch_resume_detail


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _serialize_uuid(value: uuid.UUID | None) -> str | None:
    return str(value) if value is not None else None


def _build_child_payloads(
    *,
    resume_id: uuid.UUID,
    payload: ResumeCreate | ResumeFullUpdate,
    timestamp: str,
) -> dict[str, list[dict[str, Any]]]:
    personal_info = []
    if payload.personal_info is not None:
        personal_info.append(
            {
                "id": str(uuid.uuid4()),
                "resume_id": str(resume_id),
                **payload.personal_info.model_dump(mode="json"),
                "created_at": timestamp,
                "updated_at": timestamp,
            }
        )

    summary = []
    if payload.summary is not None:
        summary.append(
            {
                "id": str(uuid.uuid4()),
                "resume_id": str(resume_id),
                **payload.summary.model_dump(mode="json"),
                "created_at": timestamp,
                "updated_at": timestamp,
            }
        )

    experiences = [
        {
            "id": str(uuid.uuid4()),
            "resume_id": str(resume_id),
            **item.model_dump(mode="json"),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        for item in payload.experiences
    ]
    educations = [
        {
            "id": str(uuid.uuid4()),
            "resume_id": str(resume_id),
            **item.model_dump(mode="json"),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        for item in payload.educations
    ]
    skills = [
        {
            "id": str(uuid.uuid4()),
            "resume_id": str(resume_id),
            **item.model_dump(mode="json"),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        for item in payload.skills
    ]

    return {
        "resume_personal_info": personal_info,
        "resume_summaries": summary,
        "resume_experiences": experiences,
        "resume_educations": educations,
        "resume_skills": skills,
    }


def _replace_children(resume_id: uuid.UUID, child_payloads: dict[str, list[dict[str, Any]]]) -> None:
    client = get_supabase_client()
    resume_id_str = str(resume_id)
    for table_name, payload in child_payloads.items():
        client.table(table_name).delete().eq("resume_id", resume_id_str).execute()
        if payload:
            client.table(table_name).upsert(payload, on_conflict="id").execute()


def create_resume_graph(user_id: uuid.UUID, payload: ResumeCreate) -> ResumeRead:
    client = get_supabase_client()
    resume_id = uuid.uuid4()
    timestamp = _now_iso()
    client.table("resumes").insert(
        {
            "id": str(resume_id),
            "user_id": str(user_id),
            "title": payload.title,
            "template_key": payload.template_key,
            "status": "draft",
            "created_at": timestamp,
            "updated_at": timestamp,
        }
    ).execute()
    _replace_children(
        resume_id,
        _build_child_payloads(resume_id=resume_id, payload=payload, timestamp=timestamp),
    )
    resume = fetch_resume_detail(user_id, resume_id)
    if resume is None:
        raise NotFoundException("Resume")
    return resume


def full_replace_resume_graph(
    user_id: uuid.UUID,
    resume_id: uuid.UUID,
    payload: ResumeFullUpdate,
) -> ResumeRead:
    client = get_supabase_client()
    existing = fetch_resume_detail(user_id, resume_id)
    if existing is None:
        raise NotFoundException("Resume")

    client.table("resumes").update(
        {
            "title": payload.title,
            "template_key": payload.template_key,
            "status": payload.status,
            "updated_at": _now_iso(),
        }
    ).eq("id", str(resume_id)).eq("user_id", str(user_id)).execute()

    _replace_children(
        resume_id,
        _build_child_payloads(resume_id=resume_id, payload=payload, timestamp=_now_iso()),
    )
    resume = fetch_resume_detail(user_id, resume_id)
    if resume is None:
        raise NotFoundException("Resume")
    return resume


def patch_resume_graph(
    user_id: uuid.UUID,
    resume_id: uuid.UUID,
    payload: ResumeUpdate,
) -> ResumeRead:
    existing = fetch_resume_detail(user_id, resume_id)
    if existing is None:
        raise NotFoundException("Resume")

    data = payload.model_dump(mode="json", exclude_unset=True)
    if data:
        data["updated_at"] = _now_iso()
        get_supabase_client().table("resumes").update(data).eq("id", str(resume_id)).eq(
            "user_id", str(user_id)
        ).execute()

    resume = fetch_resume_detail(user_id, resume_id)
    if resume is None:
        raise NotFoundException("Resume")
    return resume


def delete_resume_graph(user_id: uuid.UUID, resume_id: uuid.UUID) -> None:
    existing = fetch_resume_detail(user_id, resume_id)
    if existing is None:
        raise NotFoundException("Resume")

    get_supabase_client().table("resumes").delete().eq("id", str(resume_id)).eq(
        "user_id", str(user_id)
    ).execute()
