import { CalendarClockIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpcomingDeadline } from '@/features/dashboard/types';
import { cn } from 'cn';

function urgencyBadge(days: number): { label: string; variant: 'destructive' | 'secondary' | 'outline' } {
  if (days < 0) {
    return { label: `${Math.abs(days)}d overdue`, variant: 'destructive' };
  }
  if (days === 0) {
    return { label: 'due today', variant: 'destructive' };
  }
  if (days <= 3) {
    return { label: `${days}d left`, variant: 'destructive' };
  }
  if (days <= 7) {
    return { label: `${days}d left`, variant: 'secondary' };
  }

  return { label: `${days}d left`, variant: 'outline' };
}

/**
 * Deadline-focus list: soonest first, overdue surfaced in destructive
 * red. Empty state nudges toward adding a deadline, never fake data.
 */
export function DeadlineCard({ deadlines }: { deadlines: UpcomingDeadline[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClockIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          Upcoming deadlines
        </CardTitle>
        <CardDescription>Soonest first · next 5 with a deadline set</CardDescription>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="rounded-lg bg-muted/50 px-3 py-6 text-center text-sm text-muted-foreground">
            No upcoming deadlines. Add a deadline to a job to see it here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {deadlines.map((job) => {
              const badge = urgencyBadge(job.days_remaining);

              return (
                <li key={job.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.company} · due {job.deadline}
                    </p>
                  </div>
                  <Badge variant={badge.variant} className={cn('shrink-0 tabular-nums')}>
                    {badge.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DeadlineCardSkeleton() {
  return (
    <Card className="shadow-sm" aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
