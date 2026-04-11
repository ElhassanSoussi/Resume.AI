from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from app.core.supabase import get_supabase_client
from app.models.resume import Resume


def _serialize_uuid(value: uuid.UUID | None) -> str | None:
    return str(value) if value is not None else None


def _serialize_date(value: date | None) -> str | None:
    return value.isoformat() if value is not None else None


def _serialize_datetime(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def _base_resume_payload(resume: Resume) -> dict[str, Any]:
    return {
        "id": _serialize_uuid(resume.id),
        "user_id": _serialize_uuid(resume.user_id),
        "title": resume.title,
        "template_key": resume.template_key,
        "status": resume.status,
        "created_at": _serialize_datetime(resume.created_at),
        "updated_at": _serialize_datetime(resume.updated_at),
    }


def _personal_info_payload(resume: Resume) -> list[dict[str, Any]]:
    if resume.personal_info is None:
        return []

    info = resume.personal_info
    return [
        {
            "id": _serialize_uuid(info.id),
            "resume_id": _serialize_uuid(info.resume_id),
            "first_name": info.first_name,
            "last_name": info.last_name,
            "email": info.email,
            "phone": info.phone,
            "location": info.location,
            "website": info.website,
            "linkedin_url": info.linkedin_url,
            "github_url": info.github_url,
            "created_at": _serialize_datetime(info.created_at),
            "updated_at": _serialize_datetime(info.updated_at),
        }
    ]


def _summary_payload(resume: Resume) -> list[dict[str, Any]]:
    if resume.summary is None:
        return []

    summary = resume.summary
    return [
        {
            "id": _serialize_uuid(summary.id),
            "resume_id": _serialize_uuid(summary.resume_id),
            "body": summary.body,
            "created_at": _serialize_datetime(summary.created_at),
            "updated_at": _serialize_datetime(summary.updated_at),
        }
    ]


def _experiences_payload(resume: Resume) -> list[dict[str, Any]]:
    return [
        {
            "id": _serialize_uuid(exp.id),
            "resume_id": _serialize_uuid(exp.resume_id),
            "company": exp.company,
            "job_title": exp.job_title,
            "location": exp.location,
            "start_date": _serialize_date(exp.start_date),
            "end_date": _serialize_date(exp.end_date),
            "is_current": exp.is_current,
            "bullets": list(exp.bullets or []),
            "sort_order": exp.sort_order,
            "created_at": _serialize_datetime(exp.created_at),
            "updated_at": _serialize_datetime(exp.updated_at),
        }
        for exp in resume.experiences
    ]


def _educations_payload(resume: Resume) -> list[dict[str, Any]]:
    return [
        {
            "id": _serialize_uuid(edu.id),
            "resume_id": _serialize_uuid(edu.resume_id),
            "institution": edu.institution,
            "degree": edu.degree,
            "field_of_study": edu.field_of_study,
            "location": edu.location,
            "start_date": _serialize_date(edu.start_date),
            "end_date": _serialize_date(edu.end_date),
            "gpa": edu.gpa,
            "description": edu.description,
            "sort_order": edu.sort_order,
            "created_at": _serialize_datetime(edu.created_at),
            "updated_at": _serialize_datetime(edu.updated_at),
        }
        for edu in resume.educations
    ]


def _skills_payload(resume: Resume) -> list[dict[str, Any]]:
    return [
        {
            "id": _serialize_uuid(skill.id),
            "resume_id": _serialize_uuid(skill.resume_id),
            "category": skill.category,
            "items": list(skill.items or []),
            "sort_order": skill.sort_order,
            "created_at": _serialize_datetime(skill.created_at),
            "updated_at": _serialize_datetime(skill.updated_at),
        }
        for skill in resume.skills
    ]


def sync_resume_graph(resume: Resume) -> None:
    client = get_supabase_client()
    client.table("resumes").upsert(_base_resume_payload(resume), on_conflict="id").execute()

    child_specs = [
        ("resume_personal_info", _personal_info_payload(resume)),
        ("resume_summaries", _summary_payload(resume)),
        ("resume_experiences", _experiences_payload(resume)),
        ("resume_educations", _educations_payload(resume)),
        ("resume_skills", _skills_payload(resume)),
    ]

    for table_name, payload in child_specs:
        client.table(table_name).delete().eq("resume_id", str(resume.id)).execute()
        if payload:
            client.table(table_name).upsert(payload, on_conflict="id").execute()


def delete_resume_graph(resume_id: uuid.UUID) -> None:
    client = get_supabase_client()
    resume_id_str = str(resume_id)
    for table_name in (
        "resume_personal_info",
        "resume_summaries",
        "resume_experiences",
        "resume_educations",
        "resume_skills",
    ):
        client.table(table_name).delete().eq("resume_id", resume_id_str).execute()
    client.table("resumes").delete().eq("id", resume_id_str).execute()
