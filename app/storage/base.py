"""Storage backend abstraction — local disk today, object storage tomorrow."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass(frozen=True)
class StoredObject:
    """Reference to a persisted binary object."""

    key: str
    """Logical key, e.g. ``users/{user_id}/resumes/{resume_id}/{export_id}.pdf``."""

    absolute_path: str
    """Absolute filesystem path when using local storage."""

    size_bytes: int
    content_type: str


@runtime_checkable
class StorageBackend(Protocol):
    async def write_bytes(
        self,
        *,
        key: str,
        data: bytes,
        content_type: str,
    ) -> StoredObject:
        """Persist ``data`` at ``key`` and return metadata."""
        ...

    def public_url(self, key: str) -> str | None:
        """Optional HTTPS URL if the backend exposes public URLs."""
        ...
