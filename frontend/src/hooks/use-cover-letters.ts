"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/lib/api/cover-letters";
import { queryKeys } from "@/lib/api/query-keys";
import type { CoverLetterCreate, CoverLetterUpdate, GenerateCoverLetterRequest } from "@/lib/types/cover-letter";

export function useCoverLetterList(offset = 0, limit = 50) {
  return useQuery({
    queryKey: queryKeys.coverLetters.list(offset, limit),
    queryFn: () => api.listCoverLetters({ offset, limit }),
  });
}

export function useCoverLetter(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.coverLetters.detail(id ?? ""),
    queryFn: () => api.getCoverLetter(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CoverLetterCreate) => api.createCoverLetter(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.coverLetters.all });
    },
  });
}

export function useUpdateCoverLetter(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CoverLetterUpdate) => api.updateCoverLetter(id, body),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: queryKeys.coverLetters.all });
      void qc.setQueryData(queryKeys.coverLetters.detail(id), data);
    },
  });
}

export function useDeleteCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCoverLetter(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.coverLetters.all });
    },
  });
}

export function useGenerateCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerateCoverLetterRequest) => api.generateCoverLetter(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.coverLetters.all });
    },
  });
}
