import { Skeleton } from "@/components/ui/skeleton";

type Props = { count?: number };

export function ResumeCardGridSkeleton({ count = 6 }: Props) {
  return (
    <div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading resumes…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-panel flex flex-col gap-4 rounded-xl border border-white/10 p-5"
        >
          <Skeleton className="h-5 w-[85%]" />
          <Skeleton className="h-3.5 w-[45%]" />
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-8 w-[4.5rem] rounded-lg" />
            <Skeleton className="h-8 w-[4.5rem] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
