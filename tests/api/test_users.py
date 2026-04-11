"""User profile routes in the hybrid Supabase/local-user migration phase."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.core.exceptions import NotFoundException
from tests.conftest import TEST_USER_ID

API = "/api/v1/users"
USER = uuid.UUID(TEST_USER_ID)


def _make_user_model(*, full_name: str = "Test User") -> SimpleNamespace:
    return SimpleNamespace(
        id=USER,
        email="test@example.com",
        full_name=full_name,
        is_active=True,
        is_pro=False,
        avatar_url=None,
        created_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_get_me_syncs_missing_local_user(client: AsyncClient) -> None:
    synced_user = _make_user_model()

    with patch("app.api.v1.routers.users.UserService") as MockService:
        MockService.return_value.get = AsyncMock(side_effect=NotFoundException("User"))
        MockService.return_value.sync_auth_user = AsyncMock(return_value=synced_user)

        response = await client.get(API + "/me")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(USER)
    assert body["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_patch_me_syncs_before_updating_when_local_user_missing(client: AsyncClient) -> None:
    synced_user = _make_user_model()
    updated_user = _make_user_model(full_name="Updated User")

    with patch("app.api.v1.routers.users.UserService") as MockService:
        MockService.return_value.update = AsyncMock(
            side_effect=[NotFoundException("User"), updated_user]
        )
        MockService.return_value.sync_auth_user = AsyncMock(return_value=synced_user)

        response = await client.patch(API + "/me", json={"full_name": "Updated User"})

    assert response.status_code == 200
    body = response.json()
    assert body["full_name"] == "Updated User"
