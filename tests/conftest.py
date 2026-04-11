"""Shared pytest fixtures with FastAPI dependency overrides.

Overrides both auth and database dependencies so tests run
without a real PostgreSQL connection.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.core.deps import AuthenticatedUser, get_current_auth_user, get_current_user_id
from app.main import app

TEST_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"


def _override_current_user_id() -> str:
    return TEST_USER_ID


def _override_current_auth_user() -> AuthenticatedUser:
    return AuthenticatedUser(
        id=TEST_USER_ID,
        email="test@example.com",
        full_name="Test User",
    )


async def _override_get_db() -> AsyncIterator[MagicMock]:
    yield MagicMock()


@pytest.fixture(autouse=True)
def _apply_overrides():
    app.dependency_overrides[get_current_user_id] = _override_current_user_id
    app.dependency_overrides[get_current_auth_user] = _override_current_auth_user
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def user_id() -> uuid.UUID:
    return uuid.UUID(TEST_USER_ID)
