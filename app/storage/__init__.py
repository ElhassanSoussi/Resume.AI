from app.storage.base import StorageBackend, StoredObject
from app.storage.local import LocalFilesystemStorage, ensure_export_root_exists
from app.storage.supabase import SupabaseStorageBackend
from app.core.config import settings


def get_storage_backend() -> StorageBackend:
    if settings.supabase_storage_configured:
        return SupabaseStorageBackend()
    return LocalFilesystemStorage()


def ensure_storage_ready() -> None:
    if settings.supabase_storage_configured:
        return
    ensure_export_root_exists()


__all__ = [
    "StorageBackend",
    "StoredObject",
    "LocalFilesystemStorage",
    "SupabaseStorageBackend",
    "ensure_export_root_exists",
    "get_storage_backend",
    "ensure_storage_ready",
]
