"""Resume PDF template identifiers."""

from __future__ import annotations

TEMPLATE_MINIMAL_PRO: str = "minimal_pro"
TEMPLATE_MODERN_SIDEBAR: str = "modern_sidebar"
TEMPLATE_EXECUTIVE: str = "executive"

ALLOWED_TEMPLATE_KEYS: frozenset[str] = frozenset(
    {
        TEMPLATE_MINIMAL_PRO,
        TEMPLATE_MODERN_SIDEBAR,
        TEMPLATE_EXECUTIVE,
    }
)

# Map legacy resume.template_key values from the editor
TEMPLATE_ALIASES: dict[str, str] = {
    "modern": TEMPLATE_MODERN_SIDEBAR,
    "default": TEMPLATE_MODERN_SIDEBAR,
    "minimal": TEMPLATE_MINIMAL_PRO,
}


def resolve_template_key(raw: str | None, *, fallback: str) -> str:
    key = (raw or fallback or TEMPLATE_MODERN_SIDEBAR).strip().lower()
    key = TEMPLATE_ALIASES.get(key, key)
    if key not in ALLOWED_TEMPLATE_KEYS:
        return TEMPLATE_MODERN_SIDEBAR
    return key
