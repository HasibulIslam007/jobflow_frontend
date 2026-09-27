"use client";

import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/services/health.service";

export const healthQueryKey = ["health"] as const;

/**
 * TanStack Query hook — the pattern every resource hook follows from Phase 1:
 * thin wrapper over a service function, with a central query key.
 */
export function useHealth() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: getHealth,
    staleTime: 30_000,
    retry: 1,
  });
}
