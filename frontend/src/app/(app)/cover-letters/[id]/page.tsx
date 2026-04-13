import type { Metadata } from "next";

import { CoverLetterDetailPage } from "@/components/cover-letter/cover-letter-detail-page";

export const metadata: Metadata = {
  title: "Cover Letter",
};

export default function CoverLetterPage({ params }: { params: { id: string } }) {
  return <CoverLetterDetailPage id={params.id} />;
}
