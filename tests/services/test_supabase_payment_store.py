from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

from app.core.constants import PAYMENT_STATUS_PENDING, PRODUCT_SINGLE_PDF_EXPORT
from app.services.supabase_payment_store import (
    create_payment,
    get_latest_open_checkout,
    get_succeeded_export_for_resume,
    list_payments_for_user,
)


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

    def in_(self, column, values):
        self._store[self._table_name].append((f"in:{column}", tuple(values)))
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


def _payment_row():
    pid = uuid4()
    uid = uuid4()
    rid = uuid4()
    return {
        "id": str(pid),
        "user_id": str(uid),
        "resume_id": str(rid),
        "stripe_payment_intent_id": "pi_123",
        "stripe_checkout_session_id": "cs_123",
        "amount": 1200,
        "currency": "usd",
        "status": PAYMENT_STATUS_PENDING,
        "product_type": PRODUCT_SINGLE_PDF_EXPORT,
        "created_at": "2026-04-11T00:00:00+00:00",
        "updated_at": "2026-04-11T00:00:00+00:00",
    }


def test_list_payments_for_user_returns_rows() -> None:
    row = _payment_row()
    fake = _FakeSupabaseClient({"payments": SimpleNamespace(data=[row], count=1)})

    with patch("app.services.supabase_payment_store.get_supabase_client", return_value=fake):
        rows = list_payments_for_user(uuid4(), offset=0, limit=50)

    assert len(rows) == 1
    assert rows[0].stripe_checkout_session_id == "cs_123"


def test_create_payment_inserts_then_fetches() -> None:
    row = _payment_row()
    fake = _FakeSupabaseClient({"payments": SimpleNamespace(data=[row], count=1)})

    with patch("app.services.supabase_payment_store.get_supabase_client", return_value=fake):
        payment = create_payment(
            {
                "id": row["id"],
                "user_id": row["user_id"],
                "resume_id": row["resume_id"],
                "amount": 1200,
                "currency": "usd",
                "status": PAYMENT_STATUS_PENDING,
                "product_type": PRODUCT_SINGLE_PDF_EXPORT,
            }
        )

    assert payment.id.hex
    assert any(call[0] == "insert" for call in fake.calls["payments"])


def test_lookup_helpers_filter_as_expected() -> None:
    row = _payment_row()
    fake = _FakeSupabaseClient({"payments": SimpleNamespace(data=[row], count=1)})

    with patch("app.services.supabase_payment_store.get_supabase_client", return_value=fake):
        succeeded = get_succeeded_export_for_resume(uuid4(), uuid4(), PRODUCT_SINGLE_PDF_EXPORT)
        pending = get_latest_open_checkout(uuid4(), uuid4(), PRODUCT_SINGLE_PDF_EXPORT, [PAYMENT_STATUS_PENDING])

    assert succeeded is not None
    assert pending is not None
    assert any(call[0].startswith("in:status") for call in fake.calls["payments"])
