"""AI endpoints — mocked LLM provider (no real API calls)."""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.core.deps import get_ai_service
from app.main import app
from app.services.ai_service import AIService
from app.services.llm_provider import LLMProvider

API = "/api/v1/ai"


class _FakeLLM(LLMProvider):
    def __init__(self, payload: str) -> None:
        self._payload = payload

    async def complete_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
    ) -> str:
        return self._payload


@pytest.fixture
def fake_summary_llm() -> None:
    app.dependency_overrides[get_ai_service] = lambda: AIService(
        _FakeLLM('{"rewritten_summary": "Concise summary from facts only."}')
    )


@pytest.fixture
def fake_exp_llm() -> None:
    app.dependency_overrides[get_ai_service] = lambda: AIService(
        _FakeLLM('{"bullets": ["Shipped feature X", "Cut costs by streamlining Y"]}')
    )


@pytest.fixture
def fake_opt_llm() -> None:
    app.dependency_overrides[get_ai_service] = lambda: AIService(
        _FakeLLM(
            '{"summary": "Tight ATS summary.", '
            '"experience_bullets": [["Bullet one", "Bullet two"]], '
            '"skill_phrases": ["Python", "AWS"], '
            '"ats_notes": "Use strong verbs already in your bullets."}'
        )
    )


@pytest.mark.asyncio
async def test_rewrite_summary_200(client: AsyncClient, fake_summary_llm: None) -> None:
    response = await client.post(
        API + "/rewrite-summary",
        json={
            "summary_body": "I have 5 years in backend development with Python.",
            "target_role": "Staff Engineer",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rewritten_summary"] == "Concise summary from facts only."


@pytest.mark.asyncio
async def test_rewrite_experience_200(client: AsyncClient, fake_exp_llm: None) -> None:
    response = await client.post(
        API + "/rewrite-experience",
        json={
            "company": "Acme",
            "job_title": "Engineer",
            "start_date": "2020-01-01",
            "is_current": True,
            "bullets": ["Did things", "Helped team"],
        },
    )
    assert response.status_code == 200
    assert len(response.json()["bullets"]) == 2


@pytest.mark.asyncio
async def test_optimize_resume_200(client: AsyncClient, fake_opt_llm: None) -> None:
    response = await client.post(
        API + "/optimize-resume",
        json={
            "title": "My CV",
            "summary_body": "Engineer with cloud experience.",
            "experiences": [
                {
                    "company": "Acme",
                    "job_title": "Engineer",
                    "start_date": "2020-01-01",
                    "is_current": True,
                    "bullets": ["Built APIs"],
                }
            ],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"] == "Tight ATS summary."
    assert data["experience_bullets"] == [["Bullet one", "Bullet two"]]
    assert "Python" in data["skill_phrases"]


@pytest.mark.asyncio
async def test_rewrite_summary_validation_error_returns_400(client: AsyncClient) -> None:
    bad = AIService(_FakeLLM('{"wrong_key": "x"}'))
    app.dependency_overrides[get_ai_service] = lambda: bad
    try:
        response = await client.post(
            API + "/rewrite-summary",
            json={"summary_body": "Some text"},
        )
    finally:
        app.dependency_overrides.pop(get_ai_service, None)
    assert response.status_code == 400
    assert "validation" in response.json()["detail"].lower()
