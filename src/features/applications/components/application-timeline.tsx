'use client';

import { CalendarIcon, CircleCheckIcon, SparklesIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Application } from '@/features/applications/types';
import type { Job } from '@/features/jobs/types';
import { cn } from 'cn';

type TimelineEntry = {
  key: string;
  label: string;
  detail: string | null;
  timestamp: string;
  icon: typeof SparklesIcon;
  current?: boolean;
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * APPLICATION TIMELINE. There is no event-sourcing/history table — the
 * timeline is synthesized from the job's `created_at`, the application
 * record's `created_at`/`applied_date`/`updated_at` and the current
 * status, so it reflects known facts rather than a real audit log.
 */
export function ApplicationTimeline({
  job,
  application,
  isPending,
}: {
  job: Job;
  application: Application | undefined;
  isPending: boolean;
}) {
  const entries: TimelineEntry[] = [
    {
      key: 'captured',
      label: 'Job captured',
      detail: `Added via ${job.source_type}`,
      timestamp: job.created_at,
      icon: SparklesIcon,
    },
  ];

  if (application) {
    entries.push({
      key: 'applied',
      label: 'Application recorded',
      detail: application.applied_date
        ? `Applied on ${formatDate(application.applied_date)}`
        : 'No applied date set',
      timestamp: application.created_at,
      icon: CalendarIcon,
    });

    if (application.updated_at !== application.created_at) {
      entries.push({
        key: 'updated',
        label: 'Application updated',
        detail: `Current status: ${application.status}`,
        timestamp: application.updated_at,
        icon: CircleCheckIcon,
        current: true,
      });
    }
  }

  // Oldest first; cap entries at a readable length.
  const timeline = entries.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>
          Derived from capture and application timestamps — no event history
          is stored yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading timeline…</p>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <ol className="relative ml-2 space-y-5 border-l border-border/70 pl-5">
            {timeline.map((entry) => {
              const Icon = entry.icon;

              return (
                <li key={entry.key} className="relative">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -left-[1.95rem] top-0 flex size-5 items-center justify-center rounded-full border border-border bg-background',
                      entry.current &&
                        'border-indigo-500/40 bg-indigo-500/10',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-3 text-muted-foreground',
                        entry.current && 'text-indigo-500',
                      )}
                    />
                  </span>
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        entry.current && 'text-indigo-600 dark:text-indigo-400',
                      )}
                    >
                      {entry.label}
                      {entry.current && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (latest)
                        </span>
                      )}
                    </p>
                    {entry.detail && (
                      <p className="text-xs text-muted-foreground">
                        {entry.detail}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/80">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
