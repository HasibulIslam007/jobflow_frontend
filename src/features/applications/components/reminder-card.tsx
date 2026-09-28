'use client';

import { useState } from 'react';

import { BellIcon, CalendarClockIcon, Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Job } from '@/features/jobs/types';
import { useSaveReminder } from '@/features/notifications/hooks';
import {
  REMINDER_DAY_OPTIONS,
  type ReminderDays,
} from '@/features/notifications/types';

function formatDate(value: string): string {
  // Date-only strings ("2026-10-10") parse as UTC — build a local date to
  // avoid the classic off-by-one in timezones behind UTC.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);

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
 * Deadline reminder creator (Phase 5.7): pick how many days before the
 * deadline to be alerted, save, and see the active reminders below.
 * The backend derives reminder_date = deadline − notification_days and
 * the daily `reminders:send` sweep dispatches the in-app + email alert.
 */
export function ReminderCard({ job }: { job: Job }) {
  const reminders = job.reminders ?? [];
  const pending = reminders.find((reminder) => reminder.status === 'pending');

  const [days, setDays] = useState<ReminderDays>(
    (REMINDER_DAY_OPTIONS as readonly number[]).includes(
      pending?.notification_days ?? -1,
    )
      ? (pending?.notification_days as ReminderDays)
      : 3,
  );
  const { mutate: saveReminder, isPending } = useSaveReminder(job.id);

  const hasDeadline = Boolean(job.deadline);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          Reminders
        </CardTitle>
        <CardDescription>
          Deadline alerts in-app and by email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {job.deadline && (
          <div className="flex items-center gap-2">
            <CalendarClockIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">Deadline:</span>
            <span className="font-medium">{formatDate(job.deadline)}</span>
          </div>
        )}

        {hasDeadline ? (
          <div className="space-y-2">
            <label
              htmlFor={`reminder-days-${job.id}`}
              className="block text-xs font-medium text-muted-foreground"
            >
              Remind me before the deadline
            </label>
            <select
              id={`reminder-days-${job.id}`}
              value={days}
              disabled={isPending}
              onChange={(event) =>
                setDays(Number(event.target.value) as ReminderDays)
              }
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
            >
              {REMINDER_DAY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} {option === 1 ? 'day' : 'days'} before
                </option>
              ))}
            </select>
            <Button
              size="sm"
              className="w-full"
              disabled={isPending}
              onClick={() => saveReminder(days)}
            >
              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Reminder'
              )}
            </Button>
          </div>
        ) : (
          <p className="rounded-lg bg-muted/50 px-3 py-4 text-center text-xs text-muted-foreground">
            Add a deadline to this job to enable reminders.
          </p>
        )}

        {reminders.length > 0 ? (
          <ul className="space-y-2">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2"
              >
                <span className="text-xs">
                  {reminder.notification_days != null
                    ? `${reminder.notification_days} ${
                        reminder.notification_days === 1 ? 'day' : 'days'
                      } before · `
                    : ''}
                  {formatDate(reminder.reminder_date)}
                </span>
                <span
                  className={
                    reminder.status === 'sent'
                      ? 'text-xs text-emerald-600 dark:text-emerald-400'
                      : 'text-xs text-amber-600 dark:text-amber-400'
                  }
                >
                  {reminder.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          hasDeadline && (
            <p className="text-xs text-muted-foreground">
              No reminder set yet — save one above.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
