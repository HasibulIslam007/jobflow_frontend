'use client';

import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/empty-state';
import { JobEmpty } from '@/features/jobs/components/job-empty';
import {
  JobFilters,
  type JobsFilterValue,
} from '@/features/jobs/components/job-filters';
import { JobList, JobStatusBoard } from '@/features/jobs/components/job-list';
import { JobListSkeleton } from '@/features/jobs/components/job-skeleton';
import { useJobs } from '@/features/jobs/hooks';
import { ApiError } from '@/lib/api';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/**
 * /jobs — "My Jobs" pipeline screen. Status pills filter server-side
 * (GET /jobs?status=); free-text search filters title/company/location
 * client-side (the API exposes no search param). List/board views share
 * the same JobCard; board groups visually by status.
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
    data,
  } = useJobs({ status: filters.status, search: debouncedSearch });

  const total = data?.pagination.total ?? jobs.length;
  const hasActiveFilter = filters.search.trim() !== '' || filters.status !== 'all';

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Could not load your jobs.';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="JobFlow AI · Jobs"
        title="My Jobs"
        description={
          <>
            Track every opportunity in one place
            {total > 0 && (
              <span className="tabular-nums"> · {total} total</span>
            )}
          </>
        }
      />

      <JobFilters value={filters} onChange={setFilters} />

      {isPending ? (
        <JobListSkeleton />
      ) : isError ? (
        <ErrorState
          title="Could not load your jobs"
          description={errorMessage}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : jobs.length === 0 ? (
        <JobEmpty
          title={hasActiveFilter ? 'No matching jobs' : 'No jobs yet'}
          description={
            hasActiveFilter
              ? 'No jobs match your current search and filters.'
              : 'Add your first opportunity and let AI organize it.'
          }
          showSearchHint={hasActiveFilter}
        />
      ) : filters.view === 'board' ? (
        <JobStatusBoard jobs={jobs} />
      ) : (
        <JobList jobs={jobs} />
      )}
    </div>
  );
}

export default function JobsPage() {
  return <JobsContent />;
}
