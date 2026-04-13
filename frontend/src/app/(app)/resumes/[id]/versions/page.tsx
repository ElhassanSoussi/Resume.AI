import type { Metadata } from "next";

import { ResumeVersionsPage } from "@/components/resume/resume-versions-page";

export const metadata: Metadata = {
  title: "Resume Versions",
};

export default function VersionsPage({ params }: { params: { id: string } }) {
  return <ResumeVersionsPage resumeId={params.id} />;
}
