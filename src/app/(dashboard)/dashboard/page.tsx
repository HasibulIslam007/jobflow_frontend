'use client';

import { LogOutIcon, RefreshCwIcon } from 'lucide-react';

import { ButtonSpinner } from '@/components/loading';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/hooks';
import { useAuthStore } from '@/stores/auth-store';
import { ApiError } from '@/lib/api';
import {
  AiInsightCard,
  AiInsightCardSkeleton,
} from '@/features/dashboard/components/ai-insight-card';
import {
  CaptureCard,
  CaptureCardSkeleton,
} from '@/features/dashboard/components/capture-card';
import {
  DeadlineCard,
  DeadlineCardSkeleton,
} from '@/features/dashboard/components/deadline-card';
import { QuickActions } from '@/features/dashboard/components/quick-actions';
import {
  StatsGrid,
  StatsGridSkeleton,
} from '@/features/dashboard/components/stats-card';
import {
  UpcomingActionsCard,
  UpcomingActionsCardSkeleton,
} from '@/features/dashboard/components/upcoming-actions-card';
import { useDashboard } from '@/features/dashboard/hooks';
import { NotificationBell } from '@/features/notifications/components/notification-bell';

/**
 * First real product screen: pipeline stats, deadline focus,
 * capture activity and AI health — all from GET /api/v1/dashboard.
 * Skeleton → data → error/empty states; manual refresh always available.
 */
function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const { mutate: signOut, isPending: isSigningOut } = useLogout();
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboard();

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Could not load your dashboard.';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="JobFlow AI · Dashboard"
        title={
          <>
            Good day{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </>
        }
        description="Here's what needs your attention."
        actions={
          <>
            <NotificationBell />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isPending || isFetching}
            >
              <RefreshCwIcon className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              disabled={isSigningOut}
            >
              {isSigningOut ? <ButtonSpinner /> : <LogOutIcon />}
              Sign out
            </Button>
          </>
        }
      />

      {isPending ? (
        <>
          <StatsGridSkeleton />
          <div className="grid gap-6 lg:grid-cols-2">
            <DeadlineCardSkeleton />
            <CaptureCardSkeleton />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingActionsCardSkeleton />
            <AiInsightCardSkeleton />
          </div>
        </>
      ) : isError || !data ? (
        <ErrorState
          title="Could not load your dashboard"
          description={`${errorMessage} Your jobs are safe — try again in a moment.`}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCwIcon />
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <StatsGrid stats={data.stats} />
          <QuickActions />
          <div className="grid gap-6 lg:grid-cols-2">
            <DeadlineCard deadlines={data.upcoming_deadlines} />
            <CaptureCard captures={data.recent_captures} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingActionsCard
              deadlines={data.upcoming_deadlines}
              interviewCount={data.stats.interview}
            />
            <AiInsightCard insights={data.ai_insights} />
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

