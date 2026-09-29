import { http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type {
  MarkAllReadResponse,
  MarkReadResponse,
  NotificationsResponse,
  SaveReminderResult,
  UnreadCountResponse,
} from '@/features/notifications/types';

/**
 * Notification & reminder service over the Laravel API.
 *
 * - GET    /notifications              → bell list + unread_count
 * - GET    /notifications/unread-count → badge count only (cheap poll)
 * - PATCH  /notifications/{id}/read    → mark read (idempotent)
 * - PATCH  /notifications/read-all     → clear the whole badge
 * - DELETE /notifications/{id}          → dismiss
 * - POST   /jobs/{job}/reminders        → create/update the pending reminder
 *
 * Every one of these is backed by real rows; nothing here fabricates a
 * notification for the UI's benefit.
 */

export async function getNotifications(): Promise<NotificationsResponse> {
  const { data } = await http.get<ApiEnvelope<NotificationsResponse>>(
    '/notifications',
  );

  return data.data;
}

/**
 * Badge-only fetch, for polling the topbar without re-downloading the list.
 */
export async function getUnreadCount(): Promise<number> {
  const { data } = await http.get<ApiEnvelope<UnreadCountResponse>>(
    '/notifications/unread-count',
  );

  return data.data.unread_count;
}

export async function markNotificationRead(
  id: number,
): Promise<MarkReadResponse> {
  const { data } = await http.patch<ApiEnvelope<MarkReadResponse>>(
    `/notifications/${id}/read`,
  );

  return data.data;
}

export async function markAllNotificationsRead(): Promise<MarkAllReadResponse> {
  const { data } = await http.patch<ApiEnvelope<MarkAllReadResponse>>(
    '/notifications/read-all',
  );

  return data.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await http.delete(`/notifications/${id}`);
}

/**
 * Create (or update) the pending deadline reminder for a job.
 * The backend derives reminder_date from job.deadline − notification_days.
 */
export async function saveJobReminder(
  jobId: number,
  notificationDays: number,
): Promise<SaveReminderResult> {
  const { data } = await http.post<ApiEnvelope<SaveReminderResult>>(
    `/jobs/${jobId}/reminders`,
    { notification_days: notificationDays },
  );

  return data.data;
}