"""Refresh resume template defaults and normalize legacy template keys.

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-12
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("resumes", "template_key", server_default="modern_professional")

    op.execute(
        sa.text(
            """
            UPDATE resumes
            SET template_key = CASE template_key
                WHEN 'modern' THEN 'modern_professional'
                WHEN 'modern_sidebar' THEN 'modern_professional'
                WHEN 'minimal' THEN 'ats_classic'
                WHEN 'minimal_pro' THEN 'ats_classic'
                WHEN 'executive' THEN 'executive_serif'
                ELSE template_key
            END
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE resumes
            SET template_key = CASE template_key
                WHEN 'modern_professional' THEN 'modern'
                WHEN 'ats_classic' THEN 'minimal_pro'
                WHEN 'executive_serif' THEN 'executive'
                ELSE template_key
            END
            """
        )
    )
    op.alter_column("resumes", "template_key", server_default="modern")
