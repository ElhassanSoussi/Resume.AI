import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, children, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-gradient-to-b from-muted/15 to-transparent px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/8 bg-card/50 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]">
          <Icon className="size-6 text-muted-foreground" aria-hidden />
        </div>
      ) : null}
      <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children ? <div className="mt-8 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
