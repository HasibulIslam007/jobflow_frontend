'use client';

import { useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useSession } from '@/features/auth/hooks';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Hydrates auth state once per app load and keeps the Zustand snapshot
 * in sync with the session query. Listens for the global
 * `jobflow:unauthenticated` broadcast (fired by the Axios 401 interceptor)
 * so an expired session signs the user out with a toast instead of a
 * hard reload.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { isError } = useSession();
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const handleUnauthenticated = () => {
      clearUser();
      toast.error('Your session expired. Please sign in again.');
    };

    window.addEventListener('jobflow:unauthenticated', handleUnauthenticated);

    return () => {
      window.removeEventListener(
        'jobflow:unauthenticated',
        handleUnauthenticated,
      );
    };
  }, [clearUser]);

  useEffect(() => {
    if (isError) {
      // Non-401 session failures (network down, 5xx) keep the guest
      // snapshot without spamming toasts on every mount.
      clearUser();
    }
  }, [isError, clearUser]);

  return <>{children}</>;
}
