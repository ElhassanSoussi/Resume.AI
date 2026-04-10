"""HTML → PDF via WeasyPrint (blocking work runs in a thread pool)."""

from __future__ import annotations

import asyncio

from app.core.logging import get_logger

logger = get_logger(__name__)


def _write_pdf_sync(html: str, base_url: str | None) -> bytes:
    from weasyprint import HTML

    return HTML(string=html, base_url=base_url or ".").write_pdf()


async def html_to_pdf(html: str, *, base_url: str | None = None) -> bytes:
    """Render HTML string to PDF bytes."""
    try:
        return await asyncio.to_thread(_write_pdf_sync, html, base_url)
    except Exception as exc:
        logger.exception("pdf.render_failed", error=str(exc))
        raise RuntimeError(f"PDF rendering failed: {exc}") from exc
