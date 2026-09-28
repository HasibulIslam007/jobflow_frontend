import { ensureCsrfCookie, http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type {
  MarkReadResponse,
  NotificationsResponse,
  SaveReminderResult,
} from '@/features/notifications/types';

/**
 * Notification & reminder service over the Laravel API (Phase 5.7).
 *
 * - GET  /notifications           → bell list + unread_count
 * - PATCH /notifications/{id}/read → mark read (idempotent)
 * - DELETE /notifications/{id}     → dismiss
 * - POST /jobs/{job}/reminders     → create/update the pending reminder
 */

export async function getNotifications(): Promise<NotificationsResponse> {
  const { data } = await http.get<ApiEnvelope<NotificationsResponse>>(
    '/notifications',
  );

  return data.data;
}

export async function markNotificationRead(
  id: number,
): Promise<MarkReadResponse> {
  await ensureCsrfCookie();

  const { data } = await http.patch<ApiEnvelope<MarkReadResponse>>(
    `/notifications/${id}/read`,
  );

  return data.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await ensureCsrfCookie();

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
  await ensureCsrfCookie();

  const { data } = await http.post<ApiEnvelope<SaveReminderResult>>(
    `/jobs/${jobId}/reminders`,
    { notification_days: notificationDays },
  );

  return data.data;
}