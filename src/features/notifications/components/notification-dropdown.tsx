'use client';

import Link from 'next/link';
import { BellOffIcon, RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationCard } from '@/features/notifications/components/notification-card';
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from '@/features/notifications/hooks';
import { ApiError } from '@/lib/api';

/**
 * Dropdown panel opened by the header bell: latest notifications newest
 * first, unread badge in the header, loading/error/empty states inline, and a
 * footer that either opens the full page or clears the badge. Both actions hit
 * the real API — no local-only state.
 */
export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { data, isPending, isError, error, refetch } = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Could not load notifications.';

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium">Notifications</p>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {data && data.unread_count > 0
            ? `${data.unread_count} unread`
            : 'All caught up'}
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isPending ? (
          <ul className="divide-y divide-border" aria-label="Loading notifications">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="flex items-start gap-3 px-4 py-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-12" />
                </div>
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="space-y-3 px-4 py-6 text-center">
            <p role="alert" className="text-sm text-muted-foreground">
              {errorMessage}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCwIcon />
              Try again
            </Button>
          </div>
        ) : !data || data.notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <BellOffIcon
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              Deadline reminders will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </ul>
        )}
      </div>

      {data && data.notifications.length > 0 && (
        <div className="flex items-center gap-1 border-t border-border px-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            render={<Link href="/notifications" />}
            nativeButton={false}
            onClick={onClose}
          >
            View all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-muted-foreground"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || data.unread_count === 0}
          >
            Mark all read
          </Button>
        </div>
      )}
    </div>
  );
}