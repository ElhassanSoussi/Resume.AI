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
};
