import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { MARKETING_ROUTES } from "@/lib/auth/routes";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-90" aria-hidden />
      <header className="relative z-10 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4 sm:px-6">
          <Link href={MARKETING_ROUTES.home} className="font-heading text-sm font-bold">
            {APP_NAME}
          </Link>
          <Link
            href={MARKETING_ROUTES.pricing}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 py-12 sm:p-6">
        {children}
      </div>
    </div>
  );
}
