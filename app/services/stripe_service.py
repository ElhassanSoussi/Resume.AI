"""Low-level Stripe API calls — keep all SDK usage here."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, NoReturn

from app.core.config import settings
from app.core.exceptions import AppException, BadRequestException
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass(frozen=True)
class CheckoutSessionResult:
    session_id: str
    url: str | None
    payment_intent_id: str | None
    currency: str
    amount_total: int | None


def _configure_stripe() -> None:
    import stripe

    if not settings.stripe_secret_key_configured:
        raise AppException(
            status_code=503,
            detail="Stripe checkout is not configured. Set a real STRIPE_SECRET_KEY.",
        )
    stripe.api_key = settings.STRIPE_SECRET_KEY


def _handle_stripe_error(exc: Exception, *, operation: str) -> NoReturn:
    import stripe

    logger.warning(
        "stripe.request_failed",
        operation=operation,
        error_type=type(exc).__name__,
        error=str(exc),
    )

    if isinstance(exc, stripe.error.AuthenticationError):
        raise AppException(
            status_code=503,
            detail="Stripe rejected the API key. Set a real STRIPE_SECRET_KEY.",
        ) from exc
    if isinstance(exc, stripe.error.PermissionError):
        raise AppException(
            status_code=503,
            detail="Stripe denied the request. Verify the account's API permissions.",
        ) from exc
    if isinstance(exc, stripe.error.InvalidRequestError):
        raise BadRequestException(
            detail="Stripe rejected the request. Verify the configured price ID and checkout parameters.",
        ) from exc
    if isinstance(exc, stripe.error.RateLimitError):
        raise AppException(
            status_code=503,
            detail="Stripe is temporarily rate limiting requests. Please try again shortly.",
        ) from exc
    if isinstance(exc, stripe.error.APIConnectionError):
        raise AppException(
            status_code=503,
            detail="Could not reach Stripe. Please try again.",
        ) from exc
    if isinstance(exc, stripe.error.StripeError):
        raise AppException(
            status_code=503,
            detail="Stripe is temporarily unavailable. Please try again.",
        ) from exc

    raise exc


def retrieve_price_unit_amount_cents(price_id: str) -> int:
    """Return unit amount in smallest currency unit (e.g. cents)."""
    _configure_stripe()
    import stripe

    try:
        price = stripe.Price.retrieve(price_id)
    except Exception as exc:
        _handle_stripe_error(exc, operation="retrieve_price")
    if price.unit_amount is None:
        raise BadRequestException(detail="Stripe price has no unit_amount.")
    return int(price.unit_amount)


def create_checkout_session(
    *,
    price_id: str,
    success_url: str,
    cancel_url: str,
    user_id: str,
    resume_id: str,
    product_type: str,
    customer_email: str | None = None,
) -> CheckoutSessionResult:
    """Create a Checkout Session for a one-time payment."""
    _configure_stripe()
    import stripe

    params: dict[str, Any] = {
        "mode": "payment",
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": success_url,
        "cancel_url": cancel_url,
        "client_reference_id": user_id,
        "metadata": {
            "user_id": user_id,
            "resume_id": resume_id,
            "product_type": product_type,
        },
    }
    if customer_email:
        params["customer_email"] = customer_email

    try:
        session = stripe.checkout.Session.create(**params)
    except Exception as exc:
        _handle_stripe_error(exc, operation="create_checkout_session")

    pi = getattr(session, "payment_intent", None)
    payment_intent_id = str(pi) if pi else None

    return CheckoutSessionResult(
        session_id=session.id,
        url=session.url,
        payment_intent_id=payment_intent_id,
        currency=str(session.currency or "usd"),
        amount_total=session.amount_total,
    )


def retrieve_checkout_session(session_id: str) -> dict[str, Any]:
    """Return a dict snapshot of the Checkout Session (for sync / recovery)."""
    _configure_stripe()
    import stripe

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as exc:
        _handle_stripe_error(exc, operation="retrieve_checkout_session")
    pi = getattr(session, "payment_intent", None)
    if isinstance(pi, dict):
        pi_id = pi.get("id")
    else:
        pi_id = str(pi) if pi else None
    return {
        "id": session.id,
        "payment_status": getattr(session, "payment_status", None),
        "status": getattr(session, "status", None),
        "amount_total": session.amount_total,
        "currency": getattr(session, "currency", None) or "usd",
        "payment_intent": pi_id,
    }


def _event_to_dict(event: Any) -> dict[str, Any]:
    to_dict = getattr(event, "to_dict", None)
    if callable(to_dict):
        return to_dict()
    if isinstance(event, dict):
        return event
    return dict(event)


def verify_webhook_event(payload: bytes, sig_header: str | None) -> dict[str, Any]:
    """Verify Stripe-Signature and return the event as a plain dict."""
    if not settings.stripe_webhook_configured:
        raise AppException(
            status_code=503,
            detail="Stripe webhook is not configured. Set a real STRIPE_WEBHOOK_SECRET.",
        )
    if not sig_header:
        raise BadRequestException(detail="Missing Stripe-Signature header.")

    import stripe

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError as exc:
        raise BadRequestException(detail="Invalid webhook payload.") from exc
    except Exception as exc:
        if type(exc).__name__ == "SignatureVerificationError":
            logger.warning("stripe.webhook_signature_invalid", error=str(exc))
            raise BadRequestException(detail="Invalid webhook signature.") from exc
        _handle_stripe_error(exc, operation="verify_webhook_event")

    return _event_to_dict(event)
