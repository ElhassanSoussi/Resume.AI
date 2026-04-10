import { APP_ROUTES } from "@/lib/auth/routes";

export type AppPageMeta = {
  title: string;
  description?: string;
};

const staticMeta: Record<string, AppPageMeta> = {
  [APP_ROUTES.dashboard]: {
    title: "Dashboard",
    description: "Workspace overview",
  },
  [APP_ROUTES.resumeNew]: {
    title: "New resume",
    description: "Guided builder",
  },
  [APP_ROUTES.billing]: {
    title: "Billing",
    description: "Payments & PDF history",
  },
  [APP_ROUTES.settings]: {
    title: "Settings",
    description: "Profile & preferences",
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
    };
  }
  const resumePreview = /^\/resumes\/([^/]+)\/preview$/.exec(pathname);
  if (resumePreview) {
    return {
      title: "Preview",
      description: "Live layout",
    };
  }
  return { title: "ResumeForge AI" };
}
