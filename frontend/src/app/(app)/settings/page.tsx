import type { Metadata } from "next";

import { BetaFeedbackCard } from "@/components/settings/beta-feedback-card";
import { SettingsCareerPreferences } from "@/components/settings/settings-career-preferences";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/components/ui/page-section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings",
};

const selectClass = cn(
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30",
);

export default function SettingsPage() {
  return (
    <PageSection
      eyebrow="Account"
      title="Settings"
      description="Profile defaults and workspace preferences that apply across your resumes and exports."
      className="space-y-4"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          <SettingsCareerPreferences />

          <Card className="glass-panel border-white/[0.08]">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Account-level identity used across exports, receipts, and workspace activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display">Display name</Label>
                <Input id="display" name="display" autoComplete="name" placeholder="Alex Rivera" />
                <p className="text-xs text-muted-foreground">Visible on account-level surfaces and future collaboration.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Account email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
                <p className="text-xs text-muted-foreground">Should match the email you use to sign in.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/[0.08]">
            <CardHeader>
              <CardTitle>Defaults</CardTitle>
              <CardDescription>
                These preferences set starting values for new resumes. You can always override them per resume.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-template">Default designed template</Label>
                <select id="default-template" aria-label="Default designed template" className={selectClass} defaultValue="modern_professional">
                  <option value="modern_professional">Modern Professional</option>
                  <option value="corporate_minimal">Corporate Minimal</option>
                  <option value="crisp_tech">Crisp Tech</option>
                  <option value="graduate_starter">Graduate Starter</option>
                  <option value="executive_serif">Executive Serif</option>
                  <option value="elegant_executive">Elegant Executive</option>
                  <option value="creative_clean">Creative Clean</option>
                </select>
                <p className="text-xs text-muted-foreground">Applied when creating a new resume. Existing resumes keep their selection.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="export-mode">Default export mode</Label>
                <select id="export-mode" aria-label="Default export mode" className={selectClass} defaultValue="designed">
                  <option value="designed">Designed Export</option>
                  <option value="ats">ATS Export</option>
                </select>
                <p className="text-xs text-muted-foreground">Sets the initial export mode in the editor. Switch anytime before generating.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="writing-mode">Default AI writing mode</Label>
                <select id="writing-mode" aria-label="Default AI writing mode" className={selectClass} defaultValue="balanced">
                  <option value="balanced">Balanced</option>
                  <option value="concise">Concise</option>
                  <option value="achievement_focused">Achievement-focused</option>
                  <option value="ats_focused">ATS-focused</option>
                </select>
                <p className="text-xs text-muted-foreground">Controls the default tone for AI rewrites. Adjustable per session in the editor.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Preferences will be persisted once account settings are fully connected.
            </p>
            <Button type="button" className="btn-inset">
              Save preferences
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <BetaFeedbackCard />

          <aside className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Scope</p>
            <ul className="mt-2 space-y-2 text-[0.72rem] leading-snug text-muted-foreground">
              <li>
                <span className="font-medium text-foreground/90">Per resume</span> — contact, experience, and skills live on each document.
              </li>
              <li>
                <span className="font-medium text-foreground/90">Billing</span> — receipts and PDFs live under Payments & exports.
              </li>
              <li>
                <span className="font-medium text-foreground/90">Privacy</span> — content is used for your documents and AI improvements only.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </PageSection>
  );
}
