'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { PageLoading } from '@/components/loading';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Client-side route gate. Server middleware cannot validate the browser's
 * bearer token, so protection happens here after session hydration.
 *
 * Guests are redirected to /login?next=<path>; while the session
 * resolves a loading screen is shown instead of flashing content.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/dashboard';
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <PageLoading label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
