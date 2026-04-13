"use client";

import { usePathname } from "next/navigation";

import {
  archetypeMainClasses,
  archetypeMainXPadding,
  DEFAULT_PAGE_ARCHETYPE,
} from "@/lib/layout/page-archetype";
import { getAppPageMeta, PAGE_WIDTH_CLASSES } from "@/lib/navigation/app-page-meta";
import { AppHeader } from "@/components/layout/app-header";
import { cn } from "@/lib/utils";

export function AppLayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = getAppPageMeta(pathname);
  const widthClass = PAGE_WIDTH_CLASSES[meta.width ?? "standard"];
  const archetype = meta.archetype ?? DEFAULT_PAGE_ARCHETYPE;

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
      <AppHeader title={meta.title} description={meta.description} widthClass={widthClass} />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "mx-auto w-full flex-1 scroll-mt-4",
          archetypeMainXPadding(archetype),
          archetypeMainClasses(archetype),
          widthClass,
        )}
      >
        {children}
      </main>
    </div>
  );
}
