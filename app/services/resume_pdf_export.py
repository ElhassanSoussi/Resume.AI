"""Orchestrate HTML template render → PDF bytes → storage + ``ResumeExport`` rows."""

from __future__ import annotations

import re
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, NotFoundException
from app.export.constants import TEMPLATE_MODERN_SIDEBAR, resolve_template_key
from app.export.renderers import TEMPLATES_DIR, render_resume_html
from app.export.resume_context import resume_to_template_context
from app.models.resume_export import ResumeExport
from app.repositories.resume import ResumeRepository
from app.repositories.resume_export import ResumeExportRepository
from app.services.export_service import ExportService
from app.services.pdf_service import html_to_pdf
from app.storage.local import LocalFilesystemStorage, ensure_export_root_exists


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
        self._storage = LocalFilesystemStorage()

    async def generate_pdf(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
        *,
        template_key: str | None = None,
    ) -> ResumeExport:
        await self._guard.ensure_export_allowed(user_id, resume_id)
        ensure_export_root_exists()

        resume = await self._resumes.get_by_user_eager(user_id, resume_id)
        if resume is None:
            raise NotFoundException("Resume")

        resolved = resolve_template_key(
            template_key or resume.template_key,
            fallback=TEMPLATE_MODERN_SIDEBAR,
        )

        ctx = resume_to_template_context(resume)
        ctx["pdf_template_key"] = resolved

        export = ResumeExport(
            resume_id=resume_id,
            user_id=user_id,
            format="pdf",
            template_key=resolved,
            status="processing",
            file_url=None,
            file_size_bytes=None,
        )
        self._session.add(export)
        await self._session.flush()

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
            export.file_url = stored.key
            export.file_size_bytes = stored.size_bytes
            export.status = "completed"
        except Exception as exc:
            export.status = "failed"
            await self._session.commit()
            raise AppException(
                status_code=500,
                detail="PDF generation failed. Verify WeasyPrint system dependencies.",
            ) from exc

        await self._session.commit()
        await self._session.refresh(export)
        return export

    async def get_latest_export(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
    ) -> ResumeExport:
        await self._guard.ensure_export_allowed(user_id, resume_id)
        row = await self._exports.get_latest_for_resume_and_user(resume_id, user_id)
        if row is None:
            raise NotFoundException("Resume export")
        return row


def public_download_url_for_key(storage_key: str | None) -> str | None:
    if not storage_key:
        return None
    backend = LocalFilesystemStorage()
    return backend.public_url(storage_key)


def suggested_pdf_filename(resume_title: str, export_id: uuid.UUID) -> str:
    base = _safe_filename_fragment(resume_title)
    return f"{base}-{str(export_id)[:8]}.pdf"
