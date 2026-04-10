"""Stripe checkout, webhooks, and payment status."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Header, Query, Request

from app.core.deps import CurrentUserID, DBSession
from app.repositories.payment import PaymentRepository
from app.schemas.payment import (
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    PaymentRead,
    ResumePaymentStatusResponse,
    WebhookAckResponse,
)
from app.services import stripe_service
from app.services.payment import PaymentService

router = APIRouter()


@router.get("", response_model=list[PaymentRead])
async def list_my_payments(
    user_id: CurrentUserID,
    session: DBSession,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
) -> list[PaymentRead]:
    """Paginated payment history for the current user (Stripe checkout rows)."""
    rows = await PaymentRepository(session).get_by_user(
        uuid.UUID(user_id),
        offset=offset,
        limit=limit,
    )
    return [PaymentRead.model_validate(r) for r in rows]


@router.post("/create-checkout-session", response_model=CreateCheckoutSessionResponse)
async def create_checkout_session(
    payload: CreateCheckoutSessionRequest,
    user_id: CurrentUserID,
    session: DBSession,
) -> CreateCheckoutSessionResponse:
    """Create a Stripe Checkout Session and persist a pending Payment row."""
    return await PaymentService(session).create_checkout_session(
        uuid.UUID(user_id),
        payload,
    )


@router.post("/webhook", response_model=WebhookAckResponse)
async def stripe_webhook(
    request: Request,
    session: DBSession,
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
) -> WebhookAckResponse:
    """Stripe webhook — signature-verified; updates Payment rows."""
    payload = await request.body()
    event = stripe_service.verify_webhook_event(payload, stripe_signature)
    await PaymentService(session).process_webhook_event(event)
    return WebhookAckResponse(received=True)


@router.get("/status/{resume_id}", response_model=ResumePaymentStatusResponse)
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
