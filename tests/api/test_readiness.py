"""Readiness endpoint — database check is mocked (no real Postgres in unit tests)."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ready_returns_200_when_database_ok(client: AsyncClient) -> None:
    with patch("app.api.v1.routers.health.check_database", new_callable=AsyncMock, return_value=True):
        response = await client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] is True
    assert "version" in data


@pytest.mark.asyncio
async def test_ready_returns_503_when_database_down(client: AsyncClient) -> None:
    with patch("app.api.v1.routers.health.check_database", new_callable=AsyncMock, return_value=False):
        response = await client.get("/api/v1/ready")
    assert response.status_code == 503
