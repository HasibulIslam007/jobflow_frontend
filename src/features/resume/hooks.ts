'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getResume,
  getResumes,
  matchResumeToJob,
  uploadResume,
} from '@/features/resume/resume.service';
import type { Resume } from '@/features/resume/types';
import { dashboardQueryKey } from '@/features/dashboard/hooks';
import { jobsQueryKey } from '@/features/jobs/hooks';
import { ApiError } from '@/lib/api';

export const resumesQueryKey = ['resumes'] as const;

export function resumeDetailKey(id: number) {
  return [...resumesQueryKey, 'detail', id] as const;
}

export function resumeMatchKey(jobId: number, resumeId: number) {
  return [...resumesQueryKey, 'match', jobId, resumeId] as const;
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

/**
 * Resume changes affect the resume list/detail, the job detail (match
 * card) and dashboard rollups — invalidate all four after each mutation
 * (upload, analysis completion, match generation).
 */
function invalidateRelatedCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: resumesQueryKey });
  queryClient.invalidateQueries({ queryKey: jobsQueryKey });
  queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
}

export function useResumes() {
  return useQuery({
    queryKey: resumesQueryKey,
    queryFn: getResumes,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useResume(id: number, enabled = true) {
  return useQuery({
    queryKey: resumeDetailKey(id),
    queryFn: () => getResume(id),
    staleTime: 30_000,
    retry: 1,
    enabled,
  });
}

/**
 * Upload a resume PDF — backend runs extraction + AI analysis inline.
 * A 201 with `meta.error` still means "uploaded but analysis failed";
 * the resume lands in `failed` status and we surface the reason.
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      title,
      onUploadProgress,
    }: {
      file: File;
      title?: string;
      onUploadProgress?: (percent: number) => void;
    }) => uploadResume(file, title, onUploadProgress),
    onSuccess: (result) => {
      invalidateRelatedCaches(queryClient);

      if (result.resume.status === 'completed') {
        toast.success(`“${result.resume.title}” analyzed — AI score ${result.resume.ai_score}/100.`);
      } else if (result.resume.status === 'failed') {
        toast.error(result.error || 'The resume uploaded, but AI analysis failed.');
      } else {
        toast.success('Resume uploaded.');
      }
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not upload the resume.'));
    },
  });
}

/**
 * Generate (or regenerate) the resume ↔ job match. The result is cached
 * per (job, resume) pair so navigating back shows it without a re-run.
 */
export function useMatchResume(jobId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resumeId: number) => matchResumeToJob(jobId, resumeId),
    onSuccess: (match) => {
      queryClient.setQueryData(
        resumeMatchKey(jobId, match.resume_id),
        match,
      );
      invalidateRelatedCaches(queryClient);
      toast.success(`Match generated — ${match.match_score}% fit.`);
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not generate the match.'));
    },
  });
}

/**
 * Cached match for a (job, resume) pair — read-only. The query never
 * fetches on its own (`enabled: false`); data lands here via
 * useMatchResume's `setQueryData`, so navigating back shows the last
 * generated match without re-running the AI.
 */
export function useResumeMatch(jobId: number, resumeId: number) {
  return useQuery({
    queryKey: resumeMatchKey(jobId, resumeId),
    queryFn: () => matchResumeToJob(jobId, resumeId),
    staleTime: Infinity,
    retry: 1,
    enabled: false,
  });
}

/** Best completed resume for quick "match with my latest resume" flows. */
export function primaryResume(resumes: Resume[] | undefined): Resume | undefined {
  return resumes?.find((resume) => resume.status === 'completed');
}
