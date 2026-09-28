import { ensureCsrfCookie, http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type {
  AuthPayload,
  LoginInput,
  MePayload,
  RegisterInput,
  User,
} from '@/types/auth';

/**
 * Authentication service — thin wrappers over the Laravel Sanctum SPA
 * endpoints. Every mutating call bootstraps the CSRF cookie first;
 * `http` already sends `withCredentials` + X-XSRF-TOKEN automatically.
 */

export async function register(input: RegisterInput): Promise<AuthPayload> {
  await ensureCsrfCookie();
  const { data } = await http.post<ApiEnvelope<AuthPayload>>(
    '/auth/register',
    input,
  );

  return data.data;
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  await ensureCsrfCookie();
  const { data } = await http.post<ApiEnvelope<AuthPayload>>(
    '/auth/login',
    input,
  );

  return data.data;
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const { data } = await http.get<ApiEnvelope<MePayload>>('/auth/me');

  return data.data.user;
}
