import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  children: ReactNode;
  className?: string;
  /** Extra classes for the inner content wrapper */
  innerClassName?: string;
};

export function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  align = "center",
  children,
  className,
  innerClassName,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("marketing-section", className)}>
      <div className={cn("mx-auto max-w-6xl", innerClassName)}>
        <div
          className={cn(
            "mb-12 max-w-3xl space-y-4",
            align === "center" && "mx-auto text-center",
          )}
        >
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          ) : null}
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-lg text-muted-foreground sm:text-xl">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
