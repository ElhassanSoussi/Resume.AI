"""Add cover_letters, resume_versions, job_applications tables.

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-12
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── cover_letters ─────────────────────────────────────
    op.create_table(
        "cover_letters",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "resume_id",
            UUID(as_uuid=True),
            sa.ForeignKey("resumes.id", ondelete="SET NULL"),
            nullable=True,
            index=True,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("target_role", sa.String(255), nullable=True),
        sa.Column("job_description", sa.Text, nullable=True),
        sa.Column("body", sa.Text, nullable=False, server_default=""),
        sa.Column("status", sa.String(50), nullable=False, server_default="draft"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ── resume_versions ───────────────────────────────────
    op.create_table(
        "resume_versions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "resume_id",
            UUID(as_uuid=True),
            sa.ForeignKey("resumes.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("label", sa.String(255), nullable=False, server_default="Version"),
        sa.Column("snapshot", JSONB, nullable=False, server_default="{}"),
        sa.Column("is_tailored", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("job_description", sa.Text, nullable=True),
        sa.Column(
            "source_version_id",
            UUID(as_uuid=True),
            sa.ForeignKey("resume_versions.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ── job_applications ──────────────────────────────────
    op.create_table(
        "job_applications",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("company", sa.String(255), nullable=False),
        sa.Column("role", sa.String(255), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="applied"),
        sa.Column("job_description", sa.Text, nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("applied_date", sa.Date, nullable=True),
        sa.Column(
            "resume_version_id",
            UUID(as_uuid=True),
            sa.ForeignKey("resume_versions.id", ondelete="SET NULL"),
            nullable=True,
            index=True,
        ),
        sa.Column(
            "cover_letter_id",
            UUID(as_uuid=True),
            sa.ForeignKey("cover_letters.id", ondelete="SET NULL"),
            nullable=True,
            index=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("job_applications")
    op.drop_table("resume_versions")
    op.drop_table("cover_letters")
