"""Reusable payload factories for tests."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Any
from unittest.mock import MagicMock


def make_resume_create_payload(**overrides: Any) -> dict:
    base: dict[str, Any] = {
        "title": "Senior Engineer Resume",
        "template_key": "modern",
        "personal_info": {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
            "phone": "+1-555-0100",
            "location": "San Francisco, CA",
            "linkedin_url": "https://linkedin.com/in/janedoe",
        },
        "summary": {
            "body": "Experienced software engineer with 8+ years building scalable systems."
        },
        "experiences": [
            {
                "company": "Acme Corp",
                "job_title": "Senior Engineer",
                "location": "San Francisco, CA",
                "start_date": "2020-01-15",
                "end_date": None,
                "is_current": True,
                "bullets": [
                    "Led migration to microservices architecture",
                    "Reduced API latency by 40%",
                ],
                "sort_order": 0,
            },
        ],
        "educations": [
            {
                "institution": "MIT",
                "degree": "B.S.",
                "field_of_study": "Computer Science",
                "start_date": "2012-09-01",
                "end_date": "2016-06-15",
                "gpa": "3.8",
                "sort_order": 0,
            },
        ],
        "skills": [
            {
                "category": "Languages",
                "items": ["Python", "TypeScript", "Go"],
                "sort_order": 0,
            },
        ],
    }
    base.update(overrides)
    return base


def make_resume_full_update_payload(**overrides: Any) -> dict:
    payload = make_resume_create_payload(**overrides)
    payload.setdefault("status", "draft")
    return payload


def _ts() -> datetime:
    return datetime.now(timezone.utc)


def make_resume_model_mock(
    resume_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    **overrides: Any,
) -> MagicMock:
    rid = resume_id or uuid.uuid4()
    uid = user_id or uuid.uuid4()
    now = _ts()

    pi = MagicMock()
    pi.id = uuid.uuid4()
    pi.resume_id = rid
    pi.first_name = "Jane"
    pi.last_name = "Doe"
    pi.email = "jane@example.com"
    pi.phone = "+1-555-0100"
    pi.location = "San Francisco, CA"
    pi.website = None
    pi.linkedin_url = "https://linkedin.com/in/janedoe"
    pi.github_url = None
    pi.created_at = now
    pi.updated_at = now

    summary = MagicMock()
    summary.id = uuid.uuid4()
    summary.resume_id = rid
    summary.body = "Experienced software engineer with 8+ years building scalable systems."
    summary.created_at = now
    summary.updated_at = now

    exp = MagicMock()
    exp.id = uuid.uuid4()
    exp.resume_id = rid
    exp.company = "Acme Corp"
    exp.job_title = "Senior Engineer"
    exp.location = "San Francisco, CA"
    exp.start_date = date(2020, 1, 15)
    exp.end_date = None
    exp.is_current = True
    exp.bullets = ["Led migration to microservices architecture", "Reduced API latency by 40%"]
    exp.sort_order = 0
    exp.created_at = now
    exp.updated_at = now

    edu = MagicMock()
    edu.id = uuid.uuid4()
    edu.resume_id = rid
    edu.institution = "MIT"
    edu.degree = "B.S."
    edu.field_of_study = "Computer Science"
    edu.location = None
    edu.start_date = date(2012, 9, 1)
    edu.end_date = date(2016, 6, 15)
    edu.gpa = "3.8"
    edu.description = None
    edu.sort_order = 0
    edu.created_at = now
    edu.updated_at = now

    skill = MagicMock()
    skill.id = uuid.uuid4()
    skill.resume_id = rid
    skill.category = "Languages"
    skill.items = ["Python", "TypeScript", "Go"]
    skill.sort_order = 0
    skill.created_at = now
    skill.updated_at = now

    resume = MagicMock()
    resume.id = rid
    resume.user_id = uid
    resume.title = overrides.get("title", "Senior Engineer Resume")
    resume.template_key = overrides.get("template_key", "modern")
    resume.status = overrides.get("status", "draft")
    resume.created_at = now
    resume.updated_at = now
    resume.personal_info = pi
    resume.summary = summary
    resume.experiences = [exp]
    resume.educations = [edu]
    resume.skills = [skill]

    for key, value in overrides.items():
        setattr(resume, key, value)

    return resume


def make_resume_list_item_mock(
    resume_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    **overrides: Any,
) -> MagicMock:
    now = _ts()
    item = MagicMock()
    item.id = resume_id or uuid.uuid4()
    item.user_id = user_id or uuid.uuid4()
    item.title = overrides.get("title", "My Resume")
    item.template_key = overrides.get("template_key", "modern")
    item.status = overrides.get("status", "draft")
    item.created_at = now
    item.updated_at = now
    return item
