"""Export authorization — only paid resumes may generate PDFs."""

from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import PRODUCT_SINGLE_PDF_EXPORT
from app.core.exceptions import AppException, NotFoundException
from app.repositories.payment import PaymentRepository
from app.repositories.resume import ResumeRepository
from app.services.supabase_payment_store import get_succeeded_export_for_resume as get_succeeded_export_for_resume_remote
from app.services.supabase_resume_reader import fetch_resume_detail


@dataclass(frozen=True)
class ExportAuthorization:
    """Result of evaluating whether a PDF export may proceed."""

    allowed: bool
    reason: str
    payment_id: uuid.UUID | None = None


class ExportService:
    """Guards export pipelines using payment entitlements."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._payments = PaymentRepository(session)
        self._resumes = ResumeRepository(session)

    async def is_resume_paid_for_export(self, user_id: uuid.UUID, resume_id: uuid.UUID) -> bool:
        if settings.supabase_configured:
            try:
                row = await asyncio.to_thread(
                    get_succeeded_export_for_resume_remote,
                    user_id,
                    resume_id,
                    PRODUCT_SINGLE_PDF_EXPORT,
                )
            except Exception:
                row = await self._payments.get_succeeded_export_for_resume(
                    user_id,
                    resume_id,
                    PRODUCT_SINGLE_PDF_EXPORT,
                )
        else:
            row = await self._payments.get_succeeded_export_for_resume(
                user_id,
                resume_id,
                PRODUCT_SINGLE_PDF_EXPORT,
            )
        return row is not None

    async def ensure_export_allowed(self, user_id: uuid.UUID, resume_id: uuid.UUID) -> None:
        """Raise if the user cannot export this resume (ownership or payment)."""
        auth = await self.prepare_export_authorization(user_id, resume_id)
        if not auth.allowed:
            raise AppException(status_code=403, detail=auth.reason)

    async def prepare_export_authorization(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
    ) -> ExportAuthorization:
        """Evaluate export eligibility; does not perform I/O beyond DB reads."""
        resume = None
        if settings.supabase_configured:
            try:
                resume = await asyncio.to_thread(fetch_resume_detail, user_id, resume_id)
            except Exception:
                resume = None
        if resume is None:
            resume = await self._resumes.get_by_id(resume_id)
        if resume is None:
            raise NotFoundException("Resume")
        if resume.user_id != user_id:
            return ExportAuthorization(
                allowed=False,
                reason="Not enough permissions.",
            )

        if settings.supabase_configured:
            try:
                paid = await asyncio.to_thread(
                    get_succeeded_export_for_resume_remote,
                    user_id,
                    resume_id,
                    PRODUCT_SINGLE_PDF_EXPORT,
                )
            except Exception:
                paid = await self._payments.get_succeeded_export_for_resume(
                    user_id,
                    resume_id,
                    PRODUCT_SINGLE_PDF_EXPORT,
                )
        else:
            paid = await self._payments.get_succeeded_export_for_resume(
                user_id,
                resume_id,
                PRODUCT_SINGLE_PDF_EXPORT,
            )
        if paid is None:
            return ExportAuthorization(
                allowed=False,
                reason="Payment required before exporting this resume.",
            )

        return ExportAuthorization(
            allowed=True,
            reason="ok",
            payment_id=paid.id,
        )

    async def stub_prepare_export_job(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> dict:
        """Placeholder for enqueueing PDF render / storage (next implementation step)."""
        await self.ensure_export_allowed(user_id, resume_id)
        return {
            "status": "authorized",
            "resume_id": str(resume_id),
            "message": "Export authorized — wire PDF pipeline in a follow-up task.",
        }
