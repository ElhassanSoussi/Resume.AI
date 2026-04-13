import type { Metadata } from "next";

import { ResumeTailorPage } from "@/components/resume/resume-tailor-page";

export const metadata: Metadata = {
  title: "Tailor Resume",
};

export default function TailorPage({ params }: { params: { id: string } }) {
  return <ResumeTailorPage resumeId={params.id} />;
}
