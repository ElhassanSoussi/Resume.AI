from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from app.core.supabase import get_supabase_client


@dataclass(frozen=True)
class PaymentRecord:
    id: uuid.UUID
    user_id: uuid.UUID
    resume_id: uuid.UUID | None
    stripe_payment_intent_id: str | None
    stripe_checkout_session_id: str | None
    amount: int
    currency: str
    status: str
    product_type: str
    created_at: datetime
    updated_at: datetime


def _parse_uuid(value: str | None) -> uuid.UUID | None:
    return uuid.UUID(value) if value else None


def _parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _row_to_payment(row: dict[str, Any]) -> PaymentRecord:
    return PaymentRecord(
        id=uuid.UUID(row["id"]),
        user_id=uuid.UUID(row["user_id"]),
        resume_id=_parse_uuid(row.get("resume_id")),
        stripe_payment_intent_id=row.get("stripe_payment_intent_id"),
        stripe_checkout_session_id=row.get("stripe_checkout_session_id"),
        amount=int(row["amount"]),
        currency=str(row["currency"]),
        status=str(row["status"]),
        product_type=str(row["product_type"]),
        created_at=_parse_datetime(row["created_at"]),
        updated_at=_parse_datetime(row["updated_at"]),
    )


def get_payment_by_id(payment_id: uuid.UUID) -> PaymentRecord | None:
    response = (
        get_supabase_client()
        .table("payments")
        .select("*")
        .eq("id", str(payment_id))
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_payment(rows[0])


def list_payments_for_user(
    user_id: uuid.UUID,
    *,
    offset: int = 0,
    limit: int = 50,
) -> list[PaymentRecord]:
    response = (
        get_supabase_client()
        .table("payments")
        .select("*")
        .eq("user_id", str(user_id))
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return [_row_to_payment(row) for row in (response.data or [])]


def create_payment(data: dict[str, Any]) -> PaymentRecord:
    payment_id = data.get("id") or uuid.uuid4()
    payload = {**data, "id": str(payment_id)}
    get_supabase_client().table("payments").insert(payload).execute()
    payment = get_payment_by_id(uuid.UUID(str(payment_id)))
    if payment is None:
        raise RuntimeError("Supabase payment insert did not return a row.")
    return payment


def update_payment(payment_id: uuid.UUID, data: dict[str, Any]) -> PaymentRecord | None:
    get_supabase_client().table("payments").update(data).eq("id", str(payment_id)).execute()
    return get_payment_by_id(payment_id)


def get_payment_by_checkout_session_id(session_id: str) -> PaymentRecord | None:
    response = (
        get_supabase_client()
        .table("payments")
        .select("*")
        .eq("stripe_checkout_session_id", session_id)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_payment(rows[0])


def get_payment_by_stripe_intent(intent_id: str) -> PaymentRecord | None:
    response = (
        get_supabase_client()
        .table("payments")
        .select("*")
        .eq("stripe_payment_intent_id", intent_id)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_payment(rows[0])


def get_succeeded_export_for_resume(
    user_id: uuid.UUID,
    resume_id: uuid.UUID,
    product_type: str,
) -> PaymentRecord | None:
    response = (
        get_supabase_client()
        .table("payments")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("resume_id", str(resume_id))
        .eq("product_type", product_type)
        .eq("status", "succeeded")
        .order("updated_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_payment(rows[0])


def get_latest_open_checkout(
    user_id: uuid.UUID,
    resume_id: uuid.UUID,
    product_type: str,
    open_statuses: list[str],
) -> PaymentRecord | None:
    response = (
        get_supabase_client()
        .table("payments")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("resume_id", str(resume_id))
        .eq("product_type", product_type)
        .in_("status", open_statuses)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_payment(rows[0])
