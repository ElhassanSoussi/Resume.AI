import type { PreviewTemplateId } from "@/lib/resume/constants";
import type { ResumeRead } from "@/lib/types/resume";

function formatRange(start: string, end: string | null, isCurrent: boolean): string {
  const fmt = (iso: string) => {
    try {
      const d = new Date(iso.slice(0, 10) + "T12:00:00");
      return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    } catch {
      return iso.slice(0, 7);
    }
  };
  const s = fmt(start);
  if (isCurrent) return `${s} – Present`;
  if (!end) return s;
  return `${s} – ${fmt(end)}`;
}

type Props = {
  resume: ResumeRead;
  template: PreviewTemplateId;
};

export function ResumePreviewDocument({ resume, template }: Props) {
  const p = resume.personal_info;
  const name = p ? `${p.first_name} ${p.last_name}`.trim() : "Your name";
  const contactBits: string[] = [];
  if (p?.email) contactBits.push(p.email);
  if (p?.phone) contactBits.push(p.phone);
  if (p?.location) contactBits.push(p.location);
  const links: { label: string; href: string }[] = [];
  if (p?.website)
    links.push({ label: "Website", href: p.website.startsWith("http") ? p.website : `https://${p.website}` });
  if (p?.linkedin_url) links.push({ label: "LinkedIn", href: p.linkedin_url });
  if (p?.github_url) links.push({ label: "GitHub", href: p.github_url });

  const shell = {
    modern:
      "border-l-[3px] border-primary/80 bg-gradient-to-br from-card via-card to-muted/20 pl-6 pr-5 py-7 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
    minimal_pro:
      "border border-white/10 bg-card/90 px-7 py-8 tracking-tight shadow-[0_24px_80px_-32px_rgba(0,0,0,0.75)]",
    executive:
      "border border-amber-950/25 bg-gradient-to-b from-[#141210] to-card px-8 py-9 shadow-[0_32px_120px_-48px_rgba(0,0,0,0.85)]",
  }[template];

  const titleStyle = {
    modern: "font-heading text-3xl font-bold tracking-tight text-foreground",
    minimal_pro: "font-heading text-[1.65rem] font-semibold uppercase tracking-[0.18em] text-foreground",
    executive: "font-serif text-[2.1rem] font-semibold tracking-wide text-[#f4eee6]",
  }[template];

  const subStyle = {
    modern: "mt-1 text-sm text-muted-foreground",
    minimal_pro: "mt-3 text-[0.7rem] font-medium uppercase tracking-widest text-muted-foreground",
    executive: "mt-2 text-sm text-amber-200/70",
  }[template];

  const sectionLabel = {
    modern: "mb-2 border-b border-border pb-1 font-heading text-xs font-semibold uppercase tracking-wider text-primary",
    minimal_pro:
      "mb-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground",
    executive:
      "mb-2 font-serif text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90",
  }[template];

  const bodyText = {
    modern: "text-[0.92rem] leading-relaxed text-foreground/95",
    minimal_pro: "text-[0.88rem] leading-snug text-foreground/90",
    executive: "text-[0.95rem] leading-relaxed text-[#ebe6df]/95",
  }[template];

  return (
    <article
      data-template={template}
      className={`relative mx-auto max-w-[720px] rounded-sm text-left ${shell}`}
    >
      <header className="border-b border-white/10 pb-5">
        <h1 className={titleStyle}>{name}</h1>
        <p className={subStyle}>{resume.title}</p>
        {contactBits.length > 0 ? (
          <p className={`mt-3 text-sm text-muted-foreground ${template === "executive" ? "text-amber-100/75" : ""}`}>
            {contactBits.join(" · ")}
          </p>
        ) : null}
        {links.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {links.map((l) => (
              <span key={l.href} className="text-primary/90">
                {l.label}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {resume.summary?.body ? (
        <section className="mt-6">
          <h2 className={sectionLabel}>Summary</h2>
          <p className={`whitespace-pre-wrap ${bodyText}`}>{resume.summary.body}</p>
        </section>
      ) : null}

      {resume.experiences?.length ? (
        <section className="mt-6 space-y-5">
          <h2 className={sectionLabel}>Experience</h2>
          <ul className="space-y-5">
            {resume.experiences.map((ex) => (
              <li key={ex.id ?? `${ex.company}-${ex.start_date}`}>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{ex.job_title}</p>
                    <p className={`text-sm ${template === "executive" ? "text-amber-100/80" : "text-muted-foreground"}`}>
                      {ex.company}
                      {ex.location ? ` · ${ex.location}` : ""}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-xs tabular-nums ${template === "minimal_pro" ? "uppercase tracking-wide text-muted-foreground" : "text-muted-foreground"}`}
                  >
                    {formatRange(ex.start_date, ex.end_date, ex.is_current)}
                  </p>
                </div>
                {ex.bullets?.length ? (
                  <ul className={`mt-2 list-outside space-y-1 pl-4 ${bodyText} ${template === "minimal_pro" ? "list-[square]" : "list-disc"}`}>
                    {ex.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {resume.educations?.length ? (
        <section className="mt-6 space-y-3">
          <h2 className={sectionLabel}>Education</h2>
          <ul className="space-y-3">
            {resume.educations.map((ed) => (
              <li key={ed.id ?? `${ed.institution}-${ed.start_date}`}>
                <p className="font-medium text-foreground">{ed.institution}</p>
                <p className={`text-sm ${template === "executive" ? "text-amber-100/75" : "text-muted-foreground"}`}>
                  {ed.degree}
                  {ed.field_of_study ? `, ${ed.field_of_study}` : ""}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatRange(ed.start_date, ed.end_date, false)}
                  {ed.gpa ? ` · GPA ${ed.gpa}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {resume.skills?.length ? (
        <section className="mt-6">
          <h2 className={sectionLabel}>Skills</h2>
          <div className="space-y-2">
            {resume.skills.map((s) => (
              <div key={s.id ?? s.category}>
                <p className="text-sm font-medium text-foreground">{s.category}</p>
                <p className={`text-sm ${bodyText}`}>{s.items?.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
