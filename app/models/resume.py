from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Resume(BaseModel):
    __tablename__ = "resumes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    template_key: Mapped[str] = mapped_column(String(100), default="modern_professional", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)

    owner: Mapped["User"] = relationship(back_populates="resumes")  # noqa: F821

    personal_info: Mapped["ResumePersonalInfo | None"] = relationship(  # noqa: F821
        back_populates="resume",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    summary: Mapped["ResumeSummary | None"] = relationship(  # noqa: F821
        back_populates="resume",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    experiences: Mapped[list["ResumeExperience"]] = relationship(  # noqa: F821
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="ResumeExperience.sort_order",
        lazy="selectin",
    )
    educations: Mapped[list["ResumeEducation"]] = relationship(  # noqa: F821
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="ResumeEducation.sort_order",
        lazy="selectin",
    )
    skills: Mapped[list["ResumeSkill"]] = relationship(  # noqa: F821
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="ResumeSkill.sort_order",
        lazy="selectin",
    )
    exports: Mapped[list["ResumeExport"]] = relationship(  # noqa: F821
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="noload",
    )
    versions: Mapped[list["ResumeVersion"]] = relationship(  # noqa: F821
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="noload",
    )
    cover_letters: Mapped[list["CoverLetter"]] = relationship(  # noqa: F821
        back_populates="resume",
        # resume_id is nullable (SET NULL on resume delete), so delete-orphan is intentionally
        # omitted — cover letters survive resume deletion with resume_id set to NULL.
        cascade="save-update, merge",
        lazy="noload",
    )
