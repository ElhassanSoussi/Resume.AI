"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import * as resumeApi from "@/lib/api/resumes";

export function useResumeList(offset = 0, limit = 50) {
  return useQuery({
    queryKey: queryKeys.resumes.list(offset, limit),
    queryFn: () => resumeApi.listResumes({ offset, limit }),
  });
}

export function useResume(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resumes.detail(id ?? ""),
    queryFn: () => resumeApi.getResume(id!),
    enabled: Boolean(id),
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => resumeApi.createResume(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}

export function useUpdateResumeFull(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => resumeApi.updateResumeFull(id, body),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: queryKeys.resumes.all });
      void qc.setQueryData(queryKeys.resumes.detail(id), data);
    },
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}
