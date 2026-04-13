"""Serialize ORM resume graphs into template-friendly dicts."""

from __future__ import annotations

from datetime import date
from urllib.parse import urlparse

from app.models.resume import Resume


def _fmt_range(start: date, end: date | None, is_current: bool) -> str:
    s = start.strftime("%b %Y")
    if is_current or end is None:
        return f"{s} – Present"
    return f"{s} – {end.strftime('%b %Y')}"


def _normalize_href(raw: str | None) -> str | None:
    value = (raw or "").strip()
    if not value:
        return None
    if value.startswith("http://") or value.startswith("https://"):
        return value
    return f"https://{value}"


def _display_link(raw: str | None) -> str | None:
    href = _normalize_href(raw)
    if not href:
        return None
    parsed = urlparse(href)
    display = f"{parsed.netloc}{parsed.path}".rstrip("/")
    return display or href.replace("https://", "").replace("http://", "")


def resume_to_template_context(resume: Resume) -> dict:
    pi = resume.personal_info
    full_name = ""
    if pi:
        full_name = f"{pi.first_name} {pi.last_name}".strip()

    links = []
    for label, raw in (
        ("Portfolio", pi.website if pi else None),
        ("LinkedIn", pi.linkedin_url if pi else None),
        ("GitHub", pi.github_url if pi else None),
    ):
        href = _normalize_href(raw)
        display = _display_link(raw)
        if href and display:
            links.append(
                {
                    "label": label,
                    "href": href,
                    "display": display,
                }
            )

    personal: dict = {
        "first_name": pi.first_name if pi else "",
        "last_name": pi.last_name if pi else "",
        "full_name": full_name,
        "email": pi.email if pi else "",
        "phone": pi.phone if pi else None,
        "location": pi.location if pi else None,
        "website": pi.website if pi else None,
        "linkedin_url": pi.linkedin_url if pi else None,
        "github_url": pi.github_url if pi else None,
        "contact_items": [
            item
            for item in (
                pi.email if pi else "",
                pi.phone if pi else None,
                pi.location if pi else None,
            )
            if item
        ],
        "links": links,
    }

    summary_body = resume.summary.body.strip() if resume.summary and resume.summary.body else ""

    experiences: list[dict] = []
    for exp in sorted(resume.experiences, key=lambda e: e.sort_order):
        experiences.append(
            {
                "company": exp.company,
                "job_title": exp.job_title,
                "location": exp.location,
                "date_range": _fmt_range(exp.start_date, exp.end_date, exp.is_current),
                "bullets": [bullet.strip() for bullet in list(exp.bullets or []) if bullet.strip()],
            }
        )

    educations: list[dict] = []
    for edu in sorted(resume.educations, key=lambda e: e.sort_order):
        start = edu.start_date
        end = edu.end_date
        if end:
            date_range = f"{start.strftime('%b %Y')} – {end.strftime('%b %Y')}"
        else:
            date_range = f"{start.strftime('%b %Y')} – Present"
        educations.append(
            {
                "institution": edu.institution,
                "degree": edu.degree,
                "field_of_study": edu.field_of_study,
                "location": edu.location,
                "date_range": date_range,
                "gpa": edu.gpa,
                "description": edu.description,
            }
        )

    skills: list[dict] = []
    for sk in sorted(resume.skills, key=lambda s: s.sort_order):
        cleaned_items = [item.strip() for item in list(sk.items or []) if item.strip()]
        if not cleaned_items:
            continue
        skills.append({"category": sk.category, "items": cleaned_items})

    return {
        "resume_title": resume.title,
        "template_key": resume.template_key,
        "personal": personal,
        "summary": summary_body,
        "experiences": experiences,
        "educations": educations,
        "skills": skills,
    }
