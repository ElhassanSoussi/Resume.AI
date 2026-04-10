import type { Metadata } from "next";

import { PageSection } from "@/components/ui/page-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <PageSection
      eyebrow="Workspace"
      title="Profile"
      description="Account details are persisted when your backend user API is connected."
    >
      <Card className="glass-panel max-w-xl border-white/[0.09]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Identity</CardTitle>
          <CardDescription>Display name and email shown across the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display">Display name</Label>
            <Input id="display" name="display" autoComplete="name" placeholder="Alex Rivera" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
          </div>
          <Button type="button" className="btn-inset">
            Save changes
          </Button>
        </CardContent>
      </Card>
    </PageSection>
  );
}
