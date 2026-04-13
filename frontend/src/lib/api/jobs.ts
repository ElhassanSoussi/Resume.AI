import { api } from "@/lib/api/client";
import type {
  JobApplication,
  JobApplicationCreate,
  JobApplicationListResponse,
  JobApplicationUpdate,
  JobStatus,
} from "@/lib/types/job-application";

export function listJobs(params: { status?: JobStatus; offset?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.limit != null) qs.set("limit", String(params.limit));
  const q = qs.toString();
  const url = q ? `/jobs/?${q}` : "/jobs/";
  return api.get<JobApplicationListResponse>(url);
}

export function getJob(id: string) {
  return api.get<JobApplication>(`/jobs/${id}`);
}

export function createJob(body: JobApplicationCreate) {
  return api.post<JobApplication>("/jobs/", body);
}

export function updateJob(id: string, body: JobApplicationUpdate) {
  return api.patch<JobApplication>(`/jobs/${id}`, body);
}

export function deleteJob(id: string) {
  return api.delete<{ message: string }>(`/jobs/${id}`);
}
