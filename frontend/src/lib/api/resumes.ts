import { api } from "@/lib/api/client";
import type { ResumeListResponse, ResumeRead } from "@/lib/types/resume";

export async function listResumes(params?: { offset?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.offset != null) search.set("offset", String(params.offset));
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return api.get<ResumeListResponse>(`/resumes${q ? `?${q}` : ""}`);
}

export async function getResume(id: string) {
  return api.get<ResumeRead>(`/resumes/${id}`);
}

export async function createResume(body: unknown) {
  return api.post<ResumeRead>("/resumes", body);
}

export async function updateResumeFull(id: string, body: unknown) {
  return api.put<ResumeRead>(`/resumes/${id}`, body);
}

export async function patchResume(id: string, body: unknown) {
  return api.patch<ResumeRead>(`/resumes/${id}`, body);
}

export async function deleteResume(id: string) {
  return api.delete<{ message: string }>(`/resumes/${id}`);
}
