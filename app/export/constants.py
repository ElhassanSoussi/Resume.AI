"""Resume PDF template identifiers and export modes."""

from __future__ import annotations

TEMPLATE_ATS_CLASSIC: str = "ats_classic"
TEMPLATE_COMPACT_ATS: str = "compact_ats"
TEMPLATE_MODERN_PROFESSIONAL: str = "modern_professional"
TEMPLATE_CORPORATE_MINIMAL: str = "corporate_minimal"
TEMPLATE_CRISP_TECH: str = "crisp_tech"
TEMPLATE_GRADUATE_STARTER: str = "graduate_starter"
TEMPLATE_EXECUTIVE_SERIF: str = "executive_serif"
TEMPLATE_ELEGANT_EXECUTIVE: str = "elegant_executive"
TEMPLATE_CREATIVE_CLEAN: str = "creative_clean"

EXPORT_MODE_ATS: str = "ats"
EXPORT_MODE_DESIGNED: str = "designed"

ALLOWED_TEMPLATE_KEYS: frozenset[str] = frozenset(
    {
        TEMPLATE_ATS_CLASSIC,
        TEMPLATE_COMPACT_ATS,
        TEMPLATE_MODERN_PROFESSIONAL,
        TEMPLATE_CORPORATE_MINIMAL,
        TEMPLATE_CRISP_TECH,
        TEMPLATE_GRADUATE_STARTER,
        TEMPLATE_EXECUTIVE_SERIF,
        TEMPLATE_ELEGANT_EXECUTIVE,
        TEMPLATE_CREATIVE_CLEAN,
    }
)

ALLOWED_EXPORT_MODES: frozenset[str] = frozenset(
    {
        EXPORT_MODE_ATS,
        EXPORT_MODE_DESIGNED,
    }
)

# Map legacy resume.template_key values from the editor
TEMPLATE_ALIASES: dict[str, str] = {
    "modern": TEMPLATE_MODERN_PROFESSIONAL,
    "default": TEMPLATE_MODERN_PROFESSIONAL,
    "modern_sidebar": TEMPLATE_MODERN_PROFESSIONAL,
    "minimal": TEMPLATE_ATS_CLASSIC,
    "minimal_pro": TEMPLATE_ATS_CLASSIC,
    "executive": TEMPLATE_EXECUTIVE_SERIF,
    "compact": TEMPLATE_COMPACT_ATS,
    "corporate": TEMPLATE_CORPORATE_MINIMAL,
    "tech": TEMPLATE_CRISP_TECH,
    "graduate": TEMPLATE_GRADUATE_STARTER,
    "elegant": TEMPLATE_ELEGANT_EXECUTIVE,
}


def resolve_template_key(raw: str | None, *, fallback: str) -> str:
    key = (raw or fallback or TEMPLATE_MODERN_PROFESSIONAL).strip().lower()
    key = TEMPLATE_ALIASES.get(key, key)
    if key not in ALLOWED_TEMPLATE_KEYS:
        return TEMPLATE_MODERN_PROFESSIONAL
    return key


def resolve_export_mode(raw: str | None, *, fallback: str = EXPORT_MODE_DESIGNED) -> str:
    mode = (raw or fallback or EXPORT_MODE_DESIGNED).strip().lower()
    if mode not in ALLOWED_EXPORT_MODES:
        return EXPORT_MODE_DESIGNED
    return mode


def resolve_export_template_key(
    raw_template_key: str | None,
    *,
    export_mode: str | None,
    fallback: str,
) -> str:
    mode = resolve_export_mode(export_mode, fallback=EXPORT_MODE_DESIGNED)
    if mode == EXPORT_MODE_ATS:
        return TEMPLATE_ATS_CLASSIC
    return resolve_template_key(raw_template_key, fallback=fallback)
