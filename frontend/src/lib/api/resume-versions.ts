import { api } from "@/lib/api/client";
import type {
  ResumeVersion,
  ResumeVersionListResponse,
  ResumeVersionUpdate,
  TailorResumeRequest,
  TailorResumeResponse,
} from "@/lib/types/resume-version";

export function listVersions(resumeId: string, params: { offset?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.limit != null) qs.set("limit", String(params.limit));
  const q = qs.toString();
  const url = q
    ? `/resumes/${resumeId}/versions?${q}`
    : `/resumes/${resumeId}/versions`;
  return api.get<ResumeVersionListResponse>(url);
}

export function getVersion(resumeId: string, versionId: string) {
  return api.get<ResumeVersion>(`/resumes/${resumeId}/versions/${versionId}`);
}

export function snapshotVersion(resumeId: string, label = "Snapshot") {
  const qs = new URLSearchParams({ label });
  return api.post<ResumeVersion>(`/resumes/${resumeId}/versions/snapshot?${qs}`);
}

export function renameVersion(resumeId: string, versionId: string, body: ResumeVersionUpdate) {
  return api.patch<ResumeVersion>(`/resumes/${resumeId}/versions/${versionId}`, body);
}

export function duplicateVersion(resumeId: string, versionId: string, label?: string) {
  const qs = label ? `?label=${encodeURIComponent(label)}` : "";
  return api.post<ResumeVersion>(`/resumes/${resumeId}/versions/${versionId}/duplicate${qs}`);
}

export function deleteVersion(resumeId: string, versionId: string) {
  return api.delete<{ message: string }>(`/resumes/${resumeId}/versions/${versionId}`);
}

export function tailorResume(resumeId: string, body: TailorResumeRequest) {
  return api.post<TailorResumeResponse>(`/resumes/${resumeId}/tailor`, body);
}
