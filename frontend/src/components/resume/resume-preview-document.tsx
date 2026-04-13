import { useId } from "react";

import type { ResumeExportMode, ResumeTemplateId } from "@/lib/resume/constants";
import type { ResumeRead } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

function formatRange(start: string, end: string | null, isCurrent: boolean): string {
  const fmt = (iso: string) => {
    try {
      const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
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

function formatLinkDisplay(raw: string): string {
  try {
    const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
    const url = new URL(withScheme);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`.replace(/\/$/, "");
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

function normalizeLink(raw: string): string {
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

type HeaderLayout = "stacked" | "split" | "centered";

type TemplateTheme = {
  pageWidth: number;
  pageMinHeight: number;
  pagePaddingClass: string;
  pageClass: string;
  fontFamily: string;
  headingFontFamily?: string;
  headerLayout: HeaderLayout;
  headerClass: string;
  headerInnerClass?: string;
  accentClass?: string;
  sectionTitleClass: string;
  bodyTextClass: string;
  mutedTextClass: string;
  nameClass: string;
  roleClass: string;
  titleClass: string;
  metaClass: string;
  dateClass: string;
  bulletClass: string;
  footerBorderClass: string;
  footerTextClass: string;
  summaryTitle: string;
  experienceTitle: string;
  skillsTitle: string;
  educationTitle: string;
  educationBeforeExperience?: boolean;
  useTwoColumnFooter?: boolean;
  contactRight?: boolean;
  linksCentered?: boolean;
  skillsAsPills?: boolean;
  skillsJoiner?: string;
};

const TEMPLATE_THEMES: Record<ResumeTemplateId, TemplateTheme> = {
  ats_classic: {
    pageWidth: 736,
    pageMinHeight: 1040,
    pagePaddingClass: "px-9 py-10 sm:px-11 sm:py-11",
    pageClass: "bg-white text-[#111111]",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerLayout: "stacked",
    headerClass: "border-b border-[#d9dde3] pb-6",
    sectionTitleClass: "border-b border-[#111827] pb-1 text-[0.69rem] font-semibold uppercase tracking-[0.24em] text-[#111827]",
    bodyTextClass: "text-[0.94rem] leading-7 text-[#222222]",
    mutedTextClass: "text-[#4b5563]",
    nameClass: "text-[1.95rem] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[2.15rem]",
    roleClass: "mt-2 text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-[#374151]",
    titleClass: "text-[0.98rem] font-semibold text-[#111111]",
    metaClass: "mt-1 text-[0.9rem] text-[#4b5563]",
    dateClass: "shrink-0 text-[0.82rem] font-semibold tabular-nums text-[#4b5563]",
    bulletClass: "mt-3 list-disc space-y-1.5 pl-5 text-[0.92rem] leading-6 text-[#1f2937]",
    footerBorderClass: "border-[#e5e7eb]",
    footerTextClass: "text-[#6b7280]",
    summaryTitle: "Summary",
    experienceTitle: "Experience",
    skillsTitle: "Skills",
    educationTitle: "Education",
    skillsJoiner: ", ",
  },
  compact_ats: {
    pageWidth: 712,
    pageMinHeight: 1008,
    pagePaddingClass: "px-8 py-9 sm:px-10 sm:py-10",
    pageClass: "bg-white text-[#121212]",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerLayout: "split",
    headerClass: "border-b border-[#d7dce2] pb-5",
    headerInnerClass: "grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]",
    sectionTitleClass: "border-b border-[#111827] pb-1 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-[#111827]",
    bodyTextClass: "text-[0.88rem] leading-6 text-[#222222]",
    mutedTextClass: "text-[#4b5563]",
    nameClass: "text-[1.78rem] font-semibold tracking-[-0.025em] text-[#111111] sm:text-[1.95rem]",
    roleClass: "mt-1.5 text-[0.76rem] font-semibold uppercase tracking-[0.2em] text-[#374151]",
    titleClass: "text-[0.92rem] font-semibold text-[#111111]",
    metaClass: "mt-1 text-[0.82rem] text-[#4b5563]",
    dateClass: "shrink-0 text-[0.76rem] font-semibold tabular-nums text-[#4b5563]",
    bulletClass: "mt-2.5 list-disc space-y-1 pl-[1.125rem] text-[0.86rem] leading-[1.35rem] text-[#1f2937]",
    footerBorderClass: "border-[#e5e7eb]",
    footerTextClass: "text-[#6b7280]",
    summaryTitle: "Summary",
    experienceTitle: "Experience",
    skillsTitle: "Skills",
    educationTitle: "Education",
    contactRight: true,
    skillsJoiner: ", ",
  },
  modern_professional: {
    pageWidth: 744,
    pageMinHeight: 1040,
    pagePaddingClass: "px-9 py-10 sm:px-12 sm:py-12",
    pageClass: "bg-white text-[#18222f]",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerLayout: "split",
    headerClass: "border-b border-[#d7dce4] pb-7",
    headerInnerClass: "grid gap-5 sm:grid-cols-[minmax(0,1fr)_240px]",
    accentClass: "mb-5 h-1.5 w-20 rounded-full bg-[#1f4d8f]",
    sectionTitleClass: "border-b border-[#c7d5ea] pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#1f4d8f]",
    bodyTextClass: "text-[0.95rem] leading-7 text-[#27303a]",
    mutedTextClass: "text-[#556274]",
    nameClass: "text-[2.18rem] font-semibold tracking-[-0.04em] text-[#122033] sm:text-[2.42rem]",
    roleClass: "mt-2 text-[0.9rem] font-medium uppercase tracking-[0.18em] text-[#3562a8]",
    titleClass: "text-[1rem] font-semibold text-[#102033]",
    metaClass: "mt-1 text-[0.92rem] text-[#556274]",
    dateClass: "shrink-0 text-[0.84rem] font-medium tabular-nums text-[#556274]",
    bulletClass: "mt-3 list-disc space-y-2 pl-5 text-[0.93rem] leading-6.5 text-[#222b36]",
    footerBorderClass: "border-[#d7dce4]",
    footerTextClass: "text-[#6b7280]",
    summaryTitle: "Summary",
    experienceTitle: "Experience",
    skillsTitle: "Core Skills",
    educationTitle: "Education",
    contactRight: true,
    skillsJoiner: " • ",
  },
  corporate_minimal: {
    pageWidth: 738,
    pageMinHeight: 1040,
    pagePaddingClass: "px-9 py-10 sm:px-12 sm:py-12",
    pageClass: "bg-white text-[#1d2430]",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerLayout: "split",
    headerClass: "border-b border-[#d9dee7] pb-6",
    headerInnerClass: "grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]",
    sectionTitleClass: "border-b border-[#d9dee7] pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#273649]",
    bodyTextClass: "text-[0.94rem] leading-7 text-[#324152]",
    mutedTextClass: "text-[#5c6779]",
    nameClass: "text-[2.08rem] font-semibold tracking-[-0.03em] text-[#111827] sm:text-[2.28rem]",
    roleClass: "mt-2 text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-[#425166]",
    titleClass: "text-[0.98rem] font-semibold text-[#111827]",
    metaClass: "mt-1 text-[0.9rem] text-[#5c6779]",
    dateClass: "shrink-0 text-[0.82rem] font-semibold tabular-nums text-[#4b5563]",
    bulletClass: "mt-3 list-disc space-y-1.5 pl-5 text-[0.92rem] leading-6.5 text-[#223142]",
    footerBorderClass: "border-[#d9dee7]",
    footerTextClass: "text-[#6b7280]",
    summaryTitle: "Professional Summary",
    experienceTitle: "Experience",
    skillsTitle: "Skills",
    educationTitle: "Education",
    contactRight: true,
    skillsJoiner: " · ",
  },
  crisp_tech: {
    pageWidth: 736,
    pageMinHeight: 1032,
    pagePaddingClass: "px-8 py-10 sm:px-11 sm:py-11",
    pageClass: "bg-white text-[#17202b]",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerLayout: "split",
    headerClass: "border-b border-[#d5dfeb] pb-6",
    headerInnerClass: "grid gap-5 sm:grid-cols-[minmax(0,1fr)_250px]",
    accentClass: "mb-4 h-1.5 w-24 rounded-full bg-[#2761a3]",
    sectionTitleClass: 'border-b border-[#d5dfeb] pb-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#2761a3] [font-family:"SFMono-Regular",Menlo,monospace]',
    bodyTextClass: "text-[0.92rem] leading-6.5 text-[#314256]",
    mutedTextClass: "text-[#5d697a]",
    nameClass: "text-[2.05rem] font-semibold tracking-[-0.04em] text-[#102033] sm:text-[2.26rem]",
    roleClass: "mt-2 text-[0.82rem] font-semibold uppercase tracking-[0.2em] text-[#2761a3]",
    titleClass: "text-[0.98rem] font-semibold text-[#102033]",
    metaClass: "mt-1 text-[0.88rem] text-[#5d697a]",
    dateClass: 'shrink-0 text-[0.78rem] font-semibold tabular-nums text-[#4b5c74] [font-family:"SFMono-Regular",Menlo,monospace]',
    bulletClass: "mt-3 list-disc space-y-1.5 pl-5 text-[0.9rem] leading-6 text-[#223244]",
    footerBorderClass: "border-[#d5dfeb]",
    footerTextClass: "text-[#64748b]",
    summaryTitle: "Profile",
    experienceTitle: "Experience",
    skillsTitle: "Core Skills",
    educationTitle: "Education",
    contactRight: true,
    skillsAsPills: true,
    skillsJoiner: " • ",
  },
  graduate_starter: {
    pageWidth: 744,
    pageMinHeight: 1040,
    pagePaddingClass: "px-9 py-10 sm:px-12 sm:py-12",
    pageClass: "bg-white text-[#1f2a38]",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerLayout: "stacked",
    headerClass: "border-b border-[#d7dfeb] pb-6",
    accentClass: "mb-4 h-1.5 w-20 rounded-full bg-[#516f9f]",
    sectionTitleClass: "border-b border-[#d7dfeb] pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#516f9f]",
    bodyTextClass: "text-[0.95rem] leading-7 text-[#334153]",
    mutedTextClass: "text-[#617186]",
    nameClass: "text-[2.05rem] font-semibold tracking-[-0.03em] text-[#152132] sm:text-[2.28rem]",
    roleClass: "mt-2 text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-[#516f9f]",
    titleClass: "text-[0.98rem] font-semibold text-[#152132]",
    metaClass: "mt-1 text-[0.9rem] text-[#617186]",
    dateClass: "shrink-0 text-[0.82rem] font-semibold tabular-nums text-[#5a6678]",
    bulletClass: "mt-3 list-disc space-y-1.5 pl-5 text-[0.92rem] leading-6.5 text-[#243548]",
    footerBorderClass: "border-[#d7dfeb]",
    footerTextClass: "text-[#6b7280]",
    summaryTitle: "Profile",
    experienceTitle: "Experience",
    skillsTitle: "Skills",
    educationTitle: "Education",
    educationBeforeExperience: true,
    skillsJoiner: " • ",
  },
  executive_serif: {
    pageWidth: 748,
    pageMinHeight: 1046,
    pagePaddingClass: "px-9 py-10 sm:px-12 sm:py-12",
    pageClass: "bg-white text-[#2f2923]",
    fontFamily: 'Georgia, "Times New Roman", serif',
    headingFontFamily: 'Georgia, "Times New Roman", serif',
    headerLayout: "centered",
    headerClass: "border-b border-[#d8d0c5] pb-7 text-center",
    sectionTitleClass: "border-b border-[#d8d0c5] pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#5f5447]",
    bodyTextClass: "text-[0.96rem] leading-7 text-[#2d2924]",
    mutedTextClass: "text-[#6b6258]",
    nameClass: "text-[2.28rem] font-semibold tracking-[0.01em] text-[#2f261d] sm:text-[2.62rem]",
    roleClass: "mt-3 text-[0.88rem] uppercase tracking-[0.22em] text-[#7d6d5a]",
    titleClass: "text-[1rem] font-semibold text-[#2f261d]",
    metaClass: "mt-1 text-[0.9rem] text-[#6b6258]",
    dateClass: "shrink-0 text-[0.82rem] font-medium tabular-nums text-[#756655]",
    bulletClass: "mt-3 list-disc space-y-2 pl-5 text-[0.92rem] leading-6.5 text-[#312c27]",
    footerBorderClass: "border-[#d8d0c5]",
    footerTextClass: "text-[#817467]",
    summaryTitle: "Executive Summary",
    experienceTitle: "Leadership Experience",
    skillsTitle: "Skills",
    educationTitle: "Education",
    useTwoColumnFooter: true,
    linksCentered: true,
    skillsJoiner: " • ",
  },
  elegant_executive: {
    pageWidth: 744,
    pageMinHeight: 1044,
    pagePaddingClass: "px-9 py-10 sm:px-12 sm:py-12",
    pageClass: "bg-white text-[#2c2620]",
    fontFamily: 'Georgia, "Times New Roman", serif',
    headingFontFamily: 'Georgia, "Times New Roman", serif',
    headerLayout: "split",
    headerClass: "border-b border-[#d8d0c5] pb-7",
    headerInnerClass: "grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]",
    sectionTitleClass: "border-b border-[#d8d0c5] pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#6a5848]",
    bodyTextClass: "text-[0.95rem] leading-7 text-[#3d352d]",
    mutedTextClass: "text-[#6b6258]",
    nameClass: "text-[2.24rem] font-semibold tracking-[0.01em] text-[#2f261d] sm:text-[2.56rem]",
    roleClass: "mt-2 text-[0.82rem] uppercase tracking-[0.22em] text-[#8b7863]",
    titleClass: "text-[1rem] font-semibold text-[#2f261d]",
    metaClass: "mt-1 text-[0.9rem] text-[#6b6258]",
    dateClass: "shrink-0 text-[0.82rem] font-medium tabular-nums text-[#756655]",
    bulletClass: "mt-3 list-disc space-y-2 pl-5 text-[0.92rem] leading-6.5 text-[#352f29]",
    footerBorderClass: "border-[#d8d0c5]",
    footerTextClass: "text-[#817467]",
    summaryTitle: "Executive Summary",
    experienceTitle: "Leadership Experience",
    skillsTitle: "Capabilities",
    educationTitle: "Education",
    useTwoColumnFooter: true,
    contactRight: true,
    skillsJoiner: " • ",
  },
  creative_clean: {
    pageWidth: 744,
    pageMinHeight: 1040,
    pagePaddingClass: "px-9 py-10 sm:px-12 sm:py-12",
    pageClass: "bg-white text-[#17322e]",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerLayout: "split",
    headerClass: "border-b border-[#d7ddd8] pb-7",
    headerInnerClass: "grid gap-5 sm:grid-cols-[minmax(0,1fr)_240px]",
    accentClass: "mb-5 h-1.5 w-24 rounded-full bg-[#1f5b52]",
    sectionTitleClass: "border-b border-[#d7ddd8] pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#1f5b52]",
    bodyTextClass: "text-[0.95rem] leading-7 text-[#274642]",
    mutedTextClass: "text-[#567067]",
    nameClass: "text-[2.12rem] font-semibold tracking-[-0.03em] text-[#16342f] sm:text-[2.44rem]",
    roleClass: "mt-2 text-[0.9rem] font-medium uppercase tracking-[0.18em] text-[#327466]",
    titleClass: "text-[1rem] font-semibold text-[#16342f]",
    metaClass: "mt-1 text-[0.92rem] text-[#567067]",
    dateClass: "shrink-0 text-[0.84rem] font-medium tabular-nums text-[#567067]",
    bulletClass: "mt-3 list-disc space-y-2 pl-5 text-[0.93rem] leading-6.5 text-[#26443e]",
    footerBorderClass: "border-[#d7ddd8]",
    footerTextClass: "text-[#6b7280]",
    summaryTitle: "Summary",
    experienceTitle: "Experience",
    skillsTitle: "Capabilities",
    educationTitle: "Education",
    useTwoColumnFooter: true,
    contactRight: true,
    skillsJoiner: " • ",
  },
};

function renderSkills(resume: ResumeRead, theme: TemplateTheme, sectionClass = "") {
  if (!resume.skills?.length) return null;

  return (
    <section className={sectionClass}>
      <h2 className={theme.sectionTitleClass}>{theme.skillsTitle}</h2>
      {theme.skillsAsPills ? (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {resume.skills.flatMap((skill) =>
            skill.items.map((item) => (
              <span
                key={`${skill.id ?? skill.category}-${item}`}
                className="rounded-full border border-[#d5dfeb] bg-[#f9fbfd] px-3 py-1 text-[0.82rem] text-[#314256]"
              >
                {item}
              </span>
            )),
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {resume.skills.map((skill) => (
            <div key={skill.id ?? skill.category}>
              <p className="text-[0.88rem] font-semibold uppercase tracking-[0.14em] text-[#111827]">
                {skill.category}
              </p>
              <p className={`mt-1 text-[0.9rem] leading-7 ${theme.mutedTextClass}`}>
                {skill.items?.join(theme.skillsJoiner ?? " • ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function renderEducation(resume: ResumeRead, theme: TemplateTheme) {
  if (!resume.educations?.length) return null;

  return (
    <section className={theme.useTwoColumnFooter ? "" : "mt-8"}>
      <h2 className={theme.sectionTitleClass}>{theme.educationTitle}</h2>
      <ul className="mt-4 space-y-4">
        {resume.educations.map((education) => (
          <li key={education.id ?? `${education.institution}-${education.start_date}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className={theme.titleClass}>
                  {education.degree}
                  {education.field_of_study ? `, ${education.field_of_study}` : ""}
                </p>
                <p className={theme.metaClass}>
                  {education.institution}
                  {education.location ? ` · ${education.location}` : ""}
                </p>
                {education.gpa ? <p className={theme.metaClass}>GPA {education.gpa}</p> : null}
              </div>
              <p className={theme.dateClass}>
                {formatRange(education.start_date, education.end_date, false)}
              </p>
            </div>
            {education.description ? (
              <p className={`mt-2 ${theme.bodyTextClass}`}>{education.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function renderExperience(resume: ResumeRead, theme: TemplateTheme, sectionClass = "mt-8") {
  if (!resume.experiences?.length) return null;

  return (
    <section className={sectionClass}>
      <h2 className={theme.sectionTitleClass}>{theme.experienceTitle}</h2>
      <ul className="mt-5 space-y-6">
        {resume.experiences.map((experience) => (
          <li key={experience.id ?? `${experience.company}-${experience.start_date}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className={theme.titleClass}>{experience.job_title}</p>
                <p className={theme.metaClass}>
                  <span className="font-medium text-[#1f2937]">{experience.company}</span>
                  {experience.location ? ` · ${experience.location}` : ""}
                </p>
              </div>
              <p className={theme.dateClass}>
                {formatRange(experience.start_date, experience.end_date, experience.is_current)}
              </p>
            </div>
            {experience.bullets?.length ? (
              <ul className={theme.bulletClass}>
                {experience.bullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

type Props = {
  resume: ResumeRead;
  template: ResumeTemplateId;
  exportMode: ResumeExportMode;
  scale?: number;
};

export function ResumePreviewDocument({
  resume,
  template,
  exportMode,
  scale = 1,
}: Props) {
  const theme = TEMPLATE_THEMES[template];
  const personal = resume.personal_info;
  const name = personal ? `${personal.first_name} ${personal.last_name}`.trim() : "Your Name";
  const contactBits = [personal?.email, personal?.phone, personal?.location].filter(Boolean) as string[];
  const links = [
    personal?.website ? { label: "Portfolio", href: normalizeLink(personal.website) } : null,
    personal?.linkedin_url ? { label: "LinkedIn", href: normalizeLink(personal.linkedin_url) } : null,
    personal?.github_url ? { label: "GitHub", href: normalizeLink(personal.github_url) } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  const pageWidth = Math.round(theme.pageWidth * scale);
  const pageMinHeight = Math.round(theme.pageMinHeight * scale);

  const scopeId = useId().replace(/:/g, "");
  const scopedRootClass = `resume-preview-doc-${scopeId}`;
  const scopedCss = `.${scopedRootClass}{width:${pageWidth}px;min-height:${pageMinHeight}px;font-family:${JSON.stringify(theme.fontFamily)};${theme.headingFontFamily ? `--preview-heading-font:${JSON.stringify(theme.headingFontFamily)};` : ""}}`;

  const contactBlock = (
    <div className={theme.contactRight ? "space-y-2 text-sm sm:text-right" : "space-y-2 text-sm"}>
      {contactBits.length > 0 ? (
        <p className={`leading-6 ${theme.mutedTextClass}`}>{contactBits.join("  •  ")}</p>
      ) : null}
      {links.length > 0 ? (
        <div
          className={[
            "flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem]",
            theme.linksCentered
              ? `justify-center ${theme.mutedTextClass}`
              : theme.contactRight
                ? `sm:justify-end ${theme.mutedTextClass}`
                : theme.mutedTextClass,
          ].join(" ")}
        >
          {links.map((link) => (
            <span key={link.href}>
              <span className="font-medium text-[#111827]">{link.label}</span>{" "}
              {formatLinkDisplay(link.href)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <article
        className={cn(
          scopedRootClass,
          `mx-auto flex w-full flex-col rounded-[3px] shadow-[0_2px_8px_rgba(0,0,0,0.12),0_18px_48px_-16px_rgba(0,0,0,0.5)] ${theme.pageClass}`,
        )}
      >
        <div className={cn(theme.pagePaddingClass, "flex min-h-full flex-1 flex-col")}>
          <header className={theme.headerClass}>
            {theme.accentClass ? <div className={theme.accentClass} /> : null}

            {theme.headerLayout === "centered" ? (
              <div className="space-y-4 text-center">
                <div>
                  <p className={theme.roleClass}>{resume.title}</p>
                  <h1
                    className={cn(theme.nameClass, theme.headingFontFamily && "[font-family:var(--preview-heading-font)]")}
                  >
                    {name}
                  </h1>
                </div>
                {contactBlock}
              </div>
            ) : theme.headerLayout === "split" ? (
              <div className={theme.headerInnerClass}>
                <div>
                  <p className={theme.roleClass}>{resume.title}</p>
                  <h1
                    className={cn(theme.nameClass, theme.headingFontFamily && "[font-family:var(--preview-heading-font)]")}
                  >
                    {name}
                  </h1>
                </div>
                {contactBlock}
              </div>
            ) : (
              <div>
                <p className={theme.roleClass}>{resume.title}</p>
                <h1
                  className={cn(theme.nameClass, theme.headingFontFamily && "[font-family:var(--preview-heading-font)]")}
                >
                  {name}
                </h1>
                <div className="mt-3">{contactBlock}</div>
              </div>
            )}
          </header>

          {resume.summary?.body ? (
            <section className="mt-8">
              <h2 className={theme.sectionTitleClass}>{theme.summaryTitle}</h2>
              <p className={`mt-4 whitespace-pre-wrap ${theme.bodyTextClass}`}>{resume.summary.body}</p>
            </section>
          ) : null}

          {theme.educationBeforeExperience ? (
            <>
              {renderEducation(resume, theme)}
              {renderExperience(resume, theme)}
              {renderSkills(resume, theme, "mt-8")}
            </>
          ) : theme.useTwoColumnFooter ? (
            <>
              {renderExperience(resume, theme)}
              <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                {renderEducation(resume, theme)}
                {renderSkills(resume, theme)}
              </div>
            </>
          ) : (
            <>
              {renderExperience(resume, theme)}
              {renderEducation(resume, theme)}
              {renderSkills(resume, theme, "mt-8")}
            </>
          )}

          <footer className={`mt-10 border-t pt-4 text-[0.74rem] uppercase tracking-[0.18em] ${theme.footerBorderClass} ${theme.footerTextClass}`}>
            {exportMode === "ats"
              ? "ATS export preview · white paper · parser-safe structure"
              : "Designed export preview · white paper · recruiter-ready presentation"}
          </footer>
        </div>
      </article>
    </>
  );
}
