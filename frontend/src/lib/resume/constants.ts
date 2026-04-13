export const DEFAULT_RESUME_TEMPLATE = "modern_professional" as const;
export const DEFAULT_EXPORT_MODE = "designed" as const;

export const RESUME_TEMPLATE_IDS = [
  "ats_classic",
  "compact_ats",
  "modern_professional",
  "corporate_minimal",
  "crisp_tech",
  "graduate_starter",
  "executive_serif",
  "elegant_executive",
  "creative_clean",
] as const;

export const EXPORT_MODE_IDS = ["ats", "designed"] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];
export type ResumeExportMode = (typeof EXPORT_MODE_IDS)[number];

const TEMPLATE_ALIASES: Record<string, ResumeTemplateId> = {
  modern: "modern_professional",
  default: "modern_professional",
  modern_sidebar: "modern_professional",
  minimal: "ats_classic",
  minimal_pro: "ats_classic",
  executive: "executive_serif",
  compact: "compact_ats",
  corporate: "corporate_minimal",
  tech: "crisp_tech",
  graduate: "graduate_starter",
  elegant: "elegant_executive",
};

/** Tab / filter order for template browsing (subset may be empty if catalog changes). */
export const RESUME_TEMPLATE_FAMILY_ORDER = [
  "ATS",
  "Professional",
  "Early Career",
  "Leadership",
  "Creative",
] as const;

export const RESUME_TEMPLATE_LIBRARY: Array<{
  value: ResumeTemplateId;
  label: string;
  description: string;
  bestFor: string;
  tone: string;
  family: string;
  atsSafe: boolean;
}> = [
    {
      value: "ats_classic",
      label: "ATS Classic",
      description: "Single-column, restrained, and optimized for application portals.",
      bestFor: "High-volume applications and ATS uploads",
      tone: "Most parsing-safe",
      family: "ATS",
      atsSafe: true,
    },
    {
      value: "compact_ats",
      label: "Compact ATS",
      description: "Dense one-column layout with tighter spacing for experienced candidates with more detail.",
      bestFor: "ATS uploads when you need more content on one page",
      tone: "Efficient and structured",
      family: "ATS",
      atsSafe: true,
    },
    {
      value: "modern_professional",
      label: "Modern Professional",
      description: "Clean hierarchy, balanced spacing, and recruiter-safe polish.",
      bestFor: "Most business, product, and operations roles",
      tone: "Balanced and versatile",
      family: "Professional",
      atsSafe: false,
    },
    {
      value: "corporate_minimal",
      label: "Corporate Minimal",
      description: "Understated, polished, and calm with formal spacing and low-ego presentation.",
      bestFor: "Consulting, finance, legal-adjacent, and enterprise roles",
      tone: "Quiet and polished",
      family: "Professional",
      atsSafe: false,
    },
    {
      value: "crisp_tech",
      label: "Crisp Tech",
      description: "Sharper information density with cleaner metadata alignment for technical roles.",
      bestFor: "Engineering, data, analytics, and technical product hiring",
      tone: "Precise and modern",
      family: "Professional",
      atsSafe: false,
    },
    {
      value: "graduate_starter",
      label: "Graduate Starter",
      description: "Early-career friendly structure that gives education and foundational strengths more support.",
      bestFor: "Internships, new grads, and early-career transitions",
      tone: "Guided and credible",
      family: "Early Career",
      atsSafe: false,
    },
    {
      value: "executive_serif",
      label: "Executive Serif",
      description: "Formal serif presentation with high-trust, boardroom-ready tone.",
      bestFor: "Leadership, strategy, and senior-level hiring",
      tone: "Elegant and authoritative",
      family: "Leadership",
      atsSafe: false,
    },
    {
      value: "elegant_executive",
      label: "Elegant Executive",
      description: "Refined formal layout with stronger metadata structure and premium senior-level calm.",
      bestFor: "C-suite, VP, GM, and high-trust leadership applications",
      tone: "Premium and deliberate",
      family: "Leadership",
      atsSafe: false,
    },
    {
      value: "creative_clean",
      label: "Creative Clean",
      description: "More expressive hierarchy with a clean, readable professional finish.",
      bestFor: "Startup, marketing, and design-adjacent roles",
      tone: "Distinct without clutter",
      family: "Creative",
      atsSafe: false,
    },
  ];

export const RESUME_TEMPLATE_OPTIONS: ReadonlyArray<{ value: ResumeTemplateId; label: string }> =
  RESUME_TEMPLATE_LIBRARY.map(({ value, label }) => ({
    value,
    label,
  }));

export const EXPORT_MODE_OPTIONS: Array<{
  value: ResumeExportMode;
  label: string;
  description: string;
  bestFor: string;
}> = [
    {
      value: "ats",
      label: "ATS Export",
      description: "Plain white paper, standard headings, and the safest single-column structure.",
      bestFor: "Best for application portals, parser-heavy systems, and strict uploads.",
    },
    {
      value: "designed",
      label: "Designed Export",
      description: "Professional white paper with refined hierarchy, spacing, and stronger visual credibility.",
      bestFor: "Best for recruiter sharing, referrals, and direct PDF sending.",
    },
  ];

export function normalizeResumeTemplateKey(key: string | undefined | null): ResumeTemplateId {
  const raw = key?.trim().toLowerCase();
  if (!raw) return DEFAULT_RESUME_TEMPLATE;
  if ((RESUME_TEMPLATE_IDS as readonly string[]).includes(raw)) {
    return raw as ResumeTemplateId;
  }
  return TEMPLATE_ALIASES[raw] ?? DEFAULT_RESUME_TEMPLATE;
}

export function normalizeResumeExportMode(mode: string | undefined | null): ResumeExportMode {
  if (mode && (EXPORT_MODE_IDS as readonly string[]).includes(mode)) {
    return mode as ResumeExportMode;
  }
  return DEFAULT_EXPORT_MODE;
}

export function resolvePreviewTemplate(
  templateKey: string | undefined | null,
  exportMode: ResumeExportMode,
): ResumeTemplateId {
  if (exportMode === "ats") return "ats_classic";
  return normalizeResumeTemplateKey(templateKey);
}

export function getResumeTemplateMeta(template: string | undefined | null) {
  const value = normalizeResumeTemplateKey(template);
  return RESUME_TEMPLATE_LIBRARY.find((item) => item.value === value)!;
}
