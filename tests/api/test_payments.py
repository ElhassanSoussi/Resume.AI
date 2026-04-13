"""Payment routes — no live Stripe calls."""

from __future__ import annotations

from unittest.mock import AsyncMock, PropertyMock, patch
from uuid import uuid4

import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.core.exceptions import BadRequestException
from app.schemas.payment import CreateCheckoutSessionResponse, ResumePaymentStatusResponse

API = "/api/v1/payments"


@pytest.mark.asyncio
async def test_webhook_missing_signature_returns_400(client: AsyncClient) -> None:
    with (
        patch.object(type(settings), "stripe_webhook_config_errors", PropertyMock(return_value=[])),
        patch(
            "app.api.v1.routers.payments.stripe_service.verify_webhook_event",
            side_effect=BadRequestException(detail="Missing Stripe-Signature header."),
        ),
    ):
        response = await client.post(API + "/webhook", content=b"{}")
    assert response.status_code == 400
    detail = response.json()["detail"].lower()
    assert "signature" in detail or "webhook" in detail or "configured" in detail


@pytest.mark.asyncio
async def test_create_checkout_session_delegates_to_service(client: AsyncClient) -> None:
    rid = uuid4()
    pid = uuid4()
    mock_resp = AsyncMock(
        return_value=CreateCheckoutSessionResponse(
            checkout_url="https://stripe.test/checkout",
            session_id="cs_test_123",
            payment_id=pid,
        )
    )
    with (
        patch.object(type(settings), "stripe_checkout_config_errors", PropertyMock(return_value=[])),
        patch("app.api.v1.routers.payments.PaymentService") as MockSvc,
    ):
        MockSvc.return_value.create_checkout_session = mock_resp
        response = await client.post(
            API + "/create-checkout-session",
            json={
                "resume_id": str(rid),
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["checkout_url"] == "https://stripe.test/checkout"
    assert data["session_id"] == "cs_test_123"
    assert data["payment_id"] == str(pid)


@pytest.mark.asyncio
async def test_payment_status_delegates_to_service(client: AsyncClient) -> None:
    rid = uuid4()
    pay = uuid4()
    mock_status = AsyncMock(
        return_value=ResumePaymentStatusResponse(
            resume_id=rid,
            paid=True,
            export_ready=True,
            status="succeeded",
            payment_id=pay,
            product_type="single_pdf_export",
        )
    )
    with patch(
        "app.api.v1.routers.payments.PaymentService"
    ) as MockSvc:
        MockSvc.return_value.get_resume_payment_status = mock_status
        response = await client.get(f"{API}/status/{rid}")
    assert response.status_code == 200
    body = response.json()
    assert body["paid"] is True
    assert body["export_ready"] is True
