"use client";

import { useState } from "react";
import { Copy, History, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageSection } from "@/components/ui/page-section";
import {
  useDeleteVersion,
  useDuplicateVersion,
  useRenameVersion,
  useSnapshotVersion,
  useVersionList,
} from "@/hooks/use-resume-versions";

type Props = {
  resumeId: string;
  resumeTitle: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ResumeVersionList({ resumeId, resumeTitle }: Props) {
  const { data, isLoading } = useVersionList(resumeId);
  const snapshot = useSnapshotVersion(resumeId);
  const rename = useRenameVersion(resumeId);
  const duplicate = useDuplicateVersion(resumeId);
  const del = useDeleteVersion(resumeId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const items = data?.items ?? [];

  async function handleSnapshot() {
    try {
      await snapshot.mutateAsync("Snapshot");
      toast.success("Version saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save version.");
    }
  }

  async function handleRename(versionId: string) {
    if (!editLabel.trim()) return;
    try {
      await rename.mutateAsync({ versionId, body: { label: editLabel.trim() } });
      setEditingId(null);
      toast.success("Renamed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rename failed.");
    }
  }

  async function handleDuplicate(versionId: string, label: string) {
    try {
      await duplicate.mutateAsync({ versionId, label: `${label} (copy)` });
      toast.success("Version duplicated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed.");
    }
  }

  async function handleDelete(versionId: string) {
    if (!globalThis.window.confirm("Delete this version permanently?")) return;
    try {
      await del.mutateAsync(versionId);
      toast.success("Version deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <PageSection
      eyebrow={resumeTitle}
      title="Versions"
      description={`${data?.total ?? 0} saved version${(data?.total ?? 0) === 1 ? "" : "s"}`}
      action={
        <Button onClick={() => void handleSnapshot()} disabled={snapshot.isPending}>
          {snapshot.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          Save current
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={History}
          title="No versions yet"
          description='Click "Save current" to snapshot the resume in its current state.'
        />
      ) : (
        <div className="space-y-3">
          {items.map((v) => (
            <Card key={v.id} className="glass-panel">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 space-y-0.5">
                  {editingId === v.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleRename(v.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <Button size="sm" onClick={() => void handleRename(v.id)} disabled={rename.isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="font-medium leading-snug">
                      {v.label}
                      {v.is_tailored && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                          Tailored
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(v.created_at)}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Rename"
                    onClick={() => {
                      setEditingId(v.id);
                      setEditLabel(v.label);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Duplicate"
                    onClick={() => void handleDuplicate(v.id, v.label)}
                    disabled={duplicate.isPending}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Delete"
                    className="text-destructive hover:text-destructive"
                    onClick={() => void handleDelete(v.id)}
                    disabled={del.isPending}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageSection>
  );
}
