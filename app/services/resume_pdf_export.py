"""Orchestrate HTML template render → PDF bytes → storage + ``ResumeExport`` rows."""

from __future__ import annotations

import asyncio
import re
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, NotFoundException
from app.core.config import settings
from app.core.logging import get_logger
from app.export.constants import (
    EXPORT_MODE_DESIGNED,
    TEMPLATE_MODERN_PROFESSIONAL,
    resolve_export_mode,
    resolve_export_template_key,
)
from app.export.renderers import TEMPLATES_DIR, render_resume_html
from app.export.resume_context import resume_to_template_context
from app.models.resume_export import ResumeExport
from app.repositories.resume import ResumeRepository
from app.repositories.resume_export import ResumeExportRepository
from app.services.export_service import ExportService
from app.services.pdf_service import html_to_pdf
from app.services.supabase_export_store import (
    ResumeExportRecord,
    create_export,
    get_latest_export_for_resume_and_user,
    update_export,
)
from app.services.supabase_resume_reader import fetch_resume_detail
from app.services.supabase_billing_mirror import sync_resume_export
from app.storage import get_storage_backend

logger = get_logger(__name__)


def _safe_filename_fragment(text: str, *, max_len: int = 80) -> str:
    cleaned = re.sub(r"[^\w\s\-]", "", text, flags=re.UNICODE).strip()
    cleaned = re.sub(r"\s+", "-", cleaned) or "resume"
    return cleaned[:max_len]


class ResumePdfExportService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._exports = ResumeExportRepository(session)
        self._resumes = ResumeRepository(session)
        self._guard = ExportService(session)
        self._storage = get_storage_backend()

    async def _mirror_export_best_effort(self, export: ResumeExport) -> None:
        try:
            await asyncio.to_thread(sync_resume_export, export)
        except Exception as exc:
            logger.warning(
                "resume_export.supabase_mirror_failed",
                export_id=str(export.id),
                error=str(exc),
            )

    async def _create_export_record(self, data: dict) -> ResumeExport | ResumeExportRecord:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(create_export, data)
            except Exception as exc:
                logger.warning("resume_export.remote_create_failed", error=str(exc))

        export = ResumeExport(**data)
        self._session.add(export)
        await self._session.flush()
        return export

    async def _update_export_record(
        self,
        export_id: uuid.UUID,
        data: dict,
    ) -> ResumeExport | ResumeExportRecord | None:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(update_export, export_id, data)
            except Exception as exc:
                logger.warning("resume_export.remote_update_failed", error=str(exc))

        export = await self._exports.update(export_id, data)
        if export is not None:
            await self._mirror_export_best_effort(export)
        return export

    async def generate_pdf(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
        *,
        template_key: str | None = None,
        export_mode: str | None = None,
    ) -> ResumeExport:
        await self._guard.ensure_export_allowed(user_id, resume_id)

        resume = None
        if settings.supabase_configured:
            try:
                resume = await asyncio.to_thread(fetch_resume_detail, user_id, resume_id)
            except Exception as exc:
                logger.warning("resume_export.remote_resume_lookup_failed", error=str(exc))
        if resume is None:
            resume = await self._resumes.get_by_user_eager(user_id, resume_id)
        if resume is None:
            raise NotFoundException("Resume")

        resolved_export_mode = resolve_export_mode(
            export_mode,
            fallback=EXPORT_MODE_DESIGNED,
        )
        resolved = resolve_export_template_key(
            template_key or resume.template_key,
            export_mode=resolved_export_mode,
            fallback=TEMPLATE_MODERN_PROFESSIONAL,
        )

        ctx = resume_to_template_context(resume)
        ctx["pdf_template_key"] = resolved
        ctx["export_mode"] = resolved_export_mode

        timestamp = datetime.now(UTC).isoformat()
        export = await self._create_export_record(
            {
                "resume_id": resume_id,
                "user_id": user_id,
                "format": "pdf",
                "template_key": resolved,
                "status": "processing",
                "file_url": None,
                "file_size_bytes": None,
                "created_at": timestamp,
                "updated_at": timestamp,
            }
        )

        html = render_resume_html(resolved, ctx)
        key = (
            f"users/{user_id}/resumes/{resume_id}/{export.id}.pdf"
        )

        try:
            pdf_bytes = await html_to_pdf(html, base_url=str(TEMPLATES_DIR))
            stored = await self._storage.write_bytes(
                key=key,
                data=pdf_bytes,
                content_type="application/pdf",
            )
            updated = await self._update_export_record(
                export.id,
                {
                    "file_url": stored.key,
                    "file_size_bytes": stored.size_bytes,
                    "status": "completed",
                    "updated_at": datetime.now(UTC).isoformat(),
                },
            )
            if updated is not None:
                export = updated
        except Exception as exc:
            failed = await self._update_export_record(
                export.id,
                {
                    "status": "failed",
                    "updated_at": datetime.now(UTC).isoformat(),
                },
            )
            if failed is not None:
                export = failed
            elif isinstance(export, ResumeExport):
                await self._session.commit()
                await self._mirror_export_best_effort(export)
            raise AppException(
                status_code=500,
                detail="PDF generation failed. Verify WeasyPrint system dependencies.",
            ) from exc

        if isinstance(export, ResumeExport):
            await self._session.commit()
            await self._session.refresh(export)
            await self._mirror_export_best_effort(export)
        return export

    async def get_latest_export(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
    ) -> ResumeExport:
        await self._guard.ensure_export_allowed(user_id, resume_id)
        row = None
        if settings.supabase_configured:
            try:
                row = await asyncio.to_thread(get_latest_export_for_resume_and_user, resume_id, user_id)
            except Exception as exc:
                logger.warning("resume_export.remote_latest_lookup_failed", error=str(exc))
        if row is None:
            row = await self._exports.get_latest_for_resume_and_user(resume_id, user_id)
        if row is None:
            raise NotFoundException("Resume export")
        return row


def public_download_url_for_key(storage_key: str | None) -> str | None:
    if not storage_key:
        return None
    backend = get_storage_backend()
    return backend.public_url(storage_key)


def suggested_pdf_filename(resume_title: str, export_id: uuid.UUID) -> str:
    base = _safe_filename_fragment(resume_title)
    return f"{base}-{str(export_id)[:8]}.pdf"
