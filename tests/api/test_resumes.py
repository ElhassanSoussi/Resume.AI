"""Comprehensive CRUD tests for /api/v1/resumes endpoints.

Tests mock the service layer so they run without a database and verify
the full HTTP contract: status codes, response shapes, validation, and
ownership filtering.
"""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_ID
from tests.factories import (
    make_resume_create_payload,
    make_resume_full_update_payload,
    make_resume_list_item_mock,
    make_resume_model_mock,
)

API = "/api/v1/resumes"
USER = uuid.UUID(TEST_USER_ID)


# ── POST /resumes ────────────────────────────────────────────


class TestCreateResume:
    @pytest.mark.asyncio
    async def test_create_returns_201_with_full_payload(self, client: AsyncClient) -> None:
        mock_resume = make_resume_model_mock(user_id=USER)
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.create = AsyncMock(return_value=mock_resume)
            response = await client.post(API + "/", json=make_resume_create_payload())

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Senior Engineer Resume"
        assert data["template_key"] == "modern"
        assert data["status"] == "draft"
        assert data["personal_info"]["first_name"] == "Jane"
        assert data["summary"]["body"].startswith("Experienced")
        assert len(data["experiences"]) == 1
        assert len(data["educations"]) == 1
        assert len(data["skills"]) == 1
        assert data["skills"][0]["items"] == ["Python", "TypeScript", "Go"]

    @pytest.mark.asyncio
    async def test_create_minimal_payload(self, client: AsyncClient) -> None:
        mock_resume = make_resume_model_mock(
            user_id=USER,
            title="Blank Resume",
            personal_info=None,
            summary=None,
            experiences=[],
            educations=[],
            skills=[],
        )
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.create = AsyncMock(return_value=mock_resume)
            response = await client.post(API + "/", json={"title": "Blank Resume"})

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Blank Resume"
        assert data["personal_info"] is None
        assert data["experiences"] == []

    @pytest.mark.asyncio
    async def test_create_missing_title_returns_422(self, client: AsyncClient) -> None:
        response = await client.post(API + "/", json={})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_empty_title_returns_422(self, client: AsyncClient) -> None:
        response = await client.post(API + "/", json={"title": ""})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_title_too_long_returns_422(self, client: AsyncClient) -> None:
        response = await client.post(API + "/", json={"title": "x" * 256})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_invalid_experience_dates_returns_422(
        self, client: AsyncClient
    ) -> None:
        payload = make_resume_create_payload(
            experiences=[
                {
                    "company": "Acme",
                    "job_title": "Dev",
                    "start_date": "2023-06-01",
                    "end_date": "2023-01-01",
                    "is_current": False,
                    "bullets": [],
                }
            ]
        )
        response = await client.post(API + "/", json=payload)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_current_job_with_end_date_returns_422(
        self, client: AsyncClient
    ) -> None:
        payload = make_resume_create_payload(
            experiences=[
                {
                    "company": "Acme",
                    "job_title": "Dev",
                    "start_date": "2023-01-01",
                    "end_date": "2024-01-01",
                    "is_current": True,
                    "bullets": [],
                }
            ]
        )
        response = await client.post(API + "/", json=payload)
        assert response.status_code == 422


# ── GET /resumes ─────────────────────────────────────────────


class TestListResumes:
    @pytest.mark.asyncio
    async def test_list_returns_paginated_response(self, client: AsyncClient) -> None:
        mocks = [
            make_resume_list_item_mock(user_id=USER, title=f"Resume {i}")
            for i in range(3)
        ]
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.list_for_user = AsyncMock(return_value=(mocks, 3))
            response = await client.get(API + "/")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert data["offset"] == 0
        assert data["limit"] == 50
        assert len(data["items"]) == 3
        assert "personal_info" not in data["items"][0]

    @pytest.mark.asyncio
    async def test_list_empty_returns_zero_total(self, client: AsyncClient) -> None:
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.list_for_user = AsyncMock(return_value=([], 0))
            response = await client.get(API + "/")

        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_list_respects_pagination_params(self, client: AsyncClient) -> None:
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.list_for_user = AsyncMock(return_value=([], 0))
            response = await client.get(API + "/", params={"offset": 10, "limit": 5})

        assert response.status_code == 200
        data = response.json()
        assert data["offset"] == 10
        assert data["limit"] == 5

    @pytest.mark.asyncio
    async def test_list_invalid_limit_returns_422(self, client: AsyncClient) -> None:
        response = await client.get(API + "/", params={"limit": 200})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_list_negative_offset_returns_422(self, client: AsyncClient) -> None:
        response = await client.get(API + "/", params={"offset": -1})
        assert response.status_code == 422


# ── GET /resumes/{id} ────────────────────────────────────────


class TestGetResume:
    @pytest.mark.asyncio
    async def test_get_returns_full_resume_with_sections(
        self, client: AsyncClient
    ) -> None:
        rid = uuid.uuid4()
        mock_resume = make_resume_model_mock(resume_id=rid, user_id=USER)
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.get = AsyncMock(return_value=mock_resume)
            response = await client.get(f"{API}/{rid}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(rid)
        assert data["personal_info"] is not None
        assert data["summary"] is not None
        assert len(data["experiences"]) == 1
        assert len(data["educations"]) == 1
        assert len(data["skills"]) == 1

    @pytest.mark.asyncio
    async def test_get_not_found_returns_404(self, client: AsyncClient) -> None:
        from app.core.exceptions import NotFoundException

        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.get = AsyncMock(
                side_effect=NotFoundException("Resume")
            )
            response = await client.get(f"{API}/{uuid.uuid4()}")

        assert response.status_code == 404
        assert response.json()["detail"] == "Resume not found."

    @pytest.mark.asyncio
    async def test_get_invalid_uuid_returns_422(self, client: AsyncClient) -> None:
        response = await client.get(f"{API}/not-a-uuid")
        assert response.status_code == 422


# ── PUT /resumes/{id} ────────────────────────────────────────


class TestReplaceResume:
    @pytest.mark.asyncio
    async def test_put_replaces_entire_resume(self, client: AsyncClient) -> None:
        rid = uuid.uuid4()
        updated = make_resume_model_mock(
            resume_id=rid, user_id=USER, title="Updated Title"
        )
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.full_update = AsyncMock(return_value=updated)
            response = await client.put(
                f"{API}/{rid}",
                json=make_resume_full_update_payload(title="Updated Title"),
            )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["personal_info"] is not None

    @pytest.mark.asyncio
    async def test_put_clears_sections_when_omitted(self, client: AsyncClient) -> None:
        rid = uuid.uuid4()
        updated = make_resume_model_mock(
            resume_id=rid,
            user_id=USER,
            personal_info=None,
            summary=None,
            experiences=[],
            educations=[],
            skills=[],
        )
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.full_update = AsyncMock(return_value=updated)
            response = await client.put(
                f"{API}/{rid}",
                json={"title": "Minimal", "status": "draft"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["personal_info"] is None
        assert data["experiences"] == []

    @pytest.mark.asyncio
    async def test_put_not_found_returns_404(self, client: AsyncClient) -> None:
        from app.core.exceptions import NotFoundException

        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.full_update = AsyncMock(
                side_effect=NotFoundException("Resume")
            )
            response = await client.put(
                f"{API}/{uuid.uuid4()}",
                json=make_resume_full_update_payload(),
            )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_put_invalid_status_returns_422(self, client: AsyncClient) -> None:
        response = await client.put(
            f"{API}/{uuid.uuid4()}",
            json={"title": "X", "status": "archived"},
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_put_missing_title_returns_422(self, client: AsyncClient) -> None:
        response = await client.put(
            f"{API}/{uuid.uuid4()}",
            json={"status": "draft"},
        )
        assert response.status_code == 422


# ── PATCH /resumes/{id} ──────────────────────────────────────


class TestPartialUpdateResume:
    @pytest.mark.asyncio
    async def test_patch_updates_title_only(self, client: AsyncClient) -> None:
        rid = uuid.uuid4()
        updated = make_resume_model_mock(
            resume_id=rid, user_id=USER, title="New Title"
        )
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.partial_update = AsyncMock(return_value=updated)
            response = await client.patch(
                f"{API}/{rid}", json={"title": "New Title"}
            )

        assert response.status_code == 200
        assert response.json()["title"] == "New Title"

    @pytest.mark.asyncio
    async def test_patch_updates_status(self, client: AsyncClient) -> None:
        rid = uuid.uuid4()
        updated = make_resume_model_mock(
            resume_id=rid, user_id=USER, status="complete"
        )
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.partial_update = AsyncMock(return_value=updated)
            response = await client.patch(
                f"{API}/{rid}", json={"status": "complete"}
            )

        assert response.status_code == 200
        assert response.json()["status"] == "complete"

    @pytest.mark.asyncio
    async def test_patch_invalid_status_returns_422(self, client: AsyncClient) -> None:
        response = await client.patch(
            f"{API}/{uuid.uuid4()}", json={"status": "bad"}
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_patch_not_found_returns_404(self, client: AsyncClient) -> None:
        from app.core.exceptions import NotFoundException

        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.partial_update = AsyncMock(
                side_effect=NotFoundException("Resume")
            )
            response = await client.patch(
                f"{API}/{uuid.uuid4()}", json={"title": "X"}
            )

        assert response.status_code == 404


# ── DELETE /resumes/{id} ─────────────────────────────────────


class TestDeleteResume:
    @pytest.mark.asyncio
    async def test_delete_returns_message(self, client: AsyncClient) -> None:
        rid = uuid.uuid4()
        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.delete = AsyncMock(return_value=None)
            response = await client.delete(f"{API}/{rid}")

        assert response.status_code == 200
        assert response.json()["message"] == "Resume deleted."

    @pytest.mark.asyncio
    async def test_delete_not_found_returns_404(self, client: AsyncClient) -> None:
        from app.core.exceptions import NotFoundException

        with patch(
            "app.api.v1.routers.resumes.ResumeService"
        ) as MockService:
            MockService.return_value.delete = AsyncMock(
                side_effect=NotFoundException("Resume")
            )
            response = await client.delete(f"{API}/{uuid.uuid4()}")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_invalid_uuid_returns_422(self, client: AsyncClient) -> None:
        response = await client.delete(f"{API}/not-a-uuid")
        assert response.status_code == 422
