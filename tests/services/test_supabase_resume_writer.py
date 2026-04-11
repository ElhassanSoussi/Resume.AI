from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

from app.schemas.resume import ResumeCreate, ResumeFullUpdate, ResumeUpdate
from app.services.supabase_resume_writer import (
    create_resume_graph,
    delete_resume_graph,
    full_replace_resume_graph,
    patch_resume_graph,
)


class _TableOp:
    def __init__(self, store: dict[str, list[tuple[str, object]]], table_name: str) -> None:
        self._store = store
        self._table_name = table_name

    def insert(self, payload: object) -> "_TableOp":
        self._store[self._table_name].append(("insert", payload))
        return self

    def update(self, payload: object) -> "_TableOp":
        self._store[self._table_name].append(("update", payload))
        return self

    def upsert(self, payload: object, on_conflict: str | None = None) -> "_TableOp":
        self._store[self._table_name].append(("upsert", payload))
        return self

    def delete(self) -> "_TableOp":
        self._store[self._table_name].append(("delete", None))
        return self

    def eq(self, column: str, value: object) -> "_TableOp":
        self._store[self._table_name].append((f"eq:{column}", value))
        return self

    def execute(self) -> SimpleNamespace:
        self._store[self._table_name].append(("execute", None))
        return SimpleNamespace(data=None)


class _FakeSupabaseClient:
    def __init__(self) -> None:
        self.calls: dict[str, list[tuple[str, object]]] = {}

    def table(self, table_name: str) -> _TableOp:
        self.calls.setdefault(table_name, [])
        return _TableOp(self.calls, table_name)


def _resume_read(user_id, resume_id):
    return {
        "id": str(resume_id),
        "user_id": str(user_id),
        "title": "Resume",
        "template_key": "modern",
        "status": "draft",
        "created_at": "2026-04-11T00:00:00+00:00",
        "updated_at": "2026-04-11T00:00:00+00:00",
        "personal_info": None,
        "summary": None,
        "experiences": [],
        "educations": [],
        "skills": [],
    }


def test_create_resume_graph_inserts_resume_and_children() -> None:
    fake = _FakeSupabaseClient()
    user_id = uuid4()
    payload = ResumeCreate(title="Resume")

    with (
        patch("app.services.supabase_resume_writer.get_supabase_client", return_value=fake),
        patch(
            "app.services.supabase_resume_writer.fetch_resume_detail",
            side_effect=lambda _uid, rid: SimpleNamespace(**_resume_read(user_id, rid)),
        ),
    ):
        resume = create_resume_graph(user_id, payload)

    assert resume.title == "Resume"
    assert any(call[0] == "insert" for call in fake.calls["resumes"])


def test_full_replace_resume_graph_updates_resume() -> None:
    fake = _FakeSupabaseClient()
    user_id = uuid4()
    resume_id = uuid4()
    payload = ResumeFullUpdate(title="Updated", status="draft")

    with (
        patch("app.services.supabase_resume_writer.get_supabase_client", return_value=fake),
        patch(
            "app.services.supabase_resume_writer.fetch_resume_detail",
            side_effect=[SimpleNamespace(**_resume_read(user_id, resume_id)), SimpleNamespace(**_resume_read(user_id, resume_id))],
        ),
    ):
        resume = full_replace_resume_graph(user_id, resume_id, payload)

    assert str(resume.id) == str(resume_id)
    assert any(call[0] == "update" for call in fake.calls["resumes"])


def test_patch_resume_graph_updates_scalars() -> None:
    fake = _FakeSupabaseClient()
    user_id = uuid4()
    resume_id = uuid4()
    payload = ResumeUpdate(title="Patched")

    with (
        patch("app.services.supabase_resume_writer.get_supabase_client", return_value=fake),
        patch(
            "app.services.supabase_resume_writer.fetch_resume_detail",
            side_effect=[SimpleNamespace(**_resume_read(user_id, resume_id)), SimpleNamespace(**_resume_read(user_id, resume_id))],
        ),
    ):
        resume = patch_resume_graph(user_id, resume_id, payload)

    assert str(resume.id) == str(resume_id)
    assert any(call[0] == "update" for call in fake.calls["resumes"])


def test_delete_resume_graph_deletes_resume() -> None:
    fake = _FakeSupabaseClient()
    user_id = uuid4()
    resume_id = uuid4()

    with (
        patch("app.services.supabase_resume_writer.get_supabase_client", return_value=fake),
        patch(
            "app.services.supabase_resume_writer.fetch_resume_detail",
            return_value=SimpleNamespace(**_resume_read(user_id, resume_id)),
        ),
    ):
        delete_resume_graph(user_id, resume_id)

    assert any(call[0] == "delete" for call in fake.calls["resumes"])
