import { APP_ROUTES } from "@/lib/auth/routes";
import { DEFAULT_PAGE_ARCHETYPE, type PageArchetype } from "@/lib/layout/page-archetype";

export type PageWidth = "narrow" | "standard" | "wide";

export type AppPageMeta = {
  title: string;
  description?: string;
  width?: PageWidth;
  /** Layout + density contract for `<main>` — see `page-archetype.ts`. */
  archetype?: PageArchetype;
};

const staticMeta: Record<string, AppPageMeta> = {
  [APP_ROUTES.dashboard]: {
    title: "Dashboard",
    description: "Workspace overview",
    width: "standard",
    archetype: "workspace",
  },
  [APP_ROUTES.resumeNew]: {
    title: "New resume",
    description: "Guided builder",
    width: "narrow",
    archetype: "builder",
  },
  [APP_ROUTES.billing]: {
    title: "Billing",
    description: "Payments & exports",
    width: "standard",
    archetype: "workspace",
  },
  [APP_ROUTES.settings]: {
    title: "Settings",
    description: "Profile & preferences",
    width: "standard",
    archetype: "workspace",
  },
  [APP_ROUTES.coverLetters]: {
    title: "Cover letters",
    description: "Tailored outreach",
    width: "standard",
    archetype: "workspace",
  },
  [APP_ROUTES.coverLetterNew]: {
    title: "New cover letter",
    description: "Generate from resume",
    width: "narrow",
    archetype: "builder",
  },
  [APP_ROUTES.jobs]: {
    title: "Job tracker",
    description: "Application pipeline",
    width: "standard",
    archetype: "workspace",
  },
};

export function getAppPageMeta(pathname: string): AppPageMeta {
  if (staticMeta[pathname]) {
    return staticMeta[pathname];
  }
  const resumeEdit = /^\/resumes\/([^/]+)\/edit$/.exec(pathname);
  if (resumeEdit) {
    return {
      title: "Edit resume",
      description: `ID ${resumeEdit[1].slice(0, 8)}…`,
      width: "standard",
      archetype: "builder",
    };
  }
  const resumePreview = /^\/resumes\/([^/]+)\/preview$/.exec(pathname);
  if (resumePreview) {
    return {
      title: "Preview",
      description: "Document studio",
      width: "wide",
      archetype: "studio",
    };
  }
  const resumeTailor = /^\/resumes\/([^/]+)\/tailor$/.exec(pathname);
  if (resumeTailor) {
    return {
      title: "Tailor",
      description: "Role alignment",
      width: "standard",
      archetype: "builder",
    };
  }
  const resumeVersions = /^\/resumes\/([^/]+)\/versions$/.exec(pathname);
  if (resumeVersions) {
    return {
      title: "Versions",
      description: "Version history",
      width: "standard",
      archetype: "workspace",
    };
  }
  const coverLetterDetail = /^\/cover-letters\/([^/]+)$/.exec(pathname);
  if (coverLetterDetail) {
    return {
      title: "Cover letter",
      description: "Draft editor",
      width: "narrow",
      archetype: "builder",
    };
  }
  return { title: "ResumeForge AI", width: "standard", archetype: DEFAULT_PAGE_ARCHETYPE };
}

export const PAGE_WIDTH_CLASSES: Record<PageWidth, string> = {
  narrow: "max-w-4xl",
  standard: "max-w-[1120px]",
  wide: "max-w-7xl",
};
