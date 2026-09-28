import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

/**
 * Reusable loading surfaces.
 *
 * These mirror the real layout metrics of the content they stand in for,
 * so the page does not visibly jump when data lands. Every skeleton is
 * aria-hidden and paired with a live-region label at the call site.
 */
function LoadingSkeleton({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton
      data-slot="loading-skeleton"
      className={cn(
        "animate-pulse rounded-lg bg-muted/70",
        className
      )}
      {...props}
    />
  )
}

/** Shimmer bar for text lines, list rows and dividers. */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          className={cn(
            "h-3",
            index === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

/** Card-shaped placeholder matching the standard card padding. */
function SkeletonCard({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-card",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <LoadingSkeleton className="size-7 rounded-lg" />
        <LoadingSkeleton className="h-3 w-24" />
      </div>
      <SkeletonText lines={lines} />
    </div>
  )
}

/** Grid of card placeholders. */
function SkeletonGrid({
  count = 6,
  className,
  columns = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  count?: number;
  className?: string;
  columns?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid grid-cols-1 gap-3", columns, className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** Placeholder for a page header block. */
function SkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      <LoadingSkeleton className="h-3 w-28" />
      <LoadingSkeleton className="h-8 w-64" />
      <LoadingSkeleton className="h-3.5 w-80" />
    </div>
  )
}

export { LoadingSkeleton, SkeletonText, SkeletonCard, SkeletonGrid, SkeletonHeader }
