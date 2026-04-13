"use client";

import { useState } from "react";
import { Briefcase, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/components/ui/page-section";
import { useCreateJob, useDeleteJob, useJobList, useUpdateJob } from "@/hooks/use-jobs";
import {
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  type JobApplication,
  type JobStatus,
} from "@/lib/types/job-application";

const ALL_STATUSES: JobStatus[] = ["applied", "interview", "offer", "rejected"];

function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${JOB_STATUS_COLORS[status]}`}>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

function AddJobForm({ onDone }: { onDone: () => void }) {
  const create = useCreateJob();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<JobStatus>("applied");
  const [appliedDate, setAppliedDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    try {
      await create.mutateAsync({
        company: company.trim(),
        role: role.trim(),
        status,
        applied_date: appliedDate || null,
      });
      toast.success("Job added.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add job.");
    }
  }

  return (
    <Card className="glass-panel">
      <CardContent className="pt-5">
        <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="job-company">Company</Label>
            <Input
              id="job-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-role">Role</Label>
            <Input
              id="job-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Software Engineer"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-status">Status</Label>
            <select
              id="job-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOB_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-date">Applied date</Label>
            <Input
              id="job-date"
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Add application
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function JobRow({ job }: { job: JobApplication }) {
  const update = useUpdateJob();
  const del = useDeleteJob();

  async function handleStatusChange(newStatus: JobStatus) {
    try {
      await update.mutateAsync({ id: job.id, body: { status: newStatus } });
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function handleDelete() {
    if (!globalThis.window.confirm("Remove this application?")) return;
    try {
      await del.mutateAsync(job.id);
      toast.success("Removed.");
    } catch {
      toast.error("Delete failed.");
    }
  }

  return (
    <Card className="glass-panel">
      <CardContent className="flex flex-wrap items-center gap-4 py-4">
        <div className="flex-1 space-y-0.5">
          <p className="font-medium leading-snug">{job.company}</p>
          <p className="text-sm text-muted-foreground">{job.role}</p>
        </div>

        <select
          value={job.status}
          onChange={(e) => void handleStatusChange(e.target.value as JobStatus)}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          disabled={update.isPending}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {JOB_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <StatusBadge status={job.status} />

        {job.applied_date && (
          <span className="text-xs text-muted-foreground">{job.applied_date}</span>
        )}

        <Button
          variant="ghost"
          size="sm"
          aria-label="Remove"
          className="text-destructive hover:text-destructive"
          onClick={() => void handleDelete()}
          disabled={del.isPending}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function JobTracker() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);
  const { data, isLoading } = useJobList(statusFilter);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <PageSection
      eyebrow="Tracker"
      title="Job applications"
      description={`${total} application${total === 1 ? "" : "s"}`}
      action={
        <Button onClick={() => setShowAdd((v) => !v)}>
          <Plus className="mr-2 size-4" />
          Add application
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              statusFilter === undefined
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {JOB_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {showAdd && <AddJobForm onDone={() => setShowAdd(false)} />}

        {isLoading && (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description='Track every job you apply to. Click "Add application" to get started.'
          >
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="mr-2 size-4" />
              Add application
            </Button>
          </EmptyState>
        )}

        {!isLoading && items.length > 0 && (
          <div className="space-y-2">
            {items.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </PageSection>
  );
}
