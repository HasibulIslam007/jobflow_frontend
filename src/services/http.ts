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
});

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

    // Session expired while the user was active — let the auth layer decide
    // (Phase 1 wires this to a redirect + toast instead of a hard reload).
    if (status === 401 && typeof window !== "undefined") {
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
