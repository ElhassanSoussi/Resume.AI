from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.storage.supabase import SupabaseStorageBackend


class _FakeBucket:
    def __init__(self) -> None:
        self.upload_calls: list[tuple[str, bytes, dict[str, str]]] = []
        self.signed_calls: list[tuple[str, int]] = []

    def upload(self, path: str, file: bytes, file_options: dict[str, str]):
        self.upload_calls.append((path, file, file_options))
        return {"path": path}

    def create_signed_url(self, path: str, expires_in: int):
        self.signed_calls.append((path, expires_in))
        return {"signedURL": f"https://signed.example/{path}"}


class _FakeStorage:
    def __init__(self, bucket: _FakeBucket) -> None:
        self._bucket = bucket

    def from_(self, _bucket_name: str) -> _FakeBucket:
        return self._bucket


@pytest.mark.asyncio
async def test_supabase_storage_uploads_bytes() -> None:
    bucket = _FakeBucket()
    client = SimpleNamespace(storage=_FakeStorage(bucket))

    with patch("app.storage.supabase.get_supabase_client", return_value=client):
        backend = SupabaseStorageBackend(bucket="resume-exports")
        stored = await backend.write_bytes(
            key="users/u/resumes/r/file.pdf",
            data=b"pdf-data",
            content_type="application/pdf",
        )

    assert stored.key.endswith("file.pdf")
    assert bucket.upload_calls[0][0] == "users/u/resumes/r/file.pdf"


def test_supabase_storage_returns_signed_url() -> None:
    bucket = _FakeBucket()
    client = SimpleNamespace(storage=_FakeStorage(bucket))

    with patch("app.storage.supabase.get_supabase_client", return_value=client):
        backend = SupabaseStorageBackend(bucket="resume-exports")
        url = backend.public_url("users/u/resumes/r/file.pdf")

    assert url == "https://signed.example/users/u/resumes/r/file.pdf"
