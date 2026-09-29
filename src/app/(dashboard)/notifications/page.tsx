'use client';

import { FadeIn } from '@/components/ui/motion';
import { PageHeader } from '@/components/ui/page-header';
import { NotificationPage } from '@/features/notifications/components/notification-page';

/**
 * /notifications — the full notification history.
 *
 * The bell dropdown is the fast path (latest handful, one click to clear);
 * this page is the place to actually read and filter everything the daily
 * generator has produced. Both read the same query, so they can never show
 * two different truths.
 */
export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Stay on top"
        title="Notifications"
        description="Deadlines, follow-ups, interview prep and AI insights — all generated from your own records."
      />

      <FadeIn>
        <NotificationPage />
      </FadeIn>
    </div>
  );
}
