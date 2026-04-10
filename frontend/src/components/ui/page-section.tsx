"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageSection({ eyebrow, title, description, action, children, className }: Props) {
  const headingId = useId();
  return (
    <section className={cn("space-y-8", className)} aria-labelledby={headingId}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]"
          >
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
