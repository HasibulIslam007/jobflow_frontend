'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';

import {
  deleteJob,
  getJob,
  getJobs,
  updateJob,
} from '@/features/jobs/jobs.service';
import type {
  JobsQueryParams,
  UpdateJobInput,
} from '@/features/jobs/types';
import { ApiError } from '@/lib/api';
import { dashboardQueryKey } from '@/features/dashboard/hooks';

export const jobsQueryKey = ['jobs'] as const;

export function jobsListKey(params: JobsQueryParams) {
  return [...jobsQueryKey, 'list', params] as const;
}

export function jobDetailKey(id: number) {
  return [...jobsQueryKey, 'detail', id] as const;
}

/**
 * Client-side free-text filter. The backend exposes status/company/location
 * filters only, so `search` spans title+company+location in memory.
 */
function filterJobsBySearch<T extends { title: string; company: string; location: string | null }>(
  jobs: T[],
  search: string | undefined,
): T[] {
  const needle = search?.trim().toLowerCase();

  if (!needle) {
    return jobs;
  }

  return jobs.filter((job) =>
    [job.title, job.company, job.location ?? '']
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function invalidateJobCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: jobsQueryKey });
  queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
}

export function useJobs(params: JobsQueryParams = {}) {
  const { search, ...serverParams } = params;

  const query = useQuery({
    queryKey: jobsListKey(params),
    queryFn: () => getJobs({ ...serverParams, per_page: params.per_page ?? 50 }),
    staleTime: 30_000,
    retry: 1,
  });

  const jobs = useMemo(
    () => filterJobsBySearch(query.data?.jobs ?? [], search),
    [query.data, search],
  );

  return { ...query, jobs };
}

export function useJob(id: number) {
  return useQuery({
    queryKey: jobDetailKey(id),
    queryFn: () => getJob(id),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useUpdateJob(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateJobInput) => updateJob(id, input),
    onSuccess: (job) => {
      queryClient.setQueryData(jobDetailKey(id), job);
      invalidateJobCaches(queryClient);
      toast.success('Job updated.');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not update the job.'));
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: jobDetailKey(id) });
      invalidateJobCaches(queryClient);
      toast.success('Job deleted.');
      router.push('/jobs');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not delete the job.'));
    },
  });
}
