/**
 * Notification domain types. Mirror the Laravel NotificationResource /
 * reminder payload shapes exactly — a backend field rename should fail
 * the frontend build, not production.
 */

export const NOTIFICATION_TYPES = [
  'deadline_reminder',
  'application_update',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** GET /api/v1/notifications → data.notifications[] (NotificationResource). */
export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

/** GET /api/v1/notifications — list + badge count in one round trip. */
export type NotificationsResponse = {
  notifications: AppNotification[];
  unread_count: number;
};

/** PATCH /notifications/{id}/read response. */
export type MarkReadResponse = {
  notification: AppNotification;
  unread_count: number;
};

/** Reminder row as returned by POST /jobs/{job}/reminders. */
export type Reminder = {
  id: number;
  job_id?: number;
  notification_days: number;
  reminder_date: string | null;
  status: 'pending' | 'sent' | 'dismissed' | 'failed';
  sent_at: string | null;
  created_at: string;
};

/** POST /jobs/{job}/reminders — created/updated reminder + full job list. */
export type SaveReminderResult = {
  reminder: Reminder;
  reminders: Reminder[];
};

/** Day offsets offered by the job reminder UI (Part 9). */
export const REMINDER_DAY_OPTIONS = [1, 3, 5, 7] as const;

export type ReminderDays = (typeof REMINDER_DAY_OPTIONS)[number];