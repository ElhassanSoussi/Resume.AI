"""Stripe checkout, webhooks, and payment status."""

from __future__ import annotations

import asyncio
import uuid
from typing import Annotated

from fastapi import APIRouter, Header, Query, Request

from app.core.config import settings
from app.core.deps import CurrentUserID, DBSession
from app.core.exceptions import AppException
from app.repositories.payment import PaymentRepository
from app.schemas.payment import (
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    PaymentRead,
    ResumePaymentStatusResponse,
    WebhookAckResponse,
)
from app.services.supabase_payment_store import list_payments_for_user
from app.services import stripe_service
from app.services.payment import PaymentService

router = APIRouter()


def _stripe_checkout_not_configured_detail(errors: list[str]) -> str:
    missing = ", ".join(errors)
    return f"Stripe checkout is not configured. Set real values for: {missing}."


@router.get("")
async def list_my_payments(
    user_id: CurrentUserID,
    session: DBSession,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[PaymentRead]:
    """Paginated payment history for the current user (Stripe checkout rows)."""
    uid = uuid.UUID(user_id)
    if settings.supabase_configured:
        try:
            rows = await asyncio.to_thread(
                list_payments_for_user,
                uid,
                offset=offset,
                limit=limit,
            )
        except Exception:
            rows = await PaymentRepository(session).get_by_user(
                uid,
                offset=offset,
                limit=limit,
            )
    else:
        rows = await PaymentRepository(session).get_by_user(
            uid,
            offset=offset,
            limit=limit,
        )
    return [PaymentRead.model_validate(r) for r in rows]


@router.post("/create-checkout-session")
async def create_checkout_session(
    payload: CreateCheckoutSessionRequest,
    user_id: CurrentUserID,
    session: DBSession,
) -> CreateCheckoutSessionResponse:
    """Create a Stripe Checkout Session and persist a pending Payment row."""
    errors = list(settings.stripe_checkout_config_errors)
    if payload.price_id is not None:
        errors = [name for name in errors if name != "STRIPE_PRICE_ID_SINGLE_EXPORT"]
    if errors:
        raise AppException(
            status_code=503,
            detail=_stripe_checkout_not_configured_detail(errors),
        )
    return await PaymentService(session).create_checkout_session(
        uuid.UUID(user_id),
        payload,
    )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    session: DBSession,
    stripe_signature: Annotated[str | None, Header(alias="stripe-signature")] = None,
) -> WebhookAckResponse:
    """Stripe webhook — signature-verified; updates Payment rows."""
    if settings.stripe_webhook_config_errors:
        missing = ", ".join(settings.stripe_webhook_config_errors)
        raise AppException(
            status_code=503,
            detail=f"Stripe webhook is not configured. Set real values for: {missing}.",
        )
    payload = await request.body()
    event = stripe_service.verify_webhook_event(payload, stripe_signature)
    await PaymentService(session).process_webhook_event(event)
    return WebhookAckResponse(received=True)


@router.get("/status/{resume_id}")
async def payment_status_for_resume(
    resume_id: uuid.UUID,
    user_id: CurrentUserID,
    session: DBSession,
) -> ResumePaymentStatusResponse:
    """Return whether this resume is paid and export-ready for the current user."""
    return await PaymentService(session).get_resume_payment_status(
        uuid.UUID(user_id),
        resume_id,
    )
