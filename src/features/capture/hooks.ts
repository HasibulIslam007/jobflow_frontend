'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  createFileCapture,
  createTextCapture,
  createUrlCapture,
} from '@/features/capture/capture.service';
import type { CaptureType } from '@/features/capture/types';
import { dashboardQueryKey } from '@/features/dashboard/hooks';
import { jobsQueryKey } from '@/features/jobs/hooks';
import { ApiError } from '@/lib/api';

/**
 * Friendly copy for capture failures. 422 with field errors is handled
 * by the form components; this covers the mutation-level toast.
 */
export function captureErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      return 'Please check your input and try again.';
    }
    if (error.status === 429) {
      return 'Too many captures. Please wait a moment and try again.';
    }

    return error.message || 'AI could not understand this job post. Try adding more details.';
  }

  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function useInvalidateAfterCapture() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: jobsQueryKey });
    queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
  };
}

export function useCreateTextCapture() {
  const invalidate = useInvalidateAfterCapture();

  return useMutation({
    mutationFn: (content: string) => createTextCapture(content),
    onSuccess: () => invalidate(),
    onError: (error: unknown) => {
      toast.error(captureErrorMessage(error));
    },
  });
}

export function useCreateUrlCapture() {
  const invalidate = useInvalidateAfterCapture();

  return useMutation({
    mutationFn: (url: string) => createUrlCapture(url),
    onSuccess: () => invalidate(),
    onError: (error: unknown) => {
      toast.error(captureErrorMessage(error));
    },
  });
}

export function useCreateFileCapture() {
  const invalidate = useInvalidateAfterCapture();
  const [progress, setProgress] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      type,
      file,
    }: {
      type: Extract<CaptureType, 'pdf' | 'image'>;
      file: File;
    }) => createFileCapture(type, file, (percent) => setProgress(percent)),
    onSuccess: () => invalidate(),
    onError: (error: unknown) => {
      toast.error(captureErrorMessage(error));
    },
    onSettled: () => setProgress(null),
  });

  return { ...mutation, progress };
}

/** Back-compat aggregate for screens that switch on capture type. */
export function useCreateCapture() {
  const text = useCreateTextCapture();
  const url = useCreateUrlCapture();
  const file = useCreateFileCapture();

  return { text, url, file };
}
