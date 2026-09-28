'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { PageLoading } from '@/components/loading';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Inverse of RequireAuth: keeps authenticated users out of /login
 * and /register (no signed-in user should see a sign-in form).
 */
export function RequireGuest({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <PageLoading label="Checking your session…" />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
