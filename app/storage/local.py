"""Local filesystem storage backend."""

from __future__ import annotations

import asyncio
from pathlib import Path

import aiofiles

from app.core.config import settings
from app.storage.base import StoredObject, StorageBackend


class LocalFilesystemStorage(StorageBackend):
    """Writes under ``EXPORT_STORAGE_ROOT`` with safe path joining."""

    def __init__(self, root: Path | None = None) -> None:
        self._root = (root or settings.EXPORT_STORAGE_ROOT).resolve()

    async def write_bytes(
        self,
        *,
        key: str,
        data: bytes,
        content_type: str,
    ) -> StoredObject:
        if ".." in key or key.startswith("/"):
            raise ValueError("Invalid storage key")
        dest = self._root / key
        dest.parent.mkdir(parents=True, exist_ok=True)

        async def _write() -> None:
            async with aiofiles.open(dest, "wb") as f:
                await f.write(data)

        await _write()
        return StoredObject(
            key=key,
            absolute_path=str(dest),
            size_bytes=len(data),
            content_type=content_type,
        )

    def public_url(self, key: str) -> str | None:
        base = settings.PUBLIC_FILES_BASE_URL.strip().rstrip("/")
        if not base:
            return None
        return f"{base}/{key.lstrip('/')}"


def ensure_export_root_exists() -> None:
    settings.EXPORT_STORAGE_ROOT.mkdir(parents=True, exist_ok=True)
