from __future__ import annotations

import asyncio

from app.core.config import settings
from app.core.supabase import get_supabase_client
from app.storage.base import StorageBackend, StoredObject


class SupabaseStorageBackend(StorageBackend):
    def __init__(self, bucket: str | None = None) -> None:
        self._bucket = (bucket or settings.SUPABASE_EXPORTS_BUCKET).strip()
        if not self._bucket:
            raise RuntimeError("Supabase storage bucket is not configured.")

    async def write_bytes(
        self,
        *,
        key: str,
        data: bytes,
        content_type: str,
    ) -> StoredObject:
        if ".." in key or key.startswith("/"):
            raise ValueError("Invalid storage key")

        await asyncio.to_thread(
            get_supabase_client().storage.from_(self._bucket).upload,
            key,
            data,
            {"content-type": content_type, "upsert": "true"},
        )

        return StoredObject(
            key=key,
            absolute_path=f"supabase://{self._bucket}/{key}",
            size_bytes=len(data),
            content_type=content_type,
        )

    def public_url(self, key: str) -> str | None:
        if not key:
            return None
        signed = get_supabase_client().storage.from_(self._bucket).create_signed_url(
            key,
            settings.SUPABASE_STORAGE_SIGNED_URL_EXPIRES_SECONDS,
        )
        return signed.get("signedURL") or signed.get("signedUrl")
