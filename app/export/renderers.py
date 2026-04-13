"""Jinja2 HTML renderers for resume PDF templates."""

from __future__ import annotations

from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.export.constants import (
    TEMPLATE_ATS_CLASSIC,
    TEMPLATE_COMPACT_ATS,
    TEMPLATE_CORPORATE_MINIMAL,
    TEMPLATE_CRISP_TECH,
    TEMPLATE_ELEGANT_EXECUTIVE,
    TEMPLATE_CREATIVE_CLEAN,
    TEMPLATE_EXECUTIVE_SERIF,
    TEMPLATE_GRADUATE_STARTER,
    TEMPLATE_MODERN_PROFESSIONAL,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "resume"

_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)

_TEMPLATE_FILES: dict[str, str] = {
    TEMPLATE_ATS_CLASSIC: "ats_classic.html.j2",
    TEMPLATE_COMPACT_ATS: "compact_ats.html.j2",
    TEMPLATE_MODERN_PROFESSIONAL: "modern_professional.html.j2",
    TEMPLATE_CORPORATE_MINIMAL: "corporate_minimal.html.j2",
    TEMPLATE_CRISP_TECH: "crisp_tech.html.j2",
    TEMPLATE_GRADUATE_STARTER: "graduate_starter.html.j2",
    TEMPLATE_EXECUTIVE_SERIF: "executive_serif.html.j2",
    TEMPLATE_ELEGANT_EXECUTIVE: "elegant_executive.html.j2",
    TEMPLATE_CREATIVE_CLEAN: "creative_clean.html.j2",
}


def render_resume_html(template_key: str, context: dict) -> str:
    filename = _TEMPLATE_FILES.get(template_key)
    if not filename:
        filename = _TEMPLATE_FILES[TEMPLATE_MODERN_PROFESSIONAL]
    tpl = _ENV.get_template(filename)
    return tpl.render(**context)
