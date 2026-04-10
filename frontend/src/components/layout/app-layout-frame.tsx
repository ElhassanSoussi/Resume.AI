"use client";

import { usePathname } from "next/navigation";

import { getAppPageMeta } from "@/lib/navigation/app-page-meta";
import { AppHeader } from "@/components/layout/app-header";
import { cn } from "@/lib/utils";

export function AppLayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = getAppPageMeta(pathname);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg",
          "focus:top-3 focus:left-3 sm:focus:top-4 sm:focus:left-4",
        )}
      >
        Skip to content
      </a>
      <AppHeader title={meta.title} description={meta.description} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 scroll-mt-4 px-4 py-8 sm:px-8 sm:py-10"
      >
        {children}
      </main>
    </div>
  );
}
