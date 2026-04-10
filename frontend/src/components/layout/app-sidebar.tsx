"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { APP_ROUTES } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const main = [
  { href: APP_ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: APP_ROUTES.resumeNew, label: "New resume", icon: PlusCircle },
  { href: APP_ROUTES.billing, label: "Billing", icon: CreditCard },
  { href: APP_ROUTES.settings, label: "Settings", icon: Settings },
] as const;

export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col", className)}>
      <Link href={APP_ROUTES.dashboard} className="px-6 font-heading text-lg font-bold">
        {APP_NAME}
      </Link>
      <p className="px-6 pb-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Navigate
      </p>
      <Separator className="bg-white/5" />
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {main.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== APP_ROUTES.dashboard && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/12 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-primary/25"
                  : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
              )}
            >
              <item.icon className="size-4 opacity-80" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/5 p-4">
        <div className="glass-subtle flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[0.75rem] leading-snug text-muted-foreground">
          <FileText className="mt-0.5 size-3.5 shrink-0 opacity-80" aria-hidden />
          <span>Changes save through the API when you are authenticated.</span>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-sidebar/40 py-6 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.35)] backdrop-blur-sm md:flex">
      <SidebarNav className="h-full" />
    </aside>
  );
}
