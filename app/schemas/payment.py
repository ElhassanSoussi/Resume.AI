"""Payment and checkout API schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, HttpUrl

from app.core.constants import PRODUCT_SINGLE_PDF_EXPORT


class CreateCheckoutSessionRequest(BaseModel):
    resume_id: uuid.UUID
    success_url: HttpUrl
    cancel_url: HttpUrl
    product_type: str = Field(default=PRODUCT_SINGLE_PDF_EXPORT, max_length=100)
    """Use `single_pdf_export` for one-time PDF export."""

    price_id: str | None = Field(
        default=None,
        max_length=255,
        description="Optional override; defaults from server config by product_type.",
    )
    customer_email: EmailStr | None = None


class CreateCheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str
    payment_id: uuid.UUID


class ResumePaymentStatusResponse(BaseModel):
    resume_id: uuid.UUID
    paid: bool
    export_ready: bool
    status: str
    payment_id: uuid.UUID | None = None
    product_type: str | None = None


class WebhookAckResponse(BaseModel):
    received: bool = True


class PaymentRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    resume_id: uuid.UUID | None = None
    stripe_payment_intent_id: str | None = None
    stripe_checkout_session_id: str | None = None
    amount: int
    currency: str
    status: str
    product_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
