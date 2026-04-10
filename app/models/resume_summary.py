from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ResumeSummary(BaseModel):
    __tablename__ = "resume_summaries"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")

    resume: Mapped["Resume"] = relationship(back_populates="summary")  # noqa: F821
