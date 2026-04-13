"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/lib/api/jobs";
import { queryKeys } from "@/lib/api/query-keys";
import type { JobApplicationCreate, JobApplicationUpdate, JobStatus } from "@/lib/types/job-application";

export function useJobList(status?: JobStatus) {
  return useQuery({
    queryKey: queryKeys.jobs.list(status),
    queryFn: () => api.listJobs({ status }),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JobApplicationCreate) => api.createJob(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: JobApplicationUpdate }) =>
      api.updateJob(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteJob(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}
