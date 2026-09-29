import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeletons mirror the real surfaces — card, dense table, board and detail
 * — so nothing shifts when the data lands. Each is `aria-hidden` and built
 * from the same padding and heights as its real counterpart.
 */

/** Mirrors the compact ATS-style card used by the board and mobile list. */
export function JobCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3"
    >
      <div className="flex items-start gap-2.5">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-20 rounded-full" />
      <div className="flex items-center gap-3 border-t border-border/60 pt-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/** Mirrors the mobile card list rendered by `JobTable` below `md`. */
export function JobListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Mirrors the desktop table: a header strip plus evenly sized rows, so the
 * page height barely moves between the loading and loaded states.
 */
export function JobTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className="hidden overflow-hidden rounded-xl border border-border md:block"
    >
      <div className="flex items-center gap-4 border-b border-border bg-surface/60 px-3 py-2.5">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-12" />
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-3 py-3">
            <div className="w-[15rem] space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="ml-auto h-8 w-32 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function JobBoardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex gap-3 overflow-x-auto pb-2"
    >
      {Array.from({ length: 6 }).map((_, column) => (
        <div
          key={column}
          className="flex w-[17rem] shrink-0 flex-col gap-2 rounded-xl border border-border/70 bg-surface/50 p-2"
        >
          <div className="flex items-center justify-between px-1 pb-0.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function JobDetailsSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
