import { AppLayoutFrame } from "@/components/layout/app-layout-frame";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function AppSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <AppLayoutFrame>{children}</AppLayoutFrame>
      </div>
    </AuthGuard>
  );
}
