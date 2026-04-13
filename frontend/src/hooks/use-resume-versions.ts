"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/lib/api/resume-versions";
import { queryKeys } from "@/lib/api/query-keys";
import type { ResumeVersionUpdate, TailorResumeRequest } from "@/lib/types/resume-version";

export function useVersionList(resumeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.versions.list(resumeId ?? ""),
    queryFn: () => api.listVersions(resumeId!),
    enabled: Boolean(resumeId),
  });
}

export function useVersion(resumeId: string | undefined, versionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.versions.detail(resumeId ?? "", versionId ?? ""),
    queryFn: () => api.getVersion(resumeId!, versionId!),
    enabled: Boolean(resumeId) && Boolean(versionId),
  });
}

export function useSnapshotVersion(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label?: string) => api.snapshotVersion(resumeId, label),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.versions.list(resumeId) });
    },
  });
}

export function useRenameVersion(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ versionId, body }: { versionId: string; body: ResumeVersionUpdate }) =>
      api.renameVersion(resumeId, versionId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.versions.list(resumeId) });
    },
  });
}

export function useDuplicateVersion(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ versionId, label }: { versionId: string; label?: string }) =>
      api.duplicateVersion(resumeId, versionId, label),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.versions.list(resumeId) });
    },
  });
}

export function useDeleteVersion(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => api.deleteVersion(resumeId, versionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.versions.list(resumeId) });
    },
  });
}

export function useTailorResume(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TailorResumeRequest) => api.tailorResume(resumeId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.versions.list(resumeId) });
    },
  });
}
