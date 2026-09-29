import { http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type { AnalyticsData } from '@/features/analytics/types';

/**
 * GET /api/v1/analytics — career score, application funnel, skill gaps,
 * top roles and deterministic insights in a single round-trip.
 *
 * One request rather than a fan-out: the server already aggregates this in
 * SQL, so recomputing it in the browser would mean pulling every application,
 * job and resume to the client to do arithmetic the database is better at.
 */
export async function getAnalytics(): Promise<AnalyticsData> {
  const { data } = await http.get<ApiEnvelope<AnalyticsData>>('/analytics');

  return data.data;
}
