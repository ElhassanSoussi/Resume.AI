from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

from app.services.supabase_billing_mirror import sync_payment, sync_resume_export


class _TableOp:
    def __init__(self, store: dict[str, list[tuple[str, object]]], table_name: str) -> None:
        self._store = store
        self._table_name = table_name

    def upsert(self, payload: object, on_conflict: str | None = None) -> "_TableOp":
        self._store[self._table_name].append(("upsert", payload))
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


def test_sync_payment_upserts_payment_row() -> None:
    fake = _FakeSupabaseClient()
    payment = SimpleNamespace(
        id=uuid4(),
        user_id=uuid4(),
        resume_id=uuid4(),
        stripe_payment_intent_id="pi_123",
        stripe_checkout_session_id="cs_123",
        amount=1200,
        currency="usd",
        status="pending",
        product_type="single_pdf_export",
        created_at=None,
        updated_at=None,
    )

    with patch("app.services.supabase_billing_mirror.get_supabase_client", return_value=fake):
        sync_payment(payment)

    assert any(call[0] == "upsert" for call in fake.calls["payments"])
    assert any(call[0] == "execute" for call in fake.calls["payments"])


def test_sync_resume_export_upserts_export_row() -> None:
    fake = _FakeSupabaseClient()
    export = SimpleNamespace(
        id=uuid4(),
        resume_id=uuid4(),
        user_id=uuid4(),
        format="pdf",
        file_url="users/x/resumes/y/z.pdf",
        file_size_bytes=1024,
        status="completed",
        template_key="modern_sidebar",
        created_at=None,
        updated_at=None,
    )

    with patch("app.services.supabase_billing_mirror.get_supabase_client", return_value=fake):
        sync_resume_export(export)

    assert any(call[0] == "upsert" for call in fake.calls["resume_exports"])
    assert any(call[0] == "execute" for call in fake.calls["resume_exports"])
