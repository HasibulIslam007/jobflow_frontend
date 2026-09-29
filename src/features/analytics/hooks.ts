'use client';

import { useQuery } from '@tanstack/react-query';

import { getAnalytics } from '@/features/analytics/analytics.service';

export const analyticsQueryKey = ['analytics'] as const;

/**
 * Career analytics aggregate query — the single source of truth for the
 * /analytics screen.
 *
 * 30s freshness, matching the dashboard. The payload changes whenever the user
 * records an application, uploads a resume or runs a match; those mutations
 * invalidate their own feature's keys, so this deliberately does not subscribe
 * to them — the user refreshes when they want fresh numbers.
 */
export function useAnalytics() {
  return useQuery({
    queryKey: analyticsQueryKey,
    queryFn: getAnalytics,
    staleTime: 30_000,
    retry: 1,
  });
}
