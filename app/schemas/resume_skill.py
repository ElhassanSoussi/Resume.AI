from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    items: list[str] = Field(min_length=1)
    sort_order: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    category: str | None = Field(None, min_length=1, max_length=100)
    items: list[str] | None = Field(None, min_length=1)
    sort_order: int | None = None


class SkillRead(SkillBase):
    id: uuid.UUID
    resume_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
