/** Aligns with FastAPI `Resume.template_key` + PDF export aliases. */
export const RESUME_TEMPLATE_OPTIONS = [
  { value: "modern", label: "Modern" },
  { value: "modern_sidebar", label: "Modern Sidebar" },
  { value: "minimal_pro", label: "Minimal Pro" },
  { value: "executive", label: "Executive" },
] as const;

/** Three curated layouts for preview + editor template picker. */
export const PREVIEW_TEMPLATE_IDS = ["modern", "minimal_pro", "executive"] as const;
export type PreviewTemplateId = (typeof PREVIEW_TEMPLATE_IDS)[number];

export const PREVIEW_TEMPLATES: {
  value: PreviewTemplateId;
  label: string;
  description: string;
}[] = [
    {
      value: "modern",
      label: "Modern",
      description: "Spacious sans-serif, crisp hierarchy, subtle accent rail.",
    },
    {
      value: "minimal_pro",
      label: "Minimal Pro",
      description: "Editorial density, uppercase section cues, refined margins.",
    },
    {
      value: "executive",
      label: "Executive",
      description: "Serif headline, boardroom palette, classic résumé presence.",
    },
  ];

export function normalizePreviewTemplateKey(key: string | undefined | null): PreviewTemplateId {
  if (key && (PREVIEW_TEMPLATE_IDS as readonly string[]).includes(key)) {
    return key as PreviewTemplateId;
  }
  return "modern";
}
