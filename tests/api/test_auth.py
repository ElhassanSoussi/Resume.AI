"""Auth routes backed by Supabase auth in the hybrid migration phase."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

API = "/api/v1/auth"


def _make_user_model(*, user_id: uuid.UUID, email: str, full_name: str) -> SimpleNamespace:
    return SimpleNamespace(
        id=user_id,
        email=email,
        full_name=full_name,
        is_active=True,
        is_pro=False,
        avatar_url=None,
        created_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_register_201_uses_supabase_and_syncs_local_user(client: AsyncClient) -> None:
    uid = uuid.uuid4()
    auth_user = SimpleNamespace(
        id=str(uid),
        email="new@example.com",
        user_metadata={"full_name": "New User"},
    )
    local_user = _make_user_model(user_id=uid, email="new@example.com", full_name="New User")
    auth_client = SimpleNamespace(
        auth=SimpleNamespace(
            sign_up=lambda _: SimpleNamespace(user=auth_user, session=None)
        )
    )

    with (
        patch("app.api.v1.routers.auth.get_supabase_auth_client", return_value=auth_client),
        patch("app.api.v1.routers.auth.UserService") as MockService,
    ):
        MockService.return_value.sync_auth_user = AsyncMock(return_value=local_user)
        response = await client.post(
            API + "/register",
            json={
                "email": "new@example.com",
                "password": "password123",
                "full_name": "New User",
            },
        )

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == str(uid)
    assert body["email"] == "new@example.com"
    assert body["full_name"] == "New User"


@pytest.mark.asyncio
async def test_login_returns_supabase_tokens_and_syncs_local_user(client: AsyncClient) -> None:
    uid = uuid.uuid4()
    auth_user = SimpleNamespace(
        id=str(uid),
        email="login@example.com",
        user_metadata={"full_name": "Login User"},
    )
    auth_session = SimpleNamespace(
        access_token="supabase-access",
        refresh_token="supabase-refresh",
        token_type="bearer",
    )
    local_user = _make_user_model(user_id=uid, email="login@example.com", full_name="Login User")
    auth_client = SimpleNamespace(
        auth=SimpleNamespace(
            sign_in_with_password=lambda _: SimpleNamespace(user=auth_user, session=auth_session)
        )
    )

    with (
        patch("app.api.v1.routers.auth.get_supabase_auth_client", return_value=auth_client),
        patch("app.api.v1.routers.auth.UserService") as MockService,
    ):
        MockService.return_value.sync_auth_user = AsyncMock(return_value=local_user)
        response = await client.post(
            API + "/login",
            json={
                "email": "login@example.com",
                "password": "password123",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "access_token": "supabase-access",
        "refresh_token": "supabase-refresh",
        "token_type": "bearer",
    }


@pytest.mark.asyncio
async def test_login_invalid_credentials_returns_401(client: AsyncClient) -> None:
    def _raise_invalid_login(_payload: object) -> object:
        raise RuntimeError("Invalid login credentials")

    auth_client = SimpleNamespace(
        auth=SimpleNamespace(
            sign_in_with_password=_raise_invalid_login
        )
    )

    with patch("app.api.v1.routers.auth.get_supabase_auth_client", return_value=auth_client):
        response = await client.post(
            API + "/login",
            json={
                "email": "login@example.com",
                "password": "password123",
            },
        )

    assert response.status_code == 401
    assert "invalid login credentials" in response.json()["detail"].lower()
