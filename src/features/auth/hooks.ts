'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getMe, login, logout, register } from '@/features/auth/auth.service';
import { ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginInput, RegisterInput } from '@/types/auth';

export const sessionQueryKey = ['session'] as const;

/**
 * Session hydration query. On success the Zustand snapshot is synced;
 * on 401 the snapshot is cleared (guest). `retry: false` so a logged-out
 * visitor doesn't hammer /auth/me.
 */
export function useSession() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      try {
        const user = await getMe();
        setUser(user);

        return user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearUser();

          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (payload) => {
      setUser(payload.user);
      queryClient.setQueryData(sessionQueryKey, payload.user);
      toast.success('Account created — welcome to JobFlow AI.');
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Registration failed.'));
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (payload) => {
      setUser(payload.user);
      queryClient.setQueryData(sessionQueryKey, payload.user);
      toast.success('Welcome back.');
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Login failed.'));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser();
      queryClient.removeQueries({ queryKey: sessionQueryKey });
      toast.success('Signed out.');
      router.push('/login');
    },
    onError: (error: unknown) => {
      toast.error(resolveErrorMessage(error, 'Logout failed.'));
    },
  });
}
