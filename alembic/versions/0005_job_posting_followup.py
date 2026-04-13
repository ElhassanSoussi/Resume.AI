"""Add job_posting_url and follow_up_date to job_applications."""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "job_applications",
        sa.Column("job_posting_url", sa.String(length=2000), nullable=True),
    )
    op.add_column(
        "job_applications",
        sa.Column("follow_up_date", sa.Date(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("job_applications", "follow_up_date")
    op.drop_column("job_applications", "job_posting_url")
