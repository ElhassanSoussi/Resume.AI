"""Domain constants shared across services."""

from __future__ import annotations

# Stripe / product identifiers (metadata + DB product_type)
PRODUCT_SINGLE_PDF_EXPORT: str = "single_pdf_export"

# Payment lifecycle
PAYMENT_STATUS_PENDING: str = "pending"
PAYMENT_STATUS_PROCESSING: str = "processing"
PAYMENT_STATUS_SUCCEEDED: str = "succeeded"
PAYMENT_STATUS_FAILED: str = "failed"
PAYMENT_STATUS_CANCELED: str = "canceled"
