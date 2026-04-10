"""Make stripe_payment_intent_id nullable for Checkout-before-intent flow.

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-09
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "payments",
        "stripe_payment_intent_id",
        existing_type=sa.String(255),
        nullable=True,
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE payments
        SET stripe_payment_intent_id = COALESCE(
            stripe_payment_intent_id,
            'legacy_unknown_' || id::text
        )
        WHERE stripe_payment_intent_id IS NULL
        """
    )
    op.alter_column(
        "payments",
        "stripe_payment_intent_id",
        existing_type=sa.String(255),
        nullable=False,
    )
