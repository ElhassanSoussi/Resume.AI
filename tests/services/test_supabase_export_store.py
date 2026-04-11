from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

from app.services.supabase_export_store import create_export, get_latest_export_for_resume_and_user, list_exports_for_user


class _TableOp:
    def __init__(self, store: dict[str, list[tuple[str, object]]], table_name: str, response: SimpleNamespace) -> None:
        self._store = store
        self._table_name = table_name
        self._response = response

    def select(self, *_args, **_kwargs):
        self._store[self._table_name].append(("select", None))
        return self

    def insert(self, payload):
        self._store[self._table_name].append(("insert", payload))
        return self

    def eq(self, column, value):
        self._store[self._table_name].append((f"eq:{column}", value))
        return self

    def order(self, column, desc=False):
        self._store[self._table_name].append((f"order:{column}", desc))
        return self

    def range(self, start, end):
        self._store[self._table_name].append(("range", (start, end)))
        return self

    def limit(self, count):
        self._store[self._table_name].append(("limit", count))
        return self

    def execute(self):
        self._store[self._table_name].append(("execute", None))
        return self._response


class _FakeSupabaseClient:
    def __init__(self, responses: dict[str, SimpleNamespace]) -> None:
        self.calls: dict[str, list[tuple[str, object]]] = {}
        self.responses = responses

    def table(self, table_name: str):
        self.calls.setdefault(table_name, [])
        return _TableOp(self.calls, table_name, self.responses[table_name])


def _export_row():
    eid = uuid4()
    rid = uuid4()
    uid = uuid4()
    return {
        "id": str(eid),
        "resume_id": str(rid),
        "user_id": str(uid),
        "format": "pdf",
        "file_url": f"users/{uid}/resumes/{rid}/{eid}.pdf",
        "file_size_bytes": 1024,
        "status": "completed",
        "template_key": "modern_sidebar",
        "created_at": "2026-04-11T00:00:00+00:00",
        "updated_at": "2026-04-11T00:00:00+00:00",
    }


def test_list_exports_for_user_returns_rows() -> None:
    row = _export_row()
    fake = _FakeSupabaseClient({"resume_exports": SimpleNamespace(data=[row], count=1)})

    with patch("app.services.supabase_export_store.get_supabase_client", return_value=fake):
        rows = list_exports_for_user(uuid4(), offset=0, limit=50)

    assert len(rows) == 1
    assert rows[0].template_key == "modern_sidebar"


def test_create_export_inserts_then_fetches() -> None:
    row = _export_row()
    fake = _FakeSupabaseClient({"resume_exports": SimpleNamespace(data=[row], count=1)})

    with patch("app.services.supabase_export_store.get_supabase_client", return_value=fake):
        export = create_export(
            {
                "id": row["id"],
                "resume_id": row["resume_id"],
                "user_id": row["user_id"],
                "format": "pdf",
                "status": "processing",
                "template_key": "modern_sidebar",
            }
        )

    assert export.id.hex
    assert any(call[0] == "insert" for call in fake.calls["resume_exports"])


def test_get_latest_export_for_resume_and_user_uses_filters() -> None:
    row = _export_row()
    fake = _FakeSupabaseClient({"resume_exports": SimpleNamespace(data=[row], count=1)})

    with patch("app.services.supabase_export_store.get_supabase_client", return_value=fake):
        export = get_latest_export_for_resume_and_user(uuid4(), uuid4())

    assert export is not None
    assert any(call[0] == "limit" for call in fake.calls["resume_exports"])
