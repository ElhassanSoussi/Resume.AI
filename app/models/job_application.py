from __future__ import annotations

import uuid

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date as PyDate

from app.models.base import BaseModel


class JobApplication(BaseModel):
    __tablename__ = "job_applications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="applied")
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    applied_date: Mapped[PyDate | None] = mapped_column(Date, nullable=True)
    resume_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resume_versions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    cover_letter_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cover_letters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    resume_version: Mapped["ResumeVersion | None"] = relationship(  # noqa: F821
        back_populates="job_applications"
    )
    cover_letter: Mapped["CoverLetter | None"] = relationship()  # noqa: F821
