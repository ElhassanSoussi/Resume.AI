from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ResumeVersion(BaseModel):
    __tablename__ = "resume_versions"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False, default="Version")
    snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_tailored: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resume_versions.id", ondelete="SET NULL"),
        nullable=True,
    )

    resume: Mapped["Resume"] = relationship(back_populates="versions")  # noqa: F821
    job_applications: Mapped[list["JobApplication"]] = relationship(  # noqa: F821
        back_populates="resume_version",
        # resume_version_id is nullable (SET NULL on version delete), so delete-orphan is
        # intentionally omitted — job applications survive version deletion.
        cascade="save-update, merge",
        lazy="noload",
    )
