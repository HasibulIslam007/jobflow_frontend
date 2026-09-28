import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton mirrors: card grid (list), Kanban columns (board),
 * full detail layout (details). One module, three shapes.
 */
export function JobCardSkeleton() {
  return (
    <Card size="sm" className="shadow-sm" aria-hidden="true">
      <CardHeader className="gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function JobListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function JobBoardSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-flow-col gap-3 overflow-x-auto pb-2 auto-cols-[16rem]">
      {Array.from({ length: 6 }).map((_, column) => (
        <div key={column} className="space-y-3">
          <Skeleton className="h-6 w-24" />
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
