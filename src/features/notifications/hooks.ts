'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  saveJobReminder,
} from '@/features/notifications/notifications.service';
import { dashboardQueryKey } from '@/features/dashboard/hooks';
import { jobsQueryKey } from '@/features/jobs/hooks';
import { ApiError } from '@/lib/api';

export const notificationsQueryKey = ['notifications'] as const;

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

/**
 * Bell + dropdown share this query (30s freshness) so the badge and the
 * panel can never disagree about unread state.
 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    staleTime: 30_000,
    retry: 1,
  });
}

export const unreadCountQueryKey = ['notifications', 'unread-count'] as const;

/**
 * Badge-only query for the topbar (Phase 6.9).
 *
 * Deliberately separate from `useNotifications`: the bell only needs a
 * number, and polling `/notifications` would drag the full list down on every
 * tick. It refetches on window focus and every 60s while the tab is open —
 * with a daily generator, a stale badge is the only way a user misses
 * something time-critical like a closing deadline.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: getUnreadCount,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    retry: 1,
  });
}


/**
 * Read/delete touch the badge + list; the dashboard invalidation keeps
 * any dashboard-side aggregates in sync (Part 11).
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not mark the notification as read.'));
    },
  });
}

/**
 * Clear the whole badge in one call.
 *
 * The success message reports the count the server actually changed, so
 * "All caught up" can never appear when nothing was actually read.
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });

      if (result.marked > 0) {
        toast.success(result.message);
      }
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not mark notifications as read.'));
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not delete the notification.'));
    },
  });
}

/**
 * Create/update a job's deadline reminder. Part 11: a reminder change
 * invalidates the job detail (reminders list), the dashboard (deadlines)
 * and the notifications bell (upcoming alerts).
 */
export function useSaveReminder(jobId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationDays: number) =>
      saveJobReminder(jobId, notificationDays),
    onSuccess: (_result, notificationDays) => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      toast.success(
        `Reminder saved — we'll notify you ${notificationDays} ${
          notificationDays === 1 ? 'day' : 'days'
        } before the deadline.`,
      );
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not save the reminder.'));
    },
  });
}