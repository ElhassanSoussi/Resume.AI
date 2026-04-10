from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ExportCreate(BaseModel):
    resume_id: uuid.UUID
    format: str = Field(default="pdf", pattern=r"^(pdf|docx)$")
    template_key: str = Field(max_length=100)


class ExportRead(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    user_id: uuid.UUID
    format: str
    file_url: str | None = None
    file_size_bytes: int | None = None
    status: str
    template_key: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GeneratePdfRequest(BaseModel):
    """Optional body for ``POST …/generate-pdf``."""

    template_key: str | None = Field(
        default=None,
        max_length=100,
        description="One of: minimal_pro, modern_sidebar, executive. Omit to use the resume editor template.",
    )


class ExportHistoryItem(BaseModel):
    """Row for `/exports/history` — user-scoped export activity."""

    id: uuid.UUID
    resume_id: uuid.UUID
    resume_title: str
    format: str
    template_key: str
    status: str
    file_size_bytes: int | None = None
    mime_type: str = "application/pdf"
    suggested_filename: str
    public_download_url: str | None = None
    created_at: datetime


class PdfExportMetadataResponse(BaseModel):
    """Download-oriented metadata for a generated PDF export."""

    id: uuid.UUID
    resume_id: uuid.UUID
    user_id: uuid.UUID
    format: str
    template_key: str
    status: str
    storage_key: str | None = Field(
        None,
        description="Logical object key (same as persisted file_url for PDF exports).",
    )
    file_size_bytes: int | None = None
    mime_type: str = "application/pdf"
    public_download_url: str | None = Field(
        None,
        description="HTTPS URL when PUBLIC_FILES_BASE_URL is configured.",
    )
    suggested_filename: str
    created_at: datetime
    updated_at: datetime
