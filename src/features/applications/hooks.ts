'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from '@/features/applications/applications.service';
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/features/applications/types';
import { dashboardQueryKey } from '@/features/dashboard/hooks';
import { jobsQueryKey } from '@/features/jobs/hooks';
import { ApiError } from '@/lib/api';

export const applicationsQueryKey = ['applications'] as const;

export function applicationsListKey(jobId: number) {
  return [...applicationsQueryKey, jobId] as const;
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

/**
 * Any application change affects the job detail (embedded counts),
 * the jobs lists/board and the dashboard rollups — invalidate all three.
 */
function invalidateRelatedCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
  queryClient.invalidateQueries({ queryKey: jobsQueryKey });
  queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
}

export function useApplications(jobId: number) {
  return useQuery({
    queryKey: applicationsListKey(jobId),
    queryFn: () => getApplications(jobId),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCreateApplication(jobId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateApplicationInput) =>
      createApplication(jobId, input),
    onSuccess: () => {
      invalidateRelatedCaches(queryClient);
      toast.success('Application recorded.');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not record the application.'));
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateApplicationInput;
    }) => updateApplication(id, input),
    onSuccess: () => {
      invalidateRelatedCaches(queryClient);
      toast.success('Application updated.');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not update the application.'));
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteApplication(id),
    onSuccess: () => {
      invalidateRelatedCaches(queryClient);
      toast.success('Application deleted.');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not delete the application.'));
    },
  });
}

/**
 * Pick the most relevant application for a job — the backend returns
 * `latest('id')` first, so index 0 is the current record.
 */
export function currentApplication(
  applications: Application[] | undefined,
): Application | undefined {
  return applications?.[0];
}
