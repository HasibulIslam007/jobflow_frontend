'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '@/features/dashboard/dashboard.service';

export const dashboardQueryKey = ['dashboard'] as const;

/**
 * Dashboard aggregate query — the single source of truth for the
 * dashboard screen. 30s freshness; manual refresh via `refetch()`.
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: getDashboard,
    staleTime: 30_000,
    retry: 1,
  });
}
