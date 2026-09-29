/**
 * Notification domain types. Mirror the Laravel NotificationResource /
 * reminder payload shapes exactly — a backend field rename should fail
 * the frontend build, not production.
 */

export const NOTIFICATION_TYPES = [
  // Phase 5.7
  'deadline_reminder',
  'application_update',
  'system',
  // Phase 6.9 — produced by the notification generators from real activity.
  'follow_up',
  'interview',
  'resume',
  'ai_insight',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Phase 6.9 generator types, grouped for the notification page's filters. */
export const INSIGHT_NOTIFICATION_TYPES = [
  'ai_insight',
  'resume',
] as const satisfies readonly NotificationType[];

export const DEADLINE_NOTIFICATION_TYPES = [
  'deadline_reminder',
] as const satisfies readonly NotificationType[];

/** GET /api/v1/notifications → data.notifications[] (NotificationResource). */
export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  /** Frontend route the bell deep-links to; null when there is nowhere to go. */
  action_url: string | null;
  /** Structured context from the generator, e.g. { job_id, days_left }. */
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

/** GET /api/v1/notifications — list + badge count in one round trip. */
export type NotificationsResponse = {
  notifications: AppNotification[];
  unread_count: number;
};

/** GET /api/v1/notifications/unread-count. */
export type UnreadCountResponse = {
  unread_count: number;
};

/** PATCH /notifications/{id}/read response. */
export type MarkReadResponse = {
  notification: AppNotification;
  unread_count: number;
};

/** PATCH /notifications/read-all response. */
export type MarkAllReadResponse = {
  message: string;
  /** Rows actually changed — 0 is a legitimate "nothing was unread" answer. */
  marked: number;
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