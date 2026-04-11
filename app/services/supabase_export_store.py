from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from app.core.supabase import get_supabase_client


@dataclass(frozen=True)
class ResumeExportRecord:
    id: uuid.UUID
    resume_id: uuid.UUID
    user_id: uuid.UUID
    format: str
    file_url: str | None
    file_size_bytes: int | None
    status: str
    template_key: str
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True)
class ExportHistoryRecord:
    export: ResumeExportRecord
    resume_title: str


def _parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _row_to_export(row: dict[str, Any]) -> ResumeExportRecord:
    return ResumeExportRecord(
        id=uuid.UUID(row["id"]),
        resume_id=uuid.UUID(row["resume_id"]),
        user_id=uuid.UUID(row["user_id"]),
        format=str(row["format"]),
        file_url=row.get("file_url"),
        file_size_bytes=row.get("file_size_bytes"),
        status=str(row["status"]),
        template_key=str(row["template_key"]),
        created_at=_parse_datetime(row["created_at"]),
        updated_at=_parse_datetime(row["updated_at"]),
    )


def get_export_by_id(export_id: uuid.UUID) -> ResumeExportRecord | None:
    response = (
        get_supabase_client()
        .table("resume_exports")
        .select("*")
        .eq("id", str(export_id))
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_export(rows[0])


def create_export(data: dict[str, Any]) -> ResumeExportRecord:
    export_id = data.get("id") or uuid.uuid4()
    payload = {**data, "id": str(export_id)}
    get_supabase_client().table("resume_exports").insert(payload).execute()
    export = get_export_by_id(uuid.UUID(str(export_id)))
    if export is None:
        raise RuntimeError("Supabase export insert did not return a row.")
    return export


def update_export(export_id: uuid.UUID, data: dict[str, Any]) -> ResumeExportRecord | None:
    get_supabase_client().table("resume_exports").update(data).eq("id", str(export_id)).execute()
    return get_export_by_id(export_id)


def get_latest_export_for_resume_and_user(
    resume_id: uuid.UUID,
    user_id: uuid.UUID,
) -> ResumeExportRecord | None:
    response = (
        get_supabase_client()
        .table("resume_exports")
        .select("*")
        .eq("resume_id", str(resume_id))
        .eq("user_id", str(user_id))
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    return _row_to_export(rows[0])


def list_exports_for_user(
    user_id: uuid.UUID,
    *,
    offset: int = 0,
    limit: int = 50,
) -> list[ResumeExportRecord]:
    response = (
        get_supabase_client()
        .table("resume_exports")
        .select("*")
        .eq("user_id", str(user_id))
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return [_row_to_export(row) for row in (response.data or [])]
