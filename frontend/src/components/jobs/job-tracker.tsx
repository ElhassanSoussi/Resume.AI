"use client";

import { useMemo, useState } from "react";
import { Briefcase, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${JOB_STATUS_COLORS[status]}`}>
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
      toast.success("Application added to your tracker.");
      onDone();
      setCompany("");
      setRole("");
      setAppliedDate("");
      setStatus("applied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add application.");
    }
  }

  return (
    <Card className="glass-panel border-white/[0.08]">
      <CardHeader>
        <CardTitle>New application</CardTitle>
        <CardDescription>Add the basics now. You can update status and notes later.</CardDescription>
      </CardHeader>
      <CardContent>
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
              className="h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
              Not now
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save application
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
      toast.success("Application updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function handleDelete() {
    if (!globalThis.window.confirm("Remove this application?")) return;
    try {
      await del.mutateAsync(job.id);
      toast.success("Application removed.");
    } catch {
      toast.error("Delete failed.");
    }
  }

  return (
    <Card className="glass-panel-lift border-white/[0.08]">
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="font-heading text-lg font-semibold leading-snug text-foreground">{job.company}</p>
            <p className="text-sm text-muted-foreground">{job.role}</p>
            <p className="text-xs text-muted-foreground">
              {job.applied_date ? `Applied ${job.applied_date}` : "Applied date not recorded"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={job.status} />
            <select
              value={job.status}
              onChange={(e) => void handleStatusChange(e.target.value as JobStatus)}
              className="h-9 rounded-xl border border-input bg-background px-3 py-2 text-sm"
              disabled={update.isPending}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOB_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackerStat({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">{count}</p>
    </div>
  );
}

export function JobTracker() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);
  const { data, isLoading, isError, refetch } = useJobList(statusFilter);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const stats = useMemo(
    () => ({
      applied: items.filter((item) => item.status === "applied").length,
      interview: items.filter((item) => item.status === "interview").length,
      offer: items.filter((item) => item.status === "offer").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    }),
    [items],
  );

  return (
    <PageSection
      eyebrow="Tracker"
      title="Job applications"
      description={`${total} application${total === 1 ? "" : "s"} across your pipeline`}
      action={
        <Button onClick={() => setShowAdd((v) => !v)} className="btn-inset">
          <Plus className="mr-2 size-4" />
          {showAdd ? "Hide form" : "Add application"}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TrackerStat label="Applied" count={stats.applied} />
          <TrackerStat label="Interview" count={stats.interview} />
          <TrackerStat label="Offer" count={stats.offer} />
          <TrackerStat label="Rejected" count={stats.rejected} />
        </div>

        <Card className="glass-panel border-white/[0.08]">
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Keep status, momentum, and follow-up work in one place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter(undefined)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === undefined
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All statuses
              </button>
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {JOB_STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {showAdd ? <AddJobForm onDone={() => setShowAdd(false)} /> : null}

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : null}

            {isError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="font-medium text-destructive">We couldn’t load the tracker right now.</p>
                <p className="mt-2 text-sm text-destructive/90">
                  Refresh to try again. Your saved applications are unchanged.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
                  Refresh tracker
                </Button>
              </div>
            ) : null}

            {!isLoading && !isError && items.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No applications yet"
                description="Track every role you apply to so status changes and interview progress stay visible."
              >
                <Button onClick={() => setShowAdd(true)}>
                  <Plus className="mr-2 size-4" />
                  Add application
                </Button>
              </EmptyState>
            ) : null}

            {!isLoading && !isError && items.length > 0 ? (
              <div className="space-y-3">
                {items.map((job) => (
                  <JobRow key={job.id} job={job} />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}
