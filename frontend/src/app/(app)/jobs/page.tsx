import type { Metadata } from "next";

import { JobTracker } from "@/components/jobs/job-tracker";

export const metadata: Metadata = {
  title: "Job Tracker",
};

export default function JobsPage() {
  return <JobTracker />;
}
