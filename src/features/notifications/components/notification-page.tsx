'use client';

import { useMemo, useState } from 'react';
import { BellOffIcon, CheckCheckIcon, RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { NotificationCard } from '@/features/notifications/components/notification-card';
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from '@/features/notifications/hooks';
import {
  DEADLINE_NOTIFICATION_TYPES,
  INSIGHT_NOTIFICATION_TYPES,
  type AppNotification,
} from '@/features/notifications/types';
import { ApiError } from '@/lib/api';
import { cn } from 'cn';

type FilterKey = 'all' | 'unread' | 'deadlines' | 'insights';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'deadlines', label: 'Deadlines' },
  { key: 'insights', label: 'AI Insights' },
];

/**
 * Filtering runs client-side over the single already-fetched list.
 *
 * Re-querying per filter would mean a request per tab and a second, divergent
 * server-side definition of "unread" from the one the bell badge uses.
 * Filtering one list keeps the page and the bell in agreement.
 *
 * Every row is a real record from GET /api/v1/notifications — there is no
 * seeded sample data anywhere in this view.
 */
export function NotificationPage() {
  const { data, isPending, isError, error, refetch } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<FilterKey>('all');

  const unreadCount = data?.unread_count ?? 0;

  // Filtered inside the memo so the dependency is the array reference from
  // the query cache, not a fresh `[]` literal on every render.
  const visible = useMemo(() => {
    const notifications = data?.notifications ?? [];

    return notifications.filter((notification) => matches(notification, filter));
  }, [data?.notifications, filter]);

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Could not load notifications.';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label="Filter notifications"
        >
          {FILTERS.map((entry) => {
            const active = entry.key === filter;

            return (
              <button
                key={entry.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(entry.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-caption font-medium transition-colors',
                  active
                    ? 'border-foreground/20 bg-foreground/5 text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {entry.label}
                {entry.key === 'unread' && unreadCount > 0 ? (
                  <span
                    data-tabular="true"
                    className="ml-1.5 text-micro text-muted-foreground"
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || unreadCount === 0}
        >
          <CheckCheckIcon aria-hidden="true" />
          Mark all read
        </Button>
      </div>

      {isPending ? (
        <ul className="space-y-2" aria-label="Loading notifications">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="h-24 animate-pulse rounded-xl border border-border/70 bg-surface/40"
            />
          ))}
        </ul>
      ) : isError ? (
        <ErrorState
          title="Could not load notifications"
          description={`${errorMessage} Try again in a moment.`}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCwIcon aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={BellOffIcon}
          title={filter === 'all' ? 'No notifications yet' : 'Nothing in this filter'}
          description={
            filter === 'all'
              ? 'Deadline reminders, follow-up nudges, interview prep and resume suggestions are generated from your own records and appear here.'
              : 'Try a different filter to see the rest of your notifications.'
          }
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((notification) => (
            <li key={notification.id}>
              <NotificationCard notification={notification} />
            </li>
          ))}
        </ul>
      )}

      {!isPending && !isError && visible.length > 0 ? (
        <Card>
          <CardContent className="pt-4">
            <p className="text-micro text-pretty text-muted-foreground">
              Notifications are generated once a day from your real records —
              job deadlines, application activity, interview stages and your
              resume score. Nothing here is created without a record behind it.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function matches(notification: AppNotification, filter: FilterKey): boolean {
  switch (filter) {
    case 'unread':
      return notification.read_at === null;
    case 'deadlines':
      return (DEADLINE_NOTIFICATION_TYPES as readonly string[]).includes(
        notification.type,
      );
    case 'insights':
      return (INSIGHT_NOTIFICATION_TYPES as readonly string[]).includes(
        notification.type,
      );
    default:
      return true;
  }
}
