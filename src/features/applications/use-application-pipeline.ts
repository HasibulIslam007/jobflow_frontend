'use client';

import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { getApplications } from '@/features/applications/applications.service';
import { applicationsListKey } from '@/features/applications/hooks';
import type { Application } from '@/features/applications/types';
import type { Job } from '@/features/jobs/types';
import type { ResumeMatch } from '@/features/resume/types';

/**
 * Application Pipeline data access.
 *
 * WHY THIS FILE EXISTS, AND WHY IT ONLY READS
 * ------------------------------------------
 * The Applications API is job-scoped. The only list endpoint is
 * `GET /jobs/{job}/applications`; there is no `GET /applications`, and
 * `JobController@index` eager-loads `skills` only — so the jobs list does
 * not embed applications either (only `JobController@show` does).
 *
 * A cross-job pipeline therefore has to fan out one request per job. This
 * module does that with `useQueries`, reusing the *existing* service
 * function (`getApplications`) and the *existing* query key
 * (`applicationsListKey`) — no service, hook or backend change. Because the
 * keys are shared, visiting /jobs/[id] first warms this cache, and an
 * application mutation invalidates every fan-out query at once.
 *
 * KNOWN LIMITATION: the request count scales with the number of jobs
 * (`per_page`, capped at 100 by the API), so a workspace with more than 100
 * jobs would silently show a partial pipeline. A single `GET /applications`
 * endpoint would collapse this to one request; that is a backend change and
 * is out of scope here. The page compares the jobs `pagination.total` against
 * the rows loaded and surfaces the truncation explicitly rather than quietly
 * under-reporting.
 */

/** An application joined to the job it belongs to. */
export type ApplicationRow = {
  application: Application;
  job: Job;
};

export function useApplicationRows(
  jobs: Job[],
  { enabled = true }: { enabled?: boolean } = {},
) {
  const jobIds = useMemo(() => jobs.map((job) => job.id), [jobs]);

  const results = useQueries({
    queries: jobIds.map((jobId) => ({
      queryKey: applicationsListKey(jobId),
      queryFn: () => getApplications(jobId),
      staleTime: 30_000,
      retry: 1,
      enabled,
    })),
  });

  const rows = useMemo<ApplicationRow[]>(() => {
    const jobById = new Map(jobs.map((job) => [job.id, job]));
    const collected: ApplicationRow[] = [];

    results.forEach((result, index) => {
      const job = jobById.get(jobIds[index]);

      if (!job || !result.data) {
        return;
      }

      for (const application of result.data) {
        collected.push({ application, job });
      }
    });

    return collected;
  }, [results, jobs, jobIds]);

  const isPending = enabled && jobIds.length > 0 && results.some((r) => r.isPending);
  const isFetching = results.some((r) => r.isFetching);

  // A fan-out fails per job, not wholesale: one job erroring must not throw
  // away the rows that loaded successfully. So the caller gets the count and
  // can decide between "hard error" (nothing loaded) and "partial" (some
  // jobs are missing from the board).
  const failedCount = results.filter((r) => r.isError).length;
  const isError = failedCount > 0;

  return {
    rows,
    isPending,
    isFetching,
    isError,
    failedCount,
    totalCount: jobIds.length,
    refetch: () => {
      void Promise.all(results.map((result) => result.refetch()));
    },
  };
}

/**
 * Highest AI match score per job, for every match generated this session.
 *
 * Mirrors the pattern already used by the resume workspace: `useResumeMatch`
 * is `enabled: false` and only ever holds data written by `useMatchResume`
 * via `setQueryData`, and no endpoint lists a resume's saved matches. So
 * this reads the query cache directly through `useSyncExternalStore` on the
 * cache's event bus, staying reactive as matches are generated.
 *
 * A job with no generated match is simply absent from the map — the card
 * then shows no score rather than a fabricated one.
 */
export function useMatchScoresByJob(): Map<number, number> {
  const queryClient = useQueryClient();
  const lastRef = useRef<{ signature: string; value: Map<number, number> } | null>(
    null,
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(() => onStoreChange()),
    [queryClient],
  );

  const getSnapshot = useCallback(() => {
    const best = new Map<number, number>();

    for (const query of queryClient.getQueryCache().getAll()) {
      if (query.queryKey[1] !== 'match') continue;

      const match = query.state.data as ResumeMatch | undefined;

      if (!match) continue;

      const current = best.get(match.job_id);

      if (current === undefined || match.match_score > current) {
        best.set(match.job_id, match.match_score);
      }
    }

    const signature = [...best.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([jobId, score]) => `${jobId}:${score}`)
      .join('|');

    const cached = lastRef.current;

    if (cached && cached.signature === signature) {
      return cached.value;
    }

    // A fresh Map each time the signature changes, so React re-renders on
    // new matches but never loops on an unchanged cache.
    lastRef.current = { signature, value: best };

    return best;
  }, [queryClient]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
