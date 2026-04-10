from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class SummaryBase(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class SummaryCreate(SummaryBase):
    pass


class SummaryUpdate(BaseModel):
    body: str | None = Field(None, min_length=1, max_length=5000)


class SummaryRead(SummaryBase):
    id: uuid.UUID
    resume_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
