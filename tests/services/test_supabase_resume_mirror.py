from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import patch

from tests.factories import make_resume_model_mock
from app.services.supabase_resume_mirror import delete_resume_graph, sync_resume_graph


class _TableOp:
    def __init__(self, store: dict[str, list[tuple[str, object]]], table_name: str) -> None:
        self._store = store
        self._table_name = table_name

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


def test_sync_resume_graph_upserts_resume_and_children() -> None:
    fake = _FakeSupabaseClient()
    resume = make_resume_model_mock(user_id=uuid.uuid4())

    with patch("app.services.supabase_resume_mirror.get_supabase_client", return_value=fake):
        sync_resume_graph(resume)

    assert any(call[0] == "upsert" for call in fake.calls["resumes"])
    assert any(call[0] == "delete" for call in fake.calls["resume_personal_info"])
    assert any(call[0] == "upsert" for call in fake.calls["resume_personal_info"])
    assert any(call[0] == "upsert" for call in fake.calls["resume_summaries"])
    assert any(call[0] == "upsert" for call in fake.calls["resume_experiences"])
    assert any(call[0] == "upsert" for call in fake.calls["resume_educations"])
    assert any(call[0] == "upsert" for call in fake.calls["resume_skills"])


def test_delete_resume_graph_deletes_children_then_resume() -> None:
    fake = _FakeSupabaseClient()
    resume_id = uuid.uuid4()

    with patch("app.services.supabase_resume_mirror.get_supabase_client", return_value=fake):
        delete_resume_graph(resume_id)

    for table_name in (
        "resume_personal_info",
        "resume_summaries",
        "resume_experiences",
        "resume_educations",
        "resume_skills",
        "resumes",
    ):
        assert any(call[0] == "delete" for call in fake.calls[table_name])
        assert any(call[0] == "execute" for call in fake.calls[table_name])
