"""PDF export endpoints — HTML templates → WeasyPrint → local storage (swappable)."""

from __future__ import annotations

import asyncio
import uuid
from typing import Annotated

from fastapi import APIRouter, Body, Query

from app.core.config import settings
from app.core.deps import CurrentUserID, DBSession
from app.repositories.resume import ResumeRepository
from app.repositories.resume_export import ResumeExportRepository
from app.schemas.resume_export import (
    ExportHistoryItem,
    GeneratePdfRequest,
    PdfExportMetadataResponse,
)
from app.services.resume_pdf_export import (
    ResumePdfExportService,
    public_download_url_for_key,
    suggested_pdf_filename,
)
from app.services.supabase_export_store import list_exports_for_user
from app.services.supabase_resume_reader import fetch_resume_detail

router = APIRouter()


@router.get("/history")
async def list_export_history(
    user_id: CurrentUserID,
    session: DBSession,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[ExportHistoryItem]:
    """Paginated PDF export history for the current user."""
    uid = uuid.UUID(user_id)
    if settings.supabase_configured:
        try:
            exports = await asyncio.to_thread(list_exports_for_user, uid, offset=offset, limit=limit)
            title_cache: dict[uuid.UUID, str] = {}
            out: list[ExportHistoryItem] = []
            for exp in exports:
                if exp.resume_id not in title_cache:
                    resume = await asyncio.to_thread(fetch_resume_detail, uid, exp.resume_id)
                    title_cache[exp.resume_id] = resume.title if resume else "Resume"
                resume_title = title_cache[exp.resume_id]
                key = exp.file_url
                out.append(
                    ExportHistoryItem(
                        id=exp.id,
                        resume_id=exp.resume_id,
                        resume_title=resume_title,
                        format=exp.format,
                        template_key=exp.template_key,
                        status=exp.status,
                        file_size_bytes=exp.file_size_bytes,
                        suggested_filename=suggested_pdf_filename(resume_title, exp.id),
                        public_download_url=public_download_url_for_key(key),
                        created_at=exp.created_at,
                    )
                )
            return out
        except Exception:
            rows = await ResumeExportRepository(session).list_with_resume_title_for_user(
                uid,
                offset=offset,
                limit=limit,
            )
    else:
        rows = await ResumeExportRepository(session).list_with_resume_title_for_user(
            uid,
            offset=offset,
            limit=limit,
        )
    out: list[ExportHistoryItem] = []
    for row in rows:
        exp, resume_title = row[0], row[1]
        key = exp.file_url
        out.append(
            ExportHistoryItem(
                id=exp.id,
                resume_id=exp.resume_id,
                resume_title=resume_title,
                format=exp.format,
                template_key=exp.template_key,
                status=exp.status,
                file_size_bytes=exp.file_size_bytes,
                suggested_filename=suggested_pdf_filename(resume_title, exp.id),
                public_download_url=public_download_url_for_key(key),
                created_at=exp.created_at,
            )
        )
    return out


def _to_metadata(
    export,
    *,
    resume_title: str,
) -> PdfExportMetadataResponse:
    key = export.file_url
    return PdfExportMetadataResponse(
        id=export.id,
        resume_id=export.resume_id,
        user_id=export.user_id,
        format=export.format,
        template_key=export.template_key,
        status=export.status,
        storage_key=key,
        file_size_bytes=export.file_size_bytes,
        mime_type="application/pdf",
        public_download_url=public_download_url_for_key(key),
        suggested_filename=suggested_pdf_filename(resume_title, export.id),
        created_at=export.created_at,
        updated_at=export.updated_at,
    )


@router.post("/{resume_id}/generate-pdf", status_code=201)
async def generate_resume_pdf(
    resume_id: uuid.UUID,
    session: DBSession,
    user_id: CurrentUserID,
    body: Annotated[GeneratePdfRequest | None, Body()] = None,
) -> PdfExportMetadataResponse:
    """Render resume HTML with the selected template and persist a PDF (paid resumes only)."""
    uid = uuid.UUID(user_id)
    svc = ResumePdfExportService(session)
    tpl = body.template_key if body else None
    export = await svc.generate_pdf(uid, resume_id, template_key=tpl)
    if settings.supabase_configured:
        try:
            resume = await asyncio.to_thread(fetch_resume_detail, uid, resume_id)
        except Exception:
            resume = await ResumeRepository(session).get_by_id(resume_id)
    else:
        resume = await ResumeRepository(session).get_by_id(resume_id)
    title = resume.title if resume else "Resume"
    return _to_metadata(export, resume_title=title)


@router.get("/{resume_id}")
async def get_resume_export_metadata(
    resume_id: uuid.UUID,
    session: DBSession,
    user_id: CurrentUserID,
) -> PdfExportMetadataResponse:
    """Return metadata for the latest PDF export for this resume (paid entitlement required)."""
    uid = uuid.UUID(user_id)
    svc = ResumePdfExportService(session)
    export = await svc.get_latest_export(uid, resume_id)
    if settings.supabase_configured:
        try:
            resume = await asyncio.to_thread(fetch_resume_detail, uid, resume_id)
        except Exception:
            resume = await ResumeRepository(session).get_by_id(resume_id)
    else:
        resume = await ResumeRepository(session).get_by_id(resume_id)
    title = resume.title if resume else "Resume"
    return _to_metadata(export, resume_title=title)
