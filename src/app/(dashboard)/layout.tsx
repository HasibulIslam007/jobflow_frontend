'use client';

import type { ReactNode } from 'react';

import { RequireAuth } from '@/components/auth-guard';
import { AppShell } from '@/components/layout/app-shell';

/**
 * Authenticated workspace routes.
 *
 * The `(dashboard)` segment is a route group: it does not appear in the
 * URL, so /dashboard, /jobs, /jobs/create, /jobs/[id] and /resume keep
 * exactly the paths they had before this group existed.
 *
 * The gate and the shell live here rather than in each page, so route
 * components stay pure content and there is exactly one <main> landmark
 * and one scroll container for the whole workspace.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
