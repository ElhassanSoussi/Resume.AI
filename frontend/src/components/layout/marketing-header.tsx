"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

import { APP_NAME } from "@/lib/constants";
import { AUTH_ROUTES, MARKETING_ROUTES } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const nav = [
  { href: MARKETING_ROUTES.examples, label: "Examples" },
  { href: MARKETING_ROUTES.pricing, label: "Pricing" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={MARKETING_ROUTES.home} className="flex items-center gap-2">
          <motion.span
            className="font-heading text-lg font-bold tracking-tight"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            {APP_NAME}
          </motion.span>
          <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary sm:inline">
            Beta
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "bg-white/5 text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href={AUTH_ROUTES.login}>Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={AUTH_ROUTES.signup}>Get started</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="glass-panel border-l border-white/10">
              <SheetHeader>
                <SheetTitle className="font-heading text-left">{APP_NAME}</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/5"
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="my-4 border-white/10" />
                <Link
                  href={AUTH_ROUTES.login}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/5"
                >
                  Log in
                </Link>
                <Button className="mt-2" asChild>
                  <Link href={AUTH_ROUTES.signup}>Get started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
