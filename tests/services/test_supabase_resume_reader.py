from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

from app.services.supabase_resume_reader import fetch_resume_detail, fetch_resume_list


def test_fetch_resume_detail_normalizes_one_to_one_and_many_relations() -> None:
    user_id = uuid4()
    resume_id = uuid4()
    response = SimpleNamespace(
        data=[
            {
                "id": str(resume_id),
                "user_id": str(user_id),
                "title": "Resume",
                "template_key": "modern",
                "status": "draft",
                "created_at": "2026-04-11T00:00:00+00:00",
                "updated_at": "2026-04-11T00:00:00+00:00",
                "personal_info": [
                    {
                        "id": str(uuid4()),
                        "resume_id": str(resume_id),
                        "first_name": "Jane",
                        "last_name": "Doe",
                        "email": "jane@example.com",
                        "phone": None,
                        "location": None,
                        "website": None,
                        "linkedin_url": None,
                        "github_url": None,
                        "created_at": "2026-04-11T00:00:00+00:00",
                        "updated_at": "2026-04-11T00:00:00+00:00",
                    }
                ],
                "summary": [],
                "experiences": [],
                "educations": [],
                "skills": [],
            }
        ]
    )

    builder = SimpleNamespace(
        select=lambda *_args, **_kwargs: builder,
        eq=lambda *_args, **_kwargs: builder,
        limit=lambda *_args, **_kwargs: builder,
        execute=lambda: response,
    )
    fake = SimpleNamespace(table=lambda _name: builder)

    with patch("app.services.supabase_resume_reader.get_supabase_client", return_value=fake):
        resume = fetch_resume_detail(user_id, resume_id)

    assert resume is not None
    assert resume.personal_info is not None
    assert resume.personal_info.first_name == "Jane"
    assert resume.summary is None


def test_fetch_resume_list_returns_items_and_count() -> None:
    user_id = uuid4()
    response = SimpleNamespace(
        data=[
            {
                "id": str(uuid4()),
                "user_id": str(user_id),
                "title": "Resume 1",
                "template_key": "modern",
                "status": "draft",
                "created_at": "2026-04-11T00:00:00+00:00",
                "updated_at": "2026-04-11T00:00:00+00:00",
            }
        ],
        count=1,
    )
    builder = SimpleNamespace(
        select=lambda *_args, **_kwargs: builder,
        eq=lambda *_args, **_kwargs: builder,
        order=lambda *_args, **_kwargs: builder,
        range=lambda *_args, **_kwargs: builder,
        execute=lambda: response,
    )
    fake = SimpleNamespace(table=lambda _name: builder)

    with patch("app.services.supabase_resume_reader.get_supabase_client", return_value=fake):
        items, total = fetch_resume_list(user_id, offset=0, limit=50)

    assert total == 1
    assert len(items) == 1
    assert items[0].title == "Resume 1"
