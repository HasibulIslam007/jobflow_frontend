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
 * Single Axios instance for the Laravel API. Authentication is carried in a
 * Sanctum personal access token stored locally in the browser.
 */
export const http: AxiosInstance = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  timeout: 20_000,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

const AUTH_TOKEN_STORAGE_KEY = "jobflow.access_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

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
  const token = getStoredToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

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

    // An anonymous /auth/me probe is expected to return 401. A stored token
    // turning 401 is different: it is an expired or revoked session.
    const requestUrl = error.config?.url ?? "";
    const isAuthRequest = requestUrl.startsWith("/auth/");
    const isSessionProbe = requestUrl === "/auth/me";

    if (
      status === 401 &&
      (!isAuthRequest || isSessionProbe) &&
      getStoredToken() &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new CustomEvent("jobflow:unauthenticated"));
    }

    return Promise.reject(apiError);
  },
);

