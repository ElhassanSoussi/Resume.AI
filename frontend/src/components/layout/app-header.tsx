"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { APP_ROUTES } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/app-sidebar";

type AppHeaderProps = {
  title: string;
  description?: string;
  widthClass?: string;
};

export function AppHeader({ title, description, widthClass = "max-w-[1120px]" }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-background/85 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150">
      <div className={cn("mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:h-16 sm:px-6", widthClass)}>
        <div className="min-w-0 md:hidden">
          <Sheet>
            <SheetTrigger
              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 glass-panel">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-y-auto py-6">
                <SidebarNav className="min-h-full" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="min-w-0 flex-1">
          <h1
            id="main-heading"
            className="text-balance font-heading text-lg font-semibold tracking-tight sm:text-xl"
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground sm:line-clamp-1">
              {description}
            </p>
          ) : null}
        </div>
        <Button variant="secondary" size="sm" className="hidden sm:inline-flex" asChild>
          <Link href={APP_ROUTES.resumeNew}>New resume</Link>
        </Button>
      </div>
    </header>
  );
}
