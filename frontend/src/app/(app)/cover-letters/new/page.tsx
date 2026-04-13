import type { Metadata } from "next";

import { CoverLetterNewPage } from "@/components/cover-letter/cover-letter-new-page";

export const metadata: Metadata = {
  title: "New Cover Letter",
};

export default function NewCoverLetterPage() {
  return <CoverLetterNewPage />;
}
