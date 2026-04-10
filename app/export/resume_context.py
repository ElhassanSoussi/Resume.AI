"""Serialize ORM resume graphs into Jinja-friendly dicts."""

from __future__ import annotations

from datetime import date

from app.models.resume import Resume


def _fmt_range(start: date, end: date | None, is_current: bool) -> str:
    s = start.strftime("%b %Y")
    if is_current or end is None:
        return f"{s} – Present"
    return f"{s} – {end.strftime('%b %Y')}"


def resume_to_template_context(resume: Resume) -> dict:
    pi = resume.personal_info
    full_name = ""
    if pi:
        full_name = f"{pi.first_name} {pi.last_name}".strip()

    personal: dict = {
        "first_name": pi.first_name if pi else "",
        "last_name": pi.last_name if pi else "",
        "full_name": full_name,
        "email": pi.email if pi else "",
        "phone": pi.phone,
        "location": pi.location,
        "website": pi.website if pi else None,
        "linkedin_url": pi.linkedin_url if pi else None,
        "github_url": pi.github_url if pi else None,
    }

    summary_body = resume.summary.body if resume.summary else ""

    experiences: list[dict] = []
    for exp in sorted(resume.experiences, key=lambda e: e.sort_order):
        experiences.append(
            {
                "company": exp.company,
                "job_title": exp.job_title,
                "location": exp.location,
                "date_range": _fmt_range(exp.start_date, exp.end_date, exp.is_current),
                "bullets": list(exp.bullets or []),
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
        skills.append({"category": sk.category, "items": list(sk.items or [])})

    return {
        "resume_title": resume.title,
        "template_key": resume.template_key,
        "personal": personal,
        "summary": summary_body,
        "experiences": experiences,
        "educations": educations,
        "skills": skills,
    }
