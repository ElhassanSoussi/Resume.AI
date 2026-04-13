export const queryKeys = {
  resumes: {
    all: ["resumes"] as const,
    list: (offset: number, limit: number) =>
      [...queryKeys.resumes.all, "list", offset, limit] as const,
    detail: (id: string) => [...queryKeys.resumes.all, "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (offset: number, limit: number) =>
      [...queryKeys.payments.all, "list", offset, limit] as const,
    resumeStatus: (resumeId: string) =>
      [...queryKeys.payments.all, "status", resumeId] as const,
  },
  exports: {
    all: ["exports"] as const,
    history: (offset: number, limit: number) =>
      [...queryKeys.exports.all, "history", offset, limit] as const,
    latest: (resumeId: string) => [...queryKeys.exports.all, "latest", resumeId] as const,
  },
  coverLetters: {
    all: ["cover-letters"] as const,
    list: (offset: number, limit: number) =>
      [...queryKeys.coverLetters.all, "list", offset, limit] as const,
    detail: (id: string) => [...queryKeys.coverLetters.all, "detail", id] as const,
  },
  versions: {
    all: ["versions"] as const,
    list: (resumeId: string) => [...queryKeys.versions.all, "list", resumeId] as const,
    detail: (resumeId: string, versionId: string) =>
      [...queryKeys.versions.all, "detail", resumeId, versionId] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    list: (status?: string) => [...queryKeys.jobs.all, "list", status ?? "all"] as const,
    detail: (id: string) => [...queryKeys.jobs.all, "detail", id] as const,
  },
};
