/**
 * API response contract mirrors docs/04-api.md §1.1–1.2.
 *
 * NOTE (Phase 1): these hand-written types are replaced by types generated from
 * the API's OpenAPI document (`npm run types:api`) so a backend field rename
 * fails the frontend build instead of production.
 */

export type ApiMeta = {
  request_id?: string;
  generated_at?: string;
  [key: string]: unknown;
};

export type ApiEnvelope<TData> = {
  data: TData;
  meta: ApiMeta;
};

export type ApiErrorPayload = {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
  meta?: ApiMeta;
};

/** GET /api/v1/health */
export type HealthStatus = {
  status: "ok" | "degraded";
  checks: {
    database: boolean;
    cache: boolean;
  };
  environment: string;
};
