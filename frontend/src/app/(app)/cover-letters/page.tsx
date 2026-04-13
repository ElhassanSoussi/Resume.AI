import type { Metadata } from "next";

import { CoverLetterList } from "@/components/cover-letter/cover-letter-list";

export const metadata: Metadata = {
  title: "Cover Letters",
};

export default function CoverLettersPage() {
  return <CoverLetterList />;
}
