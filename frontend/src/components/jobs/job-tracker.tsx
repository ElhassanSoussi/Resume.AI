"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCoverLetterList } from "@/hooks/use-cover-letters";
import { useCreateJob, useDeleteJob, useJobList, useUpdateJob } from "@/hooks/use-jobs";
import { useResumeList } from "@/hooks/use-resumes";
import { useVersionList } from "@/hooks/use-resume-versions";
import { APP_ROUTES } from "@/lib/auth/routes";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";
import {
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  type JobApplication,
  type JobApplicationUpdate,
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
  const [followUpDate, setFollowUpDate] = useState("");
  const [jobPostingUrl, setJobPostingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    try {
      await create.mutateAsync({
        company: company.trim(),
        role: role.trim(),
        status,
        applied_date: appliedDate || null,
        follow_up_date: followUpDate || null,
        job_posting_url: jobPostingUrl.trim() || null,
        notes: notes.trim() || null,
        job_description: jobDescription.trim() || null,
      });
      track(ANALYTICS_EVENTS.JOB_APPLICATION_CREATED);
      toast.success("Application added to your tracker.");
      onDone();
      setCompany("");
      setRole("");
      setAppliedDate("");
      setFollowUpDate("");
      setJobPostingUrl("");
      setNotes("");
      setJobDescription("");
      setStatus("applied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add application.");
    }
  }

  return (
    <Card className="glass-panel border-white/[0.08]">
      <CardHeader>
        <CardTitle>New application</CardTitle>
        <CardDescription>Capture the basics now; expand a row later for notes and links.</CardDescription>
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
              aria-label="Application status for new entry"
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
            <Input id="job-date" type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-follow">Follow-up date</Label>
            <Input id="job-follow" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="job-url">Job posting URL</Label>
            <Input
              id="job-url"
              type="url"
              value={jobPostingUrl}
              onChange={(e) => setJobPostingUrl(e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="job-notes">Notes</Label>
            <Textarea
              id="job-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recruiter name, interview dates, comp range…"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="job-jd">Job description (optional)</Label>
            <Textarea
              id="job-jd"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste key requirements for quick reference."
            />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
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

function JobRow({
  job,
  resumeOptions,
  coverOptions,
}: {
  job: JobApplication;
  resumeOptions: { id: string; title: string }[];
  coverOptions: { id: string; title: string }[];
}) {
  const rowUid = useId().replace(/:/g, "");
  const update = useUpdateJob();
  const del = useDeleteJob();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(job.notes ?? "");
  const [jobPostingUrl, setJobPostingUrl] = useState(job.job_posting_url ?? "");
  const [followUpDate, setFollowUpDate] = useState(job.follow_up_date?.slice(0, 10) ?? "");
  const [appliedDate, setAppliedDate] = useState(job.applied_date?.slice(0, 10) ?? "");
  const [jobDescription, setJobDescription] = useState(job.job_description ?? "");
  const [resumePick, setResumePick] = useState<string>("");
  const [versionId, setVersionId] = useState(job.resume_version_id ?? "");
  const [coverId, setCoverId] = useState(job.cover_letter_id ?? "");

  const { data: versions, isLoading: versionsLoading } = useVersionList(resumePick || undefined);

  useEffect(() => {
    if (!resumePick) return;
    const items = versions?.items ?? [];
    if (!items.length) return;
    if (!items.some((v) => v.id === versionId)) {
      setVersionId(items[0]!.id);
    }
  }, [resumePick, versionId, versions?.items]);

  useEffect(() => {
    setNotes(job.notes ?? "");
    setJobPostingUrl(job.job_posting_url ?? "");
    setFollowUpDate(job.follow_up_date?.slice(0, 10) ?? "");
    setAppliedDate(job.applied_date?.slice(0, 10) ?? "");
    setJobDescription(job.job_description ?? "");
    setVersionId(job.resume_version_id ?? "");
    setCoverId(job.cover_letter_id ?? "");
  }, [job]);

  async function handleStatusChange(newStatus: JobStatus) {
    try {
      await update.mutateAsync({ id: job.id, body: { status: newStatus } });
      toast.success("Application updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function handleSaveDetails() {
    try {
      const body: JobApplicationUpdate = {
        notes: notes.trim() || null,
        job_posting_url: jobPostingUrl.trim() || null,
        follow_up_date: followUpDate || null,
        applied_date: appliedDate || null,
        job_description: jobDescription.trim() || null,
        cover_letter_id: coverId || null,
      };
      if (resumePick) {
        body.resume_version_id = versionId || null;
      }
      await update.mutateAsync({ id: job.id, body });
      toast.success("Details saved.");
    } catch {
      toast.error("Could not save details.");
    }
  }

  async function clearResumeLink() {
    try {
      setResumePick("");
      setVersionId("");
      await update.mutateAsync({ id: job.id, body: { resume_version_id: null } });
      toast.success("Resume link cleared.");
    } catch {
      toast.error("Could not clear link.");
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

  const versionItems = versions?.items ?? [];

  return (
    <div className="border-b border-white/10 px-3 py-3 last:border-b-0 lg:px-2 lg:py-2">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_1.2fr_0.55fr_0.9fr_auto] lg:items-center lg:gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate font-heading text-[0.95rem] font-semibold leading-snug text-foreground">{job.company}</p>
          {job.job_posting_url ? (
            <Link
              href={job.job_posting_url}
              className="inline-block max-w-full truncate text-[0.68rem] text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Posting
            </Link>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[0.8rem] text-muted-foreground">{job.role}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-start lg:gap-1">
          <StatusBadge status={job.status} />
          <select
            aria-label={`Update status for ${job.company}`}
            value={job.status}
            onChange={(e) => void handleStatusChange(e.target.value as JobStatus)}
            className="h-8 max-w-full rounded-lg border border-input bg-background px-2 text-xs"
            disabled={update.isPending}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {JOB_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="text-[0.68rem] tabular-nums text-muted-foreground">
          <p>{job.applied_date ? `Applied ${job.applied_date}` : "—"}</p>
          {job.follow_up_date ? <p className="text-muted-foreground/85">F/U {job.follow_up_date}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setOpen((v) => !v)}>
            {open ? <ChevronUp className="mr-1 size-3.5" /> : <ChevronDown className="mr-1 size-3.5" />}
            Details
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remove"
            className="text-destructive hover:text-destructive"
            onClick={() => void handleDelete()}
            disabled={del.isPending}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`jt-${job.id}-${rowUid}-applied`}>Applied date</Label>
              <Input id={`jt-${job.id}-${rowUid}-applied`} type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`jt-${job.id}-${rowUid}-follow`}>Follow-up date</Label>
              <Input id={`jt-${job.id}-${rowUid}-follow`} type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`jt-${job.id}-${rowUid}-url`}>Job posting URL</Label>
              <Input
                id={`jt-${job.id}-${rowUid}-url`}
                type="url"
                value={jobPostingUrl}
                onChange={(e) => setJobPostingUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`jt-${job.id}-${rowUid}-notes`}>Notes</Label>
              <Textarea id={`jt-${job.id}-${rowUid}-notes`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`jt-${job.id}-${rowUid}-jd`}>Job description (reference)</Label>
              <Textarea id={`jt-${job.id}-${rowUid}-jd`} rows={4} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`jt-${job.id}-${rowUid}-resume`}>Link resume (for tailored version)</Label>
              <select
                id={`jt-${job.id}-${rowUid}-resume`}
                aria-label={`Link resume for ${job.company}`}
                className="h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={resumePick}
                onChange={(e) => {
                  const v = e.target.value;
                  setResumePick(v);
                  if (!v) setVersionId("");
                }}
              >
                <option value="">None</option>
                {resumeOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              {job.resume_version_id ? (
                <Button type="button" variant="link" className="h-auto px-0 py-1 text-xs" onClick={() => void clearResumeLink()}>
                  Clear resume link
                </Button>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`jt-${job.id}-${rowUid}-ver`}>Resume version</Label>
              <select
                id={`jt-${job.id}-${rowUid}-ver`}
                aria-label={`Resume version for ${job.company}`}
                className="h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                disabled={!resumePick || versionsLoading}
                value={versionId}
                onChange={(e) => setVersionId(e.target.value)}
              >
                <option value="">{resumePick ? (versionsLoading ? "Loading…" : "Select version") : "Pick a resume first"}</option>
                {versionItems.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                    {v.is_tailored ? " (tailored)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`jt-${job.id}-${rowUid}-cl`}>Cover letter</Label>
              <select
                id={`jt-${job.id}-${rowUid}-cl`}
                aria-label={`Cover letter for ${job.company}`}
                className="h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={coverId}
                onChange={(e) => setCoverId(e.target.value)}
              >
                <option value="">None</option>
                {coverOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void handleSaveDetails()} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save details
            </Button>
            <Button type="button" size="sm" variant="ghost" asChild>
              <Link href={APP_ROUTES.resumeNew}>New resume</Link>
            </Button>
            <Button type="button" size="sm" variant="ghost" asChild>
              <Link href={APP_ROUTES.coverLetterNew}>New cover letter</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TrackerStat({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-heading text-xl font-semibold tracking-tight text-foreground">{count}</p>
    </div>
  );
}

export function JobTracker() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);
  const { data, isLoading, isError, refetch } = useJobList(statusFilter);
  const resumes = useResumeList(0, 80);
  const letters = useCoverLetterList(0, 80);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const resumeOptions = useMemo(
    () => (resumes.data?.items ?? []).map((r) => ({ id: r.id, title: r.title || "Untitled" })),
    [resumes.data?.items],
  );
  const coverOptions = useMemo(
    () => (letters.data?.items ?? []).map((c) => ({ id: c.id, title: c.title || "Cover letter" })),
    [letters.data?.items],
  );

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
      description={`${total} application${total === 1 ? "" : "s"} in your pipeline`}
      className="space-y-4"
      action={
        <Button onClick={() => setShowAdd((v) => !v)} className="btn-inset">
          <Plus className="mr-2 size-4" />
          {showAdd ? "Hide form" : "Add application"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <TrackerStat label="Applied" count={stats.applied} />
          <TrackerStat label="Interview" count={stats.interview} />
          <TrackerStat label="Offer" count={stats.offer} />
          <TrackerStat label="Rejected" count={stats.rejected} />
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card/25">
          <div className="flex flex-col gap-2 border-b border-white/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pipeline</p>
              <p className="text-[0.72rem] text-muted-foreground">Filter by status · expand a row for details</p>
            </div>
          </div>
          <div className="space-y-4 p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter(undefined)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === undefined
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
              >
                All statuses
              </button>
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
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
                description="Track every role you apply to so follow-ups and interview momentum stay visible."
              >
                <Button onClick={() => setShowAdd(true)}>
                  <Plus className="mr-2 size-4" />
                  Add application
                </Button>
              </EmptyState>
            ) : null}

            {!isLoading && !isError && items.length > 0 ? (
              <div className="divide-y divide-white/10 rounded-lg border border-white/8 bg-white/[0.02]">
                <div className="hidden grid-cols-[1.1fr_1.2fr_0.55fr_0.9fr_auto] gap-2 border-b border-white/10 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
                  <span>Company</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Dates</span>
                  <span className="text-right">Actions</span>
                </div>
                {items.map((job) => (
                  <JobRow key={job.id} job={job} resumeOptions={resumeOptions} coverOptions={coverOptions} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PageSection>
  );
}
