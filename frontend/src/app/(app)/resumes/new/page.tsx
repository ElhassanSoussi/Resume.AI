import type { Metadata } from "next";

import { ResumeWizard } from "@/components/resume/resume-wizard";

export const metadata: Metadata = {
  title: "New resume",
};

export default function NewResumePage() {
  return (
    <div className="space-y-6">
      <ResumeWizard />
    </div>
  );
}
