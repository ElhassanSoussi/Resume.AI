from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment
from app.repositories.base import BaseRepository


class PaymentRepository(BaseRepository[Payment]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Payment, session)

    async def get_by_user(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> Sequence[Payment]:
        stmt = (
            select(Payment)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def get_by_stripe_intent(self, intent_id: str) -> Payment | None:
        stmt = select(Payment).where(Payment.stripe_payment_intent_id == intent_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_checkout_session_id(self, session_id: str) -> Payment | None:
        stmt = select(Payment).where(Payment.stripe_checkout_session_id == session_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_succeeded_export_for_resume(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
        product_type: str,
    ) -> Payment | None:
        stmt = (
            select(Payment)
            .where(
                Payment.user_id == user_id,
                Payment.resume_id == resume_id,
                Payment.product_type == product_type,
                Payment.status == "succeeded",
            )
            .order_by(Payment.updated_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
