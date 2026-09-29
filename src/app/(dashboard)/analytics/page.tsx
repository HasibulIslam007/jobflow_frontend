'use client';

import Link from 'next/link';
import { RefreshCwIcon, SparklesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/motion';
import { PageHeader } from '@/components/ui/page-header';
import { AiInsightCard } from '@/features/analytics/components/ai-insight-card';
import { AnalyticsSkeleton } from '@/features/analytics/components/analytics-skeleton';
import { ApplicationFunnel } from '@/features/analytics/components/application-funnel';
import { CareerScoreCard } from '@/features/analytics/components/career-score-card';
import { RoleAnalysisCard } from '@/features/analytics/components/role-analysis-card';
import { SkillGapCard } from '@/features/analytics/components/skill-gap-card';
import { useAnalytics } from '@/features/analytics/hooks';
import { hasAnalyticsData } from '@/features/analytics/types';
import { ApiError } from '@/lib/api';

/**
 * AI CAREER ANALYTICS (Phase 6.8).
 *
 * One request (GET /api/v1/analytics) drives the whole screen, mirroring how
 * /dashboard works. Reading order, top to bottom on desktop:
 *   1. what is my overall health   (career score + factors)
 *   2. how is the funnel moving    (rates + stage bars)
 *   3. what is blocking me         (skill gaps + target roles)
 *   4. what should I do next       (recommendations)
 *
 * An account with no jobs, resumes or applications gets an empty state that
 * tells it what to do — never a grid of zeroes that read as a failing grade.
 */
function AnalyticsContent() {
  const { data, isPending, isError, error, refetch, isFetching } = useAnalytics();

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Could not load your analytics.';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Career Intelligence"
        title="AI Career Analytics"
        description="Understand your job search performance and improve your opportunities."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isPending || isFetching}
          >
            <RefreshCwIcon aria-hidden="true" />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      {isPending ? (
        <AnalyticsSkeleton />
      ) : isError || !data ? (
        <ErrorState
          title="Could not load your analytics"
          description={`${errorMessage} Your data is safe — try again in a moment.`}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCwIcon aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : !hasAnalyticsData(data) ? (
        <EmptyState
          icon={SparklesIcon}
          title="No analytics yet"
          description="Save a few jobs, upload your resume and record your applications. Your career score, conversion funnel, skill gaps and role breakdown are all calculated from those records — nothing here is estimated."
          action={
            <Button render={<Link href="/jobs" />} nativeButton={false}>
              Start tracking jobs
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <FadeIn>
              <CareerScoreCard careerScore={data.career_score} />
            </FadeIn>

            <FadeIn delay={0.05}>
              <ApplicationFunnel
                pipeline={data.pipeline}
                metrics={data.application_metrics}
              />
            </FadeIn>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FadeIn>
              <SkillGapCard skillGaps={data.skill_gaps} />
            </FadeIn>

            <FadeIn delay={0.05}>
              <RoleAnalysisCard topRoles={data.top_roles} />
            </FadeIn>
          </div>

          <FadeIn delay={0.05}>
            <AiInsightCard insights={data.ai_insights} />
          </FadeIn>
        </>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
