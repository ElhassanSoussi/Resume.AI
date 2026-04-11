from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from app.core.supabase import get_supabase_client
from app.models.payment import Payment
from app.models.resume_export import ResumeExport


def _serialize_uuid(value: uuid.UUID | None) -> str | None:
    return str(value) if value is not None else None


def _serialize_datetime(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def _payment_payload(payment: Payment) -> dict[str, Any]:
    return {
        "id": _serialize_uuid(payment.id),
        "user_id": _serialize_uuid(payment.user_id),
        "resume_id": _serialize_uuid(payment.resume_id),
        "stripe_payment_intent_id": payment.stripe_payment_intent_id,
        "stripe_checkout_session_id": payment.stripe_checkout_session_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
        "product_type": payment.product_type,
        "created_at": _serialize_datetime(payment.created_at),
        "updated_at": _serialize_datetime(payment.updated_at),
    }


def _export_payload(export: ResumeExport) -> dict[str, Any]:
    return {
        "id": _serialize_uuid(export.id),
        "resume_id": _serialize_uuid(export.resume_id),
        "user_id": _serialize_uuid(export.user_id),
        "format": export.format,
        "file_url": export.file_url,
        "file_size_bytes": export.file_size_bytes,
        "status": export.status,
        "template_key": export.template_key,
        "created_at": _serialize_datetime(export.created_at),
        "updated_at": _serialize_datetime(export.updated_at),
    }


def sync_payment(payment: Payment) -> None:
    get_supabase_client().table("payments").upsert(
        _payment_payload(payment),
        on_conflict="id",
    ).execute()


def sync_resume_export(export: ResumeExport) -> None:
    get_supabase_client().table("resume_exports").upsert(
        _export_payload(export),
        on_conflict="id",
    ).execute()
