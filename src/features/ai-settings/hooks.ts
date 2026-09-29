'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  deleteAiKey,
  getAiSettings,
  testAiKey,
  updateAiSettings,
} from '@/features/ai-settings/ai-settings.service';
import type {
  AiSettings,
  TestAiKeyInput,
  UpdateAiSettingsInput,
} from '@/features/ai-settings/types';
import { ApiError } from '@/lib/api';

export const aiSettingsQueryKey = ['settings', 'ai'] as const;

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    // A 422 from these endpoints always carries a per-field reason, which is
    // far more useful than the generic envelope message.
    const first = error.errors ? Object.values(error.errors)[0]?.[0] : undefined;

    return first || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

/**
 * Safe AI configuration. The payload can never contain a usable key — only
 * `configured`, `enabled` and a four-character hint.
 */
export function useAiSettings() {
  return useQuery({
    queryKey: aiSettingsQueryKey,
    queryFn: getAiSettings,
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * Save the mode and/or a Gemini key.
 *
 * The API key is write-only: it is sent in the request body and is NOT placed
 * into the React Query cache. The cache is only ever updated from the server's
 * response, which contains a hint rather than the key — so a stale cache
 * dump, a devtools inspection or a persist middleware can never surface it.
 */
export function useUpdateAiSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAiSettingsInput) => updateAiSettings(input),
    onSuccess: (settings: AiSettings) => {
      queryClient.setQueryData(aiSettingsQueryKey, settings);
      toast.success(
        settings.configured ? 'Gemini API key saved.' : 'AI settings updated.',
      );
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not save your AI settings.'));
    },
  });
}

/**
 * Verify a key. Accepts a draft key to test before saving, or tests the saved
 * one when called with no argument.
 */
export function useTestAiKey() {
  return useMutation({
    mutationFn: (input: TestAiKeyInput = {}) => testAiKey(input),
    onSuccess: () => {
      toast.success('Gemini API key verified.');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not verify that key.'));
    },
  });
}

export function useDeleteAiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAiKey,
    onSuccess: (result) => {
      queryClient.setQueryData(aiSettingsQueryKey, result.settings);
      toast.success(result.message);
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Could not remove your key.'));
    },
  });
}

export { resolveErrorMessage };
