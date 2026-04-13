"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as exportApi from "@/lib/api/exports";
import * as paymentApi from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { ResumeExportMode } from "@/lib/resume/constants";
import type { CreateCheckoutSessionRequest } from "@/lib/types/billing";

export const PRODUCT_SINGLE_PDF_EXPORT = "single_pdf_export";

export function useResumePaymentStatus(resumeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.resumeStatus(resumeId ?? ""),
    queryFn: () => paymentApi.getResumePaymentStatus(resumeId!),
    enabled: Boolean(resumeId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useLatestExportMetadata(resumeId: string | undefined, options: { enabled: boolean }) {
  return useQuery({
    queryKey: queryKeys.exports.latest(resumeId ?? ""),
    queryFn: async () => {
      try {
        return await exportApi.getLatestExportMetadata(resumeId!);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    enabled: Boolean(resumeId) && options.enabled,
    staleTime: 60_000,
  });
}

export function useCreateCheckoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCheckoutSessionRequest) => paymentApi.createCheckoutSession(body),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: queryKeys.payments.all });
      window.location.href = data.checkout_url;
    },
  });
}

export function useGeneratePdf(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: { template_key?: string | null; export_mode?: ResumeExportMode | null }) =>
      exportApi.generateResumePdf(resumeId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.exports.all });
      void qc.invalidateQueries({ queryKey: queryKeys.exports.latest(resumeId) });
    },
  });
}

export function usePaymentList(offset = 0, limit = 50) {
  return useQuery({
    queryKey: queryKeys.payments.list(offset, limit),
    queryFn: () => paymentApi.listPayments({ offset, limit }),
  });
}

export function useExportHistory(offset = 0, limit = 50) {
  return useQuery({
    queryKey: queryKeys.exports.history(offset, limit),
    queryFn: () => exportApi.listExportHistory({ offset, limit }),
  });
}
