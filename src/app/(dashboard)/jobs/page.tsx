'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/motion';
import { useDashboard } from '@/features/dashboard/hooks';
import type { DashboardStats } from '@/features/dashboard/types';
import { AiJobInsight, AiJobInsightSkeleton } from '@/features/jobs/components/ai-job-insight';
import { JobEmpty, JobNoResults } from '@/features/jobs/components/job-empty';
import { JobKanban } from '@/features/jobs/components/job-kanban';
import {
  JobBoardSkeleton,
  JobListSkeleton,
  JobTableSkeleton,
} from '@/features/jobs/components/job-skeleton';
import { JobStatistics, JobStatisticsSkeleton } from '@/features/jobs/components/job-statistics';
import { JobTable } from '@/features/jobs/components/job-table';
import {
  JobWorkspaceToolbar,
  type JobsFilterValue,
} from '@/features/jobs/components/job-workspace-toolbar';
import { JobsHeader } from '@/features/jobs/components/jobs-header';
import { useJobs } from '@/features/jobs/hooks';
import { ApiError } from '@/lib/api';

const EMPTY_STATS: DashboardStats = {
  total_jobs: 0,
  saved: 0,
  applied: 0,
  interview: 0,
  offer: 0,
  rejected: 0,
};

/**
 * Debounce for the search box. The API has no `search` param, so the
 * filter is applied in memory by `useJobs`; 300ms keeps typing smooth
 * without a request per keystroke.
 */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/**
 * /jobs — the AI Opportunity Workspace.
 *
 * Two queries drive this screen and they answer different questions:
 *   · `useDashboard` → pipeline-wide counts for the statistics row and the
 *     insight panel. `useJobs` is capped by `per_page`, so counting the
 *     visible rows would silently under-report a large pipeline.
 *   · `useJobs`     → the rows themselves, filtered server-side by status
 *     and in memory by search.
 *
 * They are separate TanStack Query caches, and job mutations invalidate
 * both (see `invalidateJobCaches`), so a status change updates the board,
 * the table and the statistics without a refetch chain.
 *
 * View (list/board) lives in local state rather than the URL: it is a
 * presentation preference, and keeping it out of the query string means
 * switching views never remounts the route or refires the jobs request.
 */
function JobsContent() {
  const [filters, setFilters] = useState<JobsFilterValue>({
    search: '',
    status: 'all',
    view: 'list',
  });

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const {
    jobs,
    isPending,
    isError,
    error,
    refetch,
  } = useJobs({ status: filters.status, search: debouncedSearch });

  const {
    data: dashboard,
    isPending: statsPending,
  } = useDashboard();

  const stats = dashboard?.stats ?? EMPTY_STATS;
  const hasActiveFilter =
    filters.search.trim() !== '' || filters.status !== 'all';

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Could not load your jobs.';

  const clearFilters = useMemo(
    () => () => setFilters((prev) => ({ ...prev, search: '', status: 'all' })),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <JobsHeader total={stats.total_jobs} />

      {statsPending ? (
        <JobStatisticsSkeleton />
      ) : (
        <JobStatistics stats={stats} />
      )}

      {/*
        The toolbar stays mounted through loading and error states so the
        user can always change the filter that produced a bad result.
      */}
      <JobWorkspaceToolbar
        value={filters}
        onChange={setFilters}
        resultCount={jobs.length}
      />

      {isPending ? (
        filters.view === 'board' ? (
          <JobBoardSkeleton />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <JobTableSkeleton />
              <JobListSkeleton />
            </div>
            <AiJobInsightSkeleton />
          </div>
        )
      ) : isError ? (
        <ErrorState
          title="Could not load your jobs"
          description={`${errorMessage} Your data is safe — try again in a moment.`}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCwIcon />
              Try again
            </Button>
          }
        />
      ) : jobs.length === 0 ? (
        hasActiveFilter ? (
          <JobNoResults onClear={clearFilters} />
        ) : (
          <JobEmpty />
        )
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            {filters.view === 'board' ? (
              <JobKanban jobs={jobs} />
            ) : (
              <JobTable jobs={jobs} />
            )}
          </div>

          <FadeIn>
            <AiJobInsight stats={stats} jobs={jobs} />
          </FadeIn>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return <JobsContent />;
}
