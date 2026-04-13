"use client";

import { useEffect, useState } from "react";

import { WorkspaceOnboardingDialog } from "@/components/onboarding/workspace-onboarding-dialog";
import {
  loadWorkspaceCareerPrefs,
  saveWorkspaceCareerPrefs,
  shouldPromptWorkspaceOnboarding,
} from "@/lib/onboarding/workspace-preferences";

type Props = {
  onPrefsSaved?: () => void;
};

export function DashboardWorkspaceOnboarding({ onPrefsSaved }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(shouldPromptWorkspaceOnboarding());
  }, []);

  return (
    <WorkspaceOnboardingDialog
      open={open}
      variant="welcome"
      onSaved={onPrefsSaved}
      onOpenChange={(next) => {
        if (!next && loadWorkspaceCareerPrefs() == null) {
          saveWorkspaceCareerPrefs({ v: 1, skipped: true });
        }
        setOpen(next);
      }}
    />
  );
}
