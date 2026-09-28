import { http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type { DashboardData } from '@/features/dashboard/types';

/**
 * GET /api/v1/dashboard — pipeline stats, upcoming deadlines,
 * recent captures and AI insights in a single round-trip.
 */
export async function getDashboard(): Promise<DashboardData> {
  const { data } = await http.get<ApiEnvelope<DashboardData>>('/dashboard');

  return data.data;
}
