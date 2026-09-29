'use client';

import Link from 'next/link';
import { CalendarClockIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpcomingDeadline } from '@/features/dashboard/types';
import { cn } from 'cn';

type Urgency = 'urgent' | 'upcoming' | 'safe';

function urgencyFor(daysRemaining: number): Urgency {
  if (daysRemaining <= 3) return 'urgent';
  if (daysRemaining <= 7) return 'upcoming';

  return 'safe';
}

const DOT: Record<Urgency, string> = {
  urgent: 'bg-destructive ring-destructive/25',
  upcoming: 'bg-warning ring-warning/25',
  safe: 'bg-success ring-success/25',
};

const TEXT: Record<Urgency, string> = {
  urgent: 'text-destructive',
  upcoming: 'text-warning',
  safe: 'text-success',
};

const RAIL: Record<Urgency, string> = {
  urgent: 'bg-destructive/40',
  upcoming: 'bg-warning/40',
  safe: 'bg-success/40',
};

function whenLabel(days: number): string {
  if (days < -1) return `${Math.abs(days)} days ago`;
  if (days === -1) return 'Yesterday';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;

  return `In ${days} days`;
}

/**
 * Deadline timeline.
 *
 * A vertical rail rather than a list because the *ordering in time* is the
 * information — a list of pills hides it. Urgency is encoded by colour
 * AND by the "when" label, so it survives a colour-blind reader.
 */
function DeadlineTimeline({ deadlines }: { deadlines: UpcomingDeadline[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClockIcon
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          Deadline timeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        {deadlines.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-body text-muted-foreground">
            No deadlines on the horizon. Add a deadline to a job and it will
            appear here.
          </p>
        ) : (
          <ol className="relative space-y-1">
            {deadlines.map((item, index) => {
              const urgency = urgencyFor(item.days_remaining);
              const overdue = item.days_remaining < 0;
              const last = index === deadlines.length - 1;

              return (
                <li key={item.id} className="relative pl-8">
                  {/* Connector between stops, stopping short of the last dot. */}
                  {!last ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute top-7 bottom-[-0.25rem] left-[0.4375rem] w-px',
                        RAIL[urgency],
                      )}
                    />
                  ) : null}

                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute top-3.5 left-[0.1875rem] size-2.5 rounded-full ring-4',
                      DOT[urgency],
                    )}
                  />

                  <Link
                    href={`/jobs/${item.id}`}
                    className="group flex items-start justify-between gap-4 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-body font-medium text-foreground group-hover:text-ai">
                        {item.title}
                      </span>
                      <span className="block truncate text-caption text-muted-foreground">
                        {item.company} · apply by {item.deadline}
                      </span>
                    </span>

                    <span
                      className={cn(
                        'shrink-0 text-caption font-medium whitespace-nowrap',
                        TEXT[urgency],
                      )}
                    >
                      {overdue ? 'Overdue' : whenLabel(item.days_remaining)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function DeadlineTimelineSkeleton() {
  return (
    <Card className="h-full" aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 pl-8">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="ml-auto h-3 w-14" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { DeadlineTimeline, DeadlineTimelineSkeleton };
