import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "Settings",
};

function SettingsField({
  id,
  label,
  placeholder,
  helper,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  helper: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} autoComplete={id} placeholder={placeholder} />
      <p className="text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <PageSection
      eyebrow="Account"
      title="Settings"
      description="Profile and workspace preferences are kept lightweight for now, with room for billing and account controls to grow."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <Card className="glass-panel border-white/[0.08]">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                The basics that identify you across resumes, exports, and future collaboration features.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <SettingsField
                id="display"
                label="Display name"
                placeholder="Alex Rivera"
                helper="Used in future account-level activity and collaboration surfaces."
              />
              <SettingsField
                id="email"
                label="Account email"
                type="email"
                placeholder="you@company.com"
                helper="This should match the email you use to sign in."
              />
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/[0.08]">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Small defaults that help keep your workspace predictable and professional.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <SettingsField
                id="default-template"
                label="Preferred designed template"
                placeholder="Modern Professional"
                helper="Reference-only for now while template defaults stay resume-specific."
              />
              <SettingsField
                id="export-mode"
                label="Preferred export mode"
                placeholder="Designed Export"
                helper="ATS Export remains available whenever you need the safest structure."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="button" className="btn-inset">
              Save preferences
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-white/[0.08]">
            <CardHeader>
              <CardTitle>Workspace notes</CardTitle>
              <CardDescription>What is already live today and what is reserved for future account controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="font-medium text-foreground">Profile hooks are lightweight</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Resume data is saved inside each resume today. This page is for broader account-level preferences.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="font-medium text-foreground">Billing settings will grow here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Payment history and export history already live in Billing. Future invoice and account controls can slot in here cleanly.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="font-medium text-foreground">Keep details current</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Consistent account information makes exports, outreach, and future admin surfaces feel more trustworthy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageSection>
  );
}
