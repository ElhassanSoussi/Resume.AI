import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";
import type { ResumeExportMode } from "@/lib/resume/constants";
import { getResumeTemplateMeta, normalizeResumeTemplateKey } from "@/lib/resume/constants";

export type ReadinessItemStatus = "pass" | "warn" | "fail";

export type ReadinessCheckItem = {
  id: string;
  label: string;
  status: ReadinessItemStatus;
  detail?: string;
};

export type ReadinessCategory = {
  id: string;
  title: string;
  items: ReadinessCheckItem[];
};

export type ResumeReadinessReport = {
  categories: ReadinessCategory[];
  /** Plain-language improvements, most important first */
  nextActions: string[];
  exportHint: {
    recommendMode: ResumeExportMode;
    reason: string;
    alternateMode: ResumeExportMode;
    alternateReason: string;
  };
};

const WEAK_OPENERS = new Set([
  "responsible",
  "worked",
  "helped",
  "assisted",
  "participated",
  "supported",
]);

function cleanBullets(lines: string[]): string[] {
  return lines.map((l) => l.trim()).filter(Boolean);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Heuristic, checklist-style readiness — not a numeric “score”.
 * Intended for export confidence and editor guidance.
 */
export function analyzeResumeReadiness(values: ResumeFullUpdateFormValues): ResumeReadinessReport {
  const nextActions: string[] = [];
  const categories: ReadinessCategory[] = [];

  const pi = values.personal_info;
  const contactItems: ReadinessCheckItem[] = [
    {
      id: "c_name",
      label: "Full name",
      status: pi?.first_name?.trim() && pi?.last_name?.trim() ? "pass" : "fail",
      detail: "Both first and last name should be visible in the header.",
    },
    {
      id: "c_email",
      label: "Email",
      status: pi?.email?.trim() ? "pass" : "fail",
    },
    {
      id: "c_phone",
      label: "Phone (recommended)",
      status: pi?.phone?.trim() ? "pass" : "warn",
      detail: "Many recruiters still expect a phone line for quick contact.",
    },
  ];
  categories.push({ id: "contact", title: "Contact & header", items: contactItems });
  if (contactItems.some((i) => i.status === "fail")) {
    nextActions.push("Complete contact details in the header.");
  }

  const summaryBody = values.summary?.body?.trim() ?? "";
  const summaryItems: ReadinessCheckItem[] = [
    {
      id: "s_presence",
      label: "Summary present",
      status: summaryBody ? "pass" : "fail",
      detail: "A short positioning paragraph sets context before experience.",
    },
    {
      id: "s_depth",
      label: "Summary depth",
      status: !summaryBody ? "fail" : wordCount(summaryBody) >= 28 ? "pass" : "warn",
      detail: "Aim for roughly 2–4 sentences (about 35–90 words) unless your field expects ultra-short.",
    },
  ];
  categories.push({ id: "summary", title: "Summary", items: summaryItems });
  if (!summaryBody) nextActions.push("Add a professional summary.");
  else if (wordCount(summaryBody) < 28) nextActions.push("Expand the summary slightly so the opening feels complete.");

  const experiences = values.experiences ?? [];
  const expItems: ReadinessCheckItem[] = [
    {
      id: "e_count",
      label: "At least one role",
      status: experiences.length > 0 ? "pass" : "fail",
    },
  ];
  let shortBulletRoles = 0;
  let missingDates = 0;
  let thinBullets = 0;
  for (const ex of experiences) {
    const bullets = cleanBullets(ex.bullets ?? []);
    if (!ex.start_date?.trim() || (!ex.is_current && !String(ex.end_date ?? "").trim())) {
      missingDates += 1;
    }
    if (bullets.length < 2) shortBulletRoles += 1;
    const vague =
      bullets.length > 0 &&
      bullets.every((b) => {
        const first = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
        return wordCount(b) < 8 || WEAK_OPENERS.has(first);
      });
    if (vague) thinBullets += 1;
  }
  expItems.push({
    id: "e_dates",
    label: "Experience dates complete",
    status: experiences.length === 0 ? "fail" : missingDates === 0 ? "pass" : "warn",
    detail: missingDates ? `${missingDates} role(s) missing start or end dates.` : undefined,
  });
  expItems.push({
    id: "e_bullets",
    label: "Bullet depth",
    status: experiences.length === 0 ? "fail" : shortBulletRoles === 0 ? "pass" : "warn",
    detail: shortBulletRoles ? "Aim for at least two substantive bullets per recent role." : undefined,
  });
  expItems.push({
    id: "e_quality",
    label: "Bullet specificity",
    status: experiences.length === 0 ? "fail" : thinBullets === 0 ? "pass" : "warn",
    detail: "Lead with what you owned or delivered, not filler verbs.",
  });
  categories.push({ id: "experience", title: "Experience", items: expItems });
  if (missingDates) nextActions.push("Fill in missing employment dates.");
  if (shortBulletRoles) nextActions.push("Add depth to experience bullets (impact, scope, outcome).");
  if (thinBullets) nextActions.push("Tighten vague bullets with clearer ownership and outcomes.");

  const skills = values.skills ?? [];
  const skillLines = skills.flatMap((s) => cleanBullets(s.items ?? []));
  const skillItems: ReadinessCheckItem[] = [
    {
      id: "k_groups",
      label: "Skills section present",
      status: skills.length > 0 ? "pass" : "warn",
      detail: "Grouped skills improve scanning and keyword coverage.",
    },
    {
      id: "k_volume",
      label: "Skills coverage",
      status: skillLines.length >= 8 ? "pass" : skillLines.length >= 4 ? "warn" : skills.length ? "warn" : "fail",
      detail: "Thin skill lists can undersell tooling and domains you actually use.",
    },
  ];
  categories.push({ id: "skills", title: "Skills", items: skillItems });
  if (!skills.length) nextActions.push("Add at least one skills group with concrete tools or domains.");
  else if (skillLines.length < 8) nextActions.push("Broaden skills slightly so the section matches your roles.");

  const educations = values.educations ?? [];
  const eduItems: ReadinessCheckItem[] = [
    {
      id: "ed_deg",
      label: "Education entries",
      status:
        educations.length > 0
          ? "pass"
          : experiences.length <= 1
            ? "warn"
            : "pass",
      detail:
        educations.length === 0 && experiences.length <= 1
          ? "Early-career resumes usually show education even if brief."
          : undefined,
    },
  ];
  categories.push({ id: "education", title: "Education", items: eduItems });

  const templateMeta = getResumeTemplateMeta(normalizeResumeTemplateKey(values.template_key));
  const atsItems: ReadinessCheckItem[] = [
    {
      id: "a_headings",
      label: "Standard sections",
      status: experiences.length && (summaryBody || values.title?.trim()) ? "pass" : "warn",
      detail: "ATS parsers expect recognizable section content.",
    },
    {
      id: "a_template",
      label: "Designed template ATS note",
      status: templateMeta.atsSafe ? "pass" : "warn",
      detail: templateMeta.atsSafe
        ? "This layout family is parser-oriented."
        : "For strict parsers, use ATS Export (ATS Classic) even if your designed template looks strong.",
    },
  ];
  categories.push({ id: "ats", title: "ATS basics", items: atsItems });

  const failCount = categories.flatMap((c) => c.items).filter((i) => i.status === "fail").length;
  const warnCount = categories.flatMap((c) => c.items).filter((i) => i.status === "warn").length;

  let recommendMode: ResumeExportMode = "designed";
  let reason =
    "Designed export is appropriate when a human will read the PDF first and layout supports your story.";
  let alternateMode: ResumeExportMode = "ats";
  let alternateReason = "Switch to ATS Export before uploading to rigid application portals.";

  if (failCount > 0 || !summaryBody || !experiences.length) {
    recommendMode = "ats";
    reason =
      "Until core sections are complete, ATS Export reduces layout risk and keeps focus on plain structure.";
    alternateMode = "designed";
    alternateReason = "After you shore up summary and experience, Designed Export is better for direct sharing.";
  } else if (warnCount >= 3 || shortBulletRoles || missingDates) {
    recommendMode = "ats";
    reason =
      "With a few open gaps, ATS Export is the safer default for uploads; tighten content, then reassess.";
    alternateMode = "designed";
    alternateReason =
      "Designed export can still work for referrals once bullets and dates are solid.";
  } else if (!templateMeta.atsSafe) {
    recommendMode = "designed";
    reason =
      "Content looks complete enough for a designed recruiter pass; your template supports strong hierarchy.";
    alternateMode = "ats";
    alternateReason = "Use ATS Export for any portal known to strip or misparse styled résumés.";
  }

  return {
    categories,
    nextActions: nextActions.slice(0, 5),
    exportHint: {
      recommendMode,
      reason,
      alternateMode,
      alternateReason,
    },
  };
}
