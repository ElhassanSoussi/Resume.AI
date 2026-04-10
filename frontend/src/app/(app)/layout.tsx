import { AppLayoutFrame } from "@/components/layout/app-layout-frame";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <AppLayoutFrame>{children}</AppLayoutFrame>
    </div>
  );
}
