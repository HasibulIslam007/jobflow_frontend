'use client';

import {
  CheckIcon,
  FileTextIcon,
  FlameIcon,
  InfoIcon,
  Loader2Icon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  useDeleteNotification,
  useMarkNotificationRead,
} from '@/features/notifications/hooks';
import type { AppNotification, NotificationType } from '@/features/notifications/types';
import { cn } from 'cn';

const TYPE_META: Record<
  NotificationType,
  { icon: LucideIcon; tint: string }
> = {
  deadline_reminder: { icon: FlameIcon, tint: 'text-orange-500' },
  application_update: { icon: FileTextIcon, tint: 'text-emerald-600 dark:text-emerald-400' },
  system: { icon: InfoIcon, tint: 'text-indigo-500' },
};

/** "2h ago" style relative label with an absolute title for hovering. */
export function formatRelativeTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

/**
 * One row in the notification dropdown: type icon, title/message, relative
 * time, plus per-row "mark read" and "delete" actions wired to the API.
 */
export function NotificationCard({
  notification,
}: {
  notification: AppNotification;
}) {
  const { mutate: markRead, isPending: isMarking } = useMarkNotificationRead();
  const { mutate: remove, isPending: isRemoving } = useDeleteNotification();

  const isUnread = notification.read_at === null;
  const meta = TYPE_META[notification.type] ?? TYPE_META.system;
  const Icon = meta.icon;
  const busy = isMarking || isRemoving;

  return (
    <li
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
        isUnread && 'bg-indigo-500/[0.04] dark:bg-indigo-400/[0.06]',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted',
          meta.tint,
        )}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-0.5">
        <p
          className={cn(
            'flex items-center gap-1.5 text-sm',
            isUnread ? 'font-semibold' : 'font-medium text-muted-foreground',
          )}
        >
          <span className="truncate">{notification.title}</span>
          {isUnread && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-indigo-500"
              aria-label="Unread"
            />
          )}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {notification.message}
        </p>
        <time
          dateTime={notification.created_at}
          title={new Date(notification.created_at).toLocaleString()}
          className="block text-[11px] text-muted-foreground/70"
        >
          {formatRelativeTime(notification.created_at)}
        </time>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Mark "${notification.title}" as read`}
            disabled={busy}
            onClick={() => markRead(notification.id)}
          >
            {isMarking ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CheckIcon />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete "${notification.title}"`}
          disabled={busy}
          onClick={() => remove(notification.id)}
        >
          {isRemoving ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <XIcon />
          )}
        </Button>
      </div>
    </li>
  );
}