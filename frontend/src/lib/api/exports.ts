import { api } from "@/lib/api/client";
import type { ResumeExportMode } from "@/lib/resume/constants";
import type { ExportHistoryItem, PdfExportMetadata } from "@/lib/types/billing";

export async function listExportHistory(params?: { offset?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.offset != null) search.set("offset", String(params.offset));
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return api.get<ExportHistoryItem[]>(`/exports/history${q ? `?${q}` : ""}`);
}

export async function getLatestExportMetadata(resumeId: string) {
  return api.get<PdfExportMetadata>(`/exports/${resumeId}`);
}

export async function generateResumePdf(
  resumeId: string,
  body?: { template_key?: string | null; export_mode?: ResumeExportMode | null },
) {
  return api.post<PdfExportMetadata>(`/exports/${resumeId}/generate-pdf`, body ?? {});
}
