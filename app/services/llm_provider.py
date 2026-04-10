"""Provider-agnostic LLM interface with OpenAI-compatible implementation and retries."""

from __future__ import annotations

import asyncio
import json
import random
from typing import Any, Protocol, runtime_checkable

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class LLMProviderError(Exception):
    """Raised when the LLM provider fails after all retries."""


@runtime_checkable
class LLMProvider(Protocol):
    """Any chat-completions backend that returns JSON text."""

    async def complete_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
    ) -> str:
        """Return raw JSON string from model output (object or array root)."""
        ...


class OpenAICompatibleLLM:
    """OpenAI-compatible Chat Completions API (JSON mode).

    The ``openai`` package is imported lazily so the app can boot without it
    until this provider is instantiated.
    """

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str,
        model: str,
        timeout_seconds: float,
        max_retries: int,
        backoff_base_seconds: float,
        temperature: float,
    ) -> None:
        from openai import AsyncOpenAI

        self._model = model
        self._timeout = timeout_seconds
        self._max_retries = max(1, max_retries)
        self._backoff_base = backoff_base_seconds
        self._temperature = temperature
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url.rstrip("/"),
            timeout=timeout_seconds,
        )

    @classmethod
    def from_settings(cls) -> OpenAICompatibleLLM:
        return cls(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model=settings.OPENAI_MODEL,
            timeout_seconds=settings.AI_REQUEST_TIMEOUT_SECONDS,
            max_retries=settings.AI_MAX_RETRIES,
            backoff_base_seconds=settings.AI_RETRY_BACKOFF_BASE_SECONDS,
            temperature=settings.AI_TEMPERATURE,
        )

    async def complete_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
    ) -> str:
        from openai import (
            APIConnectionError,
            APIStatusError,
            APITimeoutError,
            RateLimitError,
        )

        last_error: Exception | None = None
        for attempt in range(1, self._max_retries + 1):
            try:
                response = await self._client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=self._temperature,
                    max_tokens=max_output_tokens,
                )
                choice = response.choices[0].message.content
                if not choice or not choice.strip():
                    raise LLMProviderError("Empty model response")
                text = choice.strip()
                self._assert_looks_like_json(text)
                return text
            except (APIConnectionError, APITimeoutError, RateLimitError) as exc:
                last_error = exc
                logger.warning(
                    "llm.retry",
                    attempt=attempt,
                    max_retries=self._max_retries,
                    error_type=type(exc).__name__,
                )
            except APIStatusError as exc:
                last_error = exc
                code = exc.status_code
                if code == 429 or (500 <= code < 600):
                    logger.warning(
                        "llm.retry_status",
                        attempt=attempt,
                        status=code,
                    )
                else:
                    detail = getattr(exc, "message", None) or str(exc)
                    raise LLMProviderError(f"API error {code}: {detail}") from exc
            except LLMProviderError as exc:
                last_error = exc
                logger.warning("llm.retry_parse", attempt=attempt, error=str(exc))

            if attempt < self._max_retries:
                delay = self._backoff_base * (2 ** (attempt - 1))
                jitter = random.uniform(0, 0.25 * delay)
                await asyncio.sleep(delay + jitter)

        raise LLMProviderError(f"LLM failed after {self._max_retries} attempts: {last_error}") from last_error

    @staticmethod
    def _assert_looks_like_json(text: str) -> None:
        stripped = text.strip()
        if not (stripped.startswith("{") or stripped.startswith("[")):
            raise LLMProviderError("Model output is not JSON")


def parse_json_object(raw: str) -> dict[str, Any]:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise LLMProviderError(f"Invalid JSON from model: {exc}") from exc
    if not isinstance(data, dict):
        raise LLMProviderError("Expected a JSON object at root")
    return data
