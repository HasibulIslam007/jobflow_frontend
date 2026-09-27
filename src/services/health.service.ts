import { http } from "@/services/http";
import type { ApiEnvelope, HealthStatus } from "@/types/api";

/**
 * GET /api/v1/health — dependency status of the API (database, cache).
 * Used by the foundation build to verify that browser → API communication works.
 */
export async function getHealth(): Promise<HealthStatus> {
  const { data } = await http.get<ApiEnvelope<HealthStatus>>("/health");

  return data.data;
}
