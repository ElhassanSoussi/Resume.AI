import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { MARKETING_ROUTES } from "@/lib/auth/routes";

const links = [
  { href: MARKETING_ROUTES.pricing, label: "Pricing" },
  { href: MARKETING_ROUTES.examples, label: "Examples" },
  { href: MARKETING_ROUTES.support, label: "Support" },
  { href: MARKETING_ROUTES.privacy, label: "Privacy" },
  { href: MARKETING_ROUTES.terms, label: "Terms" },
  { href: "/login", label: "Log in" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-heading text-base font-semibold">{APP_NAME}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Resume, tailor, cover letter, tracker, and export in one workspace — calm UI, white-paper PDFs, fact-first
            AI.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
