'use client';

import {
  AiCareerInsight,
  AiCareerInsightSkeleton,
} from '@/features/dashboard/components/ai-career-insight';
import { CareerMetrics, CareerMetricsSkeleton } from '@/features/dashboard/components/career-metrics';
import {
  CareerScoreCard,
  CareerScoreCardSkeleton,
} from '@/features/dashboard/components/career-score-card';
import { DashboardActions } from '@/features/dashboard/components/dashboard-actions';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import {
  DeadlineTimeline,
  DeadlineTimelineSkeleton,
} from '@/features/dashboard/components/deadline-timeline';
import {
  RecentActivity,
  RecentActivitySkeleton,
} from '@/features/dashboard/components/recent-activity';
import { useDashboard } from '@/features/dashboard/hooks';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/empty-state';
import { RefreshCwIcon } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { useAuthStore } from '@/stores/auth-store';
import { ApiError } from '@/lib/api';

/**
 * AI Career Command Center.
 *
 * One aggregate request (GET /api/v1/dashboard) drives the whole screen;
 * the hook is unchanged. Layout intent, reading top to bottom:
 *   1. where am I (header)   2. how big is the pipeline (metrics)
 *   3. what is about to bite (deadlines + health)
 *   4. what has AI been doing (activity + insight)
 *   5. what can I do next (actions)
 *
 * Session actions (sign out) and notifications are owned by the app shell
 * and are intentionally not repeated here.
 */
function DashboardContent() {
  const user = useAuthStore((state) => state.user);
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
      <DashboardHeader
        name={user?.name ?? null}
        isRefreshing={isFetching}
        onRefresh={() => refetch()}
        disabled={isPending || isFetching}
      />

      {isPending ? (
        <>
          <CareerMetricsSkeleton />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DeadlineTimelineSkeleton />
            </div>
            <CareerScoreCardSkeleton />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivitySkeleton />
            </div>
            <AiCareerInsightSkeleton />
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
          <CareerMetrics stats={data.stats} />

          <div className="grid gap-6 lg:grid-cols-3">
            <FadeIn className="lg:col-span-2">
              <DeadlineTimeline deadlines={data.upcoming_deadlines} />
            </FadeIn>
            <FadeIn delay={0.05}>
              <CareerScoreCard insights={data.ai_insights} />
            </FadeIn>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <FadeIn className="lg:col-span-2">
              <RecentActivity captures={data.recent_captures} />
            </FadeIn>
            <FadeIn delay={0.05}>
              <AiCareerInsight insights={data.ai_insights} />
            </FadeIn>
          </div>

          <FadeIn delay={0.05}>
            <DashboardActions />
          </FadeIn>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}


