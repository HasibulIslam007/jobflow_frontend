/**
 * Spec-required Axios entry point for Phase 5.1.
 *
 * Single-instance rule: this module re-exports the canonical client from
 * `@/services/http` so interceptors (bearer auth, ApiError normalization,
 * X-Request-Id, 401 broadcast) stay in exactly one place.
 */

export { ApiError, clearAuthToken, http, setAuthToken } from '@/services/http';
export { http as api } from '@/services/http';
