"""Optional error reporting — vendor-agnostic hooks (e.g. Sentry when installed + DSN set)."""

from __future__ import annotations

import os
from typing import Any


def capture_exception(exc: BaseException, *, hint: str | None = None, **context: Any) -> None:
    """Forward to Sentry when `SENTRY_DSN` is set and `sentry-sdk` is installed (no-op otherwise).

    Call sites should still log locally; this avoids duplicating log lines with the global handler.
    """
    dsn = os.environ.get("SENTRY_DSN", "").strip()
    if not dsn:
        return
    try:
        import sentry_sdk
    except ImportError:
        return
    with sentry_sdk.push_scope() as scope:
        for k, v in context.items():
            scope.set_extra(k, v)
        if hint:
            scope.set_tag("hint", hint)
        sentry_sdk.capture_exception(exc)
