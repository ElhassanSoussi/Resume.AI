"""Payment orchestration: Stripe (via stripe_service) + database state."""

from __future__ import annotations

import asyncio
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    PAYMENT_STATUS_CANCELED,
    PAYMENT_STATUS_FAILED,
    PAYMENT_STATUS_PENDING,
    PAYMENT_STATUS_PROCESSING,
    PAYMENT_STATUS_SUCCEEDED,
    PRODUCT_SINGLE_PDF_EXPORT,
)
from app.core.exceptions import AppException, BadRequestException, NotFoundException
from app.core.logging import get_logger
from app.core.config import settings
from app.models.payment import Payment
from app.repositories.payment import PaymentRepository
from app.repositories.resume import ResumeRepository
from app.schemas.payment import (
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    ResumePaymentStatusResponse,
)
from app.services.supabase_resume_reader import fetch_resume_detail
from app.services.supabase_payment_store import (
    PaymentRecord,
    create_payment as create_payment_remote,
    get_latest_open_checkout as get_latest_open_checkout_remote,
    get_payment_by_checkout_session_id as get_payment_by_checkout_session_id_remote,
    get_payment_by_stripe_intent as get_payment_by_stripe_intent_remote,
    get_succeeded_export_for_resume as get_succeeded_export_for_resume_remote,
    update_payment as update_payment_remote,
)
from app.services.supabase_billing_mirror import sync_payment
from app.services import stripe_service

logger = get_logger(__name__)


def _stripe_object_as_dict(obj: Any) -> dict[str, Any]:
    if obj is None:
        return {}
    if isinstance(obj, dict):
        return obj
    to_dict = getattr(obj, "to_dict", None)
    if callable(to_dict):
        return to_dict()
    return {}


class PaymentService:
    """Checkout creation, webhook handling, and payment status for exports."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._payments = PaymentRepository(session)
        self._resumes = ResumeRepository(session)

    async def _mirror_payment_best_effort(self, payment: Payment) -> None:
        try:
            await asyncio.to_thread(sync_payment, payment)
        except Exception as exc:
            logger.warning(
                "payment.supabase_mirror_failed",
                payment_id=str(payment.id),
                error=str(exc),
            )

    async def _create_payment_record(self, data: dict[str, Any]) -> Payment | PaymentRecord:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(create_payment_remote, data)
            except Exception as exc:
                logger.warning("payment.remote_create_failed", error=str(exc))
        payment = await self._payments.create(data)
        await self._mirror_payment_best_effort(payment)
        return payment

    async def _update_payment_record(
        self, payment_id: uuid.UUID, data: dict[str, Any]
    ) -> Payment | PaymentRecord | None:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(update_payment_remote, payment_id, data)
            except Exception as exc:
                logger.warning("payment.remote_update_failed", error=str(exc))
        updated = await self._payments.update(payment_id, data)
        if updated is not None:
            await self._mirror_payment_best_effort(updated)
        return updated

    async def _get_succeeded_export_payment(
        self, user_id: uuid.UUID, resume_id: uuid.UUID
    ) -> Payment | PaymentRecord | None:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(
                    get_succeeded_export_for_resume_remote,
                    user_id,
                    resume_id,
                    PRODUCT_SINGLE_PDF_EXPORT,
                )
            except Exception as exc:
                logger.warning("payment.remote_succeeded_lookup_failed", error=str(exc))
        return await self._payments.get_succeeded_export_for_resume(
            user_id,
            resume_id,
            PRODUCT_SINGLE_PDF_EXPORT,
        )

    async def create_checkout_session(
        self,
        user_id: uuid.UUID,
        payload: CreateCheckoutSessionRequest,
    ) -> CreateCheckoutSessionResponse:
        resume = None
        if settings.supabase_configured:
            try:
                resume = await asyncio.to_thread(fetch_resume_detail, user_id, payload.resume_id)
            except Exception as exc:
                logger.warning("payment.resume_remote_lookup_failed", error=str(exc))
        if resume is None:
            resume = await self._resumes.get_by_id(payload.resume_id)
        if resume is None:
            raise NotFoundException("Resume")
        if resume.user_id != user_id:
            raise AppException(status_code=403, detail="Not enough permissions.")

        price_id = payload.price_id or self._resolve_price_id(payload.product_type)
        if not price_id:
            raise BadRequestException(detail="No Stripe price configured for this product.")

        amount_cents = await asyncio.to_thread(
            stripe_service.retrieve_price_unit_amount_cents,
            price_id,
        )

        checkout = await asyncio.to_thread(
            stripe_service.create_checkout_session,
            price_id=price_id,
            success_url=str(payload.success_url),
            cancel_url=str(payload.cancel_url),
            user_id=str(user_id),
            resume_id=str(payload.resume_id),
            product_type=payload.product_type,
            customer_email=payload.customer_email,
        )

        payment = await self._create_payment_record(
            {
                "user_id": user_id,
                "resume_id": payload.resume_id,
                "stripe_checkout_session_id": checkout.session_id,
                "stripe_payment_intent_id": checkout.payment_intent_id,
                "amount": amount_cents,
                "currency": checkout.currency,
                "status": PAYMENT_STATUS_PENDING,
                "product_type": payload.product_type,
            }
        )

        if not checkout.url:
            raise AppException(
                status_code=503,
                detail="Stripe did not return a checkout URL.",
            )

        return CreateCheckoutSessionResponse(
            checkout_url=checkout.url,
            session_id=checkout.session_id,
            payment_id=payment.id,
        )

    def _resolve_price_id(self, product_type: str) -> str | None:
        if product_type == PRODUCT_SINGLE_PDF_EXPORT:
            from app.core.config import settings

            return settings.STRIPE_PRICE_ID_SINGLE_EXPORT.strip() or None
        return None

    async def get_resume_payment_status(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
    ) -> ResumePaymentStatusResponse:
        resume = None
        if settings.supabase_configured:
            try:
                resume = await asyncio.to_thread(fetch_resume_detail, user_id, resume_id)
            except Exception as exc:
                logger.warning("payment.resume_remote_status_lookup_failed", error=str(exc))
        if resume is None:
            resume = await self._resumes.get_by_id(resume_id)
        if resume is None:
            raise NotFoundException("Resume")
        if resume.user_id != user_id:
            raise AppException(status_code=403, detail="Not enough permissions.")

        pending = await self._latest_open_checkout(user_id, resume_id)
        if pending and pending.stripe_checkout_session_id:
            await self._maybe_sync_from_stripe(pending)

        succeeded = await self._get_succeeded_export_payment(user_id, resume_id)
        pending = await self._latest_open_checkout(user_id, resume_id)

        export_ready = succeeded is not None
        active = succeeded or pending
        if succeeded:
            status = succeeded.status
        elif pending:
            status = pending.status
        else:
            status = PAYMENT_STATUS_PENDING

        return ResumePaymentStatusResponse(
            resume_id=resume_id,
            paid=export_ready,
            export_ready=export_ready,
            status=status,
            payment_id=active.id if active else None,
            product_type=active.product_type if active else None,
        )

    async def _latest_open_checkout(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
    ) -> Payment | None:
        if settings.supabase_configured:
            try:
                return await asyncio.to_thread(
                    get_latest_open_checkout_remote,
                    user_id,
                    resume_id,
                    PRODUCT_SINGLE_PDF_EXPORT,
                    [PAYMENT_STATUS_PENDING, PAYMENT_STATUS_PROCESSING],
                )
            except Exception as exc:
                logger.warning("payment.remote_pending_lookup_failed", error=str(exc))
        stmt = (
            select(Payment)
            .where(
                Payment.user_id == user_id,
                Payment.resume_id == resume_id,
                Payment.product_type == PRODUCT_SINGLE_PDF_EXPORT,
                Payment.status.in_(
                    [
                        PAYMENT_STATUS_PENDING,
                        PAYMENT_STATUS_PROCESSING,
                    ],
                ),
            )
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def _maybe_sync_from_stripe(self, payment: Payment) -> None:
        if not payment.stripe_checkout_session_id:
            return
        try:
            remote = await asyncio.to_thread(
                stripe_service.retrieve_checkout_session,
                payment.stripe_checkout_session_id,
            )
        except Exception as exc:
            logger.warning("payment.stripe_sync_failed", error=str(exc))
            return

        ps = remote.get("payment_status")
        if ps == "paid" and payment.status != PAYMENT_STATUS_SUCCEEDED:
            await self._apply_session_paid(payment.id, remote)

    async def _apply_session_paid(self, payment_id: uuid.UUID, session: dict[str, Any]) -> None:
        amt = session.get("amount_total")
        cur = session.get("currency") or "usd"
        pi = session.get("payment_intent")
        if isinstance(pi, dict):
            pi = pi.get("id")
        payment = await self._payments.update(
            payment_id,
            {
                "status": PAYMENT_STATUS_SUCCEEDED,
                "amount": int(amt) if amt is not None else 0,
                "currency": str(cur),
                "stripe_payment_intent_id": str(pi) if pi else None,
            },
        )
        if payment is not None:
            await self._mirror_payment_best_effort(payment)

    async def process_webhook_event(self, event: dict[str, Any]) -> None:
        etype = event.get("type")
        raw_obj = (event.get("data") or {}).get("object")
        data = _stripe_object_as_dict(raw_obj)

        if etype == "checkout.session.completed":
            await self._on_checkout_session_completed(data)
        elif etype == "checkout.session.expired":
            await self._on_checkout_session_expired(data)
        elif etype == "payment_intent.payment_failed":
            await self._on_payment_intent_failed(data)
        else:
            logger.info("payment.webhook_ignored", type=etype)

    async def _on_checkout_session_completed(self, session: dict[str, Any]) -> None:
        sid = session.get("id")
        if not sid:
            return
        if settings.supabase_configured:
            try:
                payment = await asyncio.to_thread(get_payment_by_checkout_session_id_remote, sid)
            except Exception as exc:
                logger.warning("payment.remote_checkout_lookup_failed", error=str(exc))
                payment = await self._payments.get_by_checkout_session_id(sid)
        else:
            payment = await self._payments.get_by_checkout_session_id(sid)
        if payment is None:
            logger.warning("payment.webhook_unknown_session", session_id=sid)
            return
        if payment.status == PAYMENT_STATUS_SUCCEEDED:
            return

        ps = session.get("payment_status")
        if ps not in ("paid", "no_payment_required"):
            payment = await self._update_payment_record(
                payment.id,
                {"status": PAYMENT_STATUS_PROCESSING},
            )
            return

        amt = session.get("amount_total")
        cur = session.get("currency") or "usd"
        pi = session.get("payment_intent")
        if isinstance(pi, dict):
            pi = pi.get("id")

        await self._update_payment_record(
            payment.id,
            {
                "status": PAYMENT_STATUS_SUCCEEDED,
                "amount": int(amt) if amt is not None else payment.amount,
                "currency": str(cur),
                "stripe_payment_intent_id": str(pi) if pi else payment.stripe_payment_intent_id,
            },
        )

    async def _on_checkout_session_expired(self, session: dict[str, Any]) -> None:
        sid = session.get("id")
        if not sid:
            return
        if settings.supabase_configured:
            try:
                payment = await asyncio.to_thread(get_payment_by_checkout_session_id_remote, sid)
            except Exception as exc:
                logger.warning("payment.remote_checkout_expired_lookup_failed", error=str(exc))
                payment = await self._payments.get_by_checkout_session_id(sid)
        else:
            payment = await self._payments.get_by_checkout_session_id(sid)
        if payment and payment.status == PAYMENT_STATUS_PENDING:
            await self._update_payment_record(payment.id, {"status": PAYMENT_STATUS_CANCELED})

    async def _on_payment_intent_failed(self, intent: dict[str, Any]) -> None:
        iid = intent.get("id")
        if not iid:
            return
        if settings.supabase_configured:
            try:
                payment = await asyncio.to_thread(get_payment_by_stripe_intent_remote, str(iid))
            except Exception as exc:
                logger.warning("payment.remote_intent_lookup_failed", error=str(exc))
                payment = await self._payments.get_by_stripe_intent(str(iid))
        else:
            payment = await self._payments.get_by_stripe_intent(str(iid))
        if payment:
            await self._update_payment_record(payment.id, {"status": PAYMENT_STATUS_FAILED})
