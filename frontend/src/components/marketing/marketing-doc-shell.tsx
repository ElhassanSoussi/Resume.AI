import type { ReactNode } from "react";

type Props = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function MarketingDocShell({ title, updated, children }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
      <div className="marketing-body mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
