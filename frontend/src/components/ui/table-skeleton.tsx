import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  rows?: number;
  className?: string;
};

/** Accessible loading placeholder for data tables. */
export function TableSkeleton({ rows = 5, className }: Props) {
  return (
    <div className={cn("space-y-2.5", className)} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading table…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-lg" />
      ))}
    </div>
  );
}
