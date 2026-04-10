import type { Metadata } from "next";

import { DashboardResumeList } from "@/components/dashboard/dashboard-resume-list";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardResumeList />;
}
