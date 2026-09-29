import axios, { AxiosError, type AxiosInstance } from "axios";

import { env } from "@/lib/env";
import type { ApiErrorPayload } from "@/types/api";

/**
 * Normalised API failure. Components branch on `code` (never on message text):
 *   quota_exceeded  → upgrade prompt
 *   validation_failed → field errors (see `errors`)
 *   unauthenticated → redirect to /login
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly errors?: Record<string, string[]>,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Single Axios instance for the Laravel API.
 *
 * - `withCredentials` sends the Sanctum session cookie (SPA cookie auth).
 * - Axios reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN` automatically
 *   once `ensureCsrfCookie()` has been called before a mutating request.
 * - `X-Request-Id` correlates browser requests with API logs (docs/02-architecture.md §9).
 */
export const http: AxiosInstance = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  withCredentials: true,
  timeout: 20_000,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  // The API is a different origin (localhost:8000) from the app (localhost:3000),
  // so axios treats every call as cross-origin. Since axios 1.6 it only reads the
  // XSRF-TOKEN cookie and sends X-XSRF-TOKEN for same-origin requests, unless
  // withXSRFToken is set — without it, POST /auth/register fails with
  // "CSRF token mismatch". Explicitly opt in, and pin the cookie/header names
  // to Laravel's defaults so this never silently drifts.
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/**
 * Per-request timeout for calls that make the server wait on an AI provider.
 *
 * The instance default (20s) is right for ordinary CRUD: failing fast is
 * better than leaving a spinner. It is wrong for AI work, where the server
 * legitimately blocks. A text-layer-less PDF costs TWO round trips — a vision
 * read (OCR_TIMEOUT, default 60s) then a structured extraction
 * (AI_TIMEOUT, default 30s) — so a realistic worst case is ~90s.
 *
 * Without this the browser aborts at 20s while the server keeps working: the
 * user sees a network error for a job that may still be created a second
 * later, and the AI quota is spent on a response nobody reads.
 *
 * 120s is the ceiling, not the expectation: the two provider timeouts plus
 * upload time still bound the request server-side, so this only has to sit
 * above them.
 */
export const AI_REQUEST_TIMEOUT_MS = 120_000;

http.interceptors.request.use((config) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    config.headers.set("X-Request-Id", crypto.randomUUID());
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;

    const apiError = new ApiError(
      status,
      payload?.code ?? "network_error",
      payload?.message ?? error.message,
      payload?.errors,
      payload?.meta?.request_id,
    );

    // `/auth/me` returns 401 for an expected guest session, and login can
    // return 401 for invalid credentials. Only protected API requests signal
    // that an already-authenticated session expired.
    const requestUrl = error.config?.url ?? "";
    const isAuthRequest = requestUrl.startsWith("/auth/");

    if (status === 401 && !isAuthRequest && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("jobflow:unauthenticated"));
    }

    return Promise.reject(apiError);
  },
);

/**
 * Bootstrap the Sanctum CSRF cookie. Call once before the first mutating
 * request of a session (login, register, password reset).
 */
export async function ensureCsrfCookie(): Promise<void> {
  await axios.get(`${env.apiUrl}/sanctum/csrf-cookie`, { withCredentials: true });
}
