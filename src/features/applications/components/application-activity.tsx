'use client';

import {
  CalendarCheckIcon,
  FilePlusIcon,
  HistoryIcon,
  type LucideIcon,
} from 'lucide-react';

import { APPLICATION_STATUS_META, formatDate } from '@/features/applications/application-status-meta';
import type { Application } from '@/features/applications/types';
import { cn } from 'cn';

type ActivityEntry = {
  key: string;
  label: string;
  detail: string | null;
  timestamp: string;
  icon: LucideIcon;
  current?: boolean;
};

/**
 * Build the activity list from the timestamps the record actually carries.
 *
 * There is no event/history table anywhere in the API, so this can only ever
 * report what is provable:
 *
 *   · `created_at`  → the application row was created
 *   · `applied_date`→ the date the user says they applied
 *   · `updated_at`  → the row was modified since creation, and its status
 *                     *right now* is whatever it currently holds
 *
 * It deliberately does NOT claim "moved from Applied to Interview on the
 * 3rd" — that history does not exist and inventing it is the fastest way to
 * lose a user's trust in every other number on the page.
 */
function buildActivity(application: Application): ActivityEntry[] {
  const entries: ActivityEntry[] = [
    {
      key: 'created',
      label: 'Application recorded',
      detail: 'This application was added to your pipeline.',
      timestamp: application.created_at,
      icon: FilePlusIcon,
    },
  ];

  if (application.applied_date) {
    entries.push({
      key: 'applied',
      label: 'Applied',
      detail: `You recorded applying on ${formatDate(application.applied_date)}.`,
      timestamp: application.applied_date,
      icon: CalendarCheckIcon,
    });
  }

  const wasUpdated =
    new Date(application.updated_at).getTime() !==
    new Date(application.created_at).getTime();

  if (wasUpdated) {
    const meta = APPLICATION_STATUS_META[application.status];

    entries.push({
      key: 'updated',
      label: 'Record last updated',
      // States the current status without pretending to know when it changed
      // or what it changed from.
      detail: `The record was edited. Its status is now “${meta.label}”.`,
      timestamp: application.updated_at,
      icon: HistoryIcon,
      current: true,
    });
  }

  return entries.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

/**
 * ACTIVITY TIMELINE — clearly labelled as derived from stored timestamps.
 *
 * The copy under the heading is not decoration: it tells the user exactly
 * what this list is and, just as importantly, what it is not.
 */
export function ApplicationActivity({
  application,
  /** Caps the list for the compact preview on the job detail page. */
  limit,
  className,
}: {
  application: Application;
  limit?: number;
  className?: string;
}) {
  const all = buildActivity(application);
  const entries = typeof limit === 'number' ? all.slice(-limit) : all;
  const isTruncated = entries.length < all.length;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-1">
        <h3 className="text-section-title font-heading text-foreground">
          Activity timeline
        </h3>
        <p className="text-caption text-pretty text-muted-foreground">
          Built from the record&rsquo;s created, applied and updated dates. The
          API does not store a status-change history, so earlier stages are
          not shown.
        </p>
      </div>

      <ol className="relative ml-2 space-y-4 border-l border-border/70 pl-5">
        {entries.map((entry) => {
          const Icon = entry.icon;

          return (
            <li key={entry.key} className="relative">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -left-[1.95rem] top-0 flex size-5 items-center justify-center rounded-full border border-border bg-background',
                  entry.current && 'border-ai/40 bg-ai/10',
                )}
              >
                <Icon
                  className={cn(
                    'size-3 text-muted-foreground',
                    entry.current && 'text-ai',
                  )}
                />
              </span>

              <div className="space-y-0.5">
                <p
                  className={cn(
                    'text-caption font-medium text-foreground',
                    entry.current && 'text-ai',
                  )}
                >
                  {entry.label}
                </p>
                {entry.detail ? (
                  <p className="text-micro text-pretty text-muted-foreground">
                    {entry.detail}
                  </p>
                ) : null}
                <p className="text-micro text-muted-foreground/80">
                  <time dateTime={entry.timestamp}>
                    {formatDate(entry.timestamp)}
                  </time>
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {isTruncated ? (
        <p className="text-micro text-muted-foreground">
          Showing the {entries.length} most recent entries.
        </p>
      ) : null}
    </div>
  );
}
