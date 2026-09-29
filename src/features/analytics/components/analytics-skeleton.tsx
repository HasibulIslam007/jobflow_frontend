'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Page-shaped loading state.
 *
 * Mirrors the real layout's column split and card heights so nothing reflows
 * when the data lands — the single most jarring thing a dashboard can do is
 * jump around while it loads.
 */
export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-8 w-72 rounded" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="mt-2 h-4 w-64 rounded" />
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row">
            <Skeleton className="size-32 shrink-0 rounded-full" />
            <div className="w-full flex-1 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="mt-3 h-7 w-14 rounded" />
                <Skeleton className="mt-3 h-2.5 w-24 rounded" />
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="mt-2 h-3.5 w-56 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="mt-2 h-3.5 w-64 rounded" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="mt-2 h-3.5 w-56 rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <Skeleton className="h-3 w-40 rounded" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-ai/25 bg-ai/[0.04] p-4">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="mt-2 h-3.5 w-72 max-w-full rounded" />
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
