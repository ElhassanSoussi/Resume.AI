"use client";

import { useState } from "react";

import { WorkspaceOnboardingDialog } from "@/components/onboarding/workspace-onboarding-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsCareerPreferences() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="glass-panel border-white/[0.08]">
        <CardHeader>
          <CardTitle>Career preferences</CardTitle>
          <CardDescription>
            Local defaults for new resumes, export mode, AI writing tone, and dashboard workflow hints. Stored only in
            this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            Edit career preferences
          </Button>
        </CardContent>
      </Card>
      <WorkspaceOnboardingDialog open={open} variant="settings" onOpenChange={setOpen} />
    </>
  );
}
