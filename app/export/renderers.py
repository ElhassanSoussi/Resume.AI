"""Jinja2 HTML renderers for resume PDF templates."""

from __future__ import annotations

from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.export.constants import (
    TEMPLATE_EXECUTIVE,
    TEMPLATE_MINIMAL_PRO,
    TEMPLATE_MODERN_SIDEBAR,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "resume"

_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)

_TEMPLATE_FILES: dict[str, str] = {
    TEMPLATE_MINIMAL_PRO: "minimal_pro.html.j2",
    TEMPLATE_MODERN_SIDEBAR: "modern_sidebar.html.j2",
    TEMPLATE_EXECUTIVE: "executive.html.j2",
}


def render_resume_html(template_key: str, context: dict) -> str:
    filename = _TEMPLATE_FILES.get(template_key)
    if not filename:
        filename = _TEMPLATE_FILES[TEMPLATE_MODERN_SIDEBAR]
    tpl = _ENV.get_template(filename)
    return tpl.render(**context)
