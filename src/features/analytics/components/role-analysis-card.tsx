'use client';

import Link from 'next/link';
import { BriefcaseIcon, CompassIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { TopRole } from '@/features/analytics/types';

/**
 * TOP ROLES — the job titles the user actually saves, grouped so that
 * "Backend Developer" and "Backend Engineer" count as one bucket.
 *
 * The label shown is the normalised role the API returns, not a raw stored
 * title, so a user who saved the same role five different ways still sees one
 * honest number instead of five one-off rows.
 */
export function RoleAnalysisCard({ topRoles }: { topRoles: TopRole[] }) {
  const peak = Math.max(1, ...topRoles.map((role) => role.count));

  return (
    <Card className="h-full">
      <CardHeader>
        <h2 className="text-section-title font-heading text-foreground">
          Top roles
        </h2>
        <p className="mt-0.5 text-caption text-pretty text-muted-foreground">
          What you have been saving. Similar titles are grouped together.
        </p>
      </CardHeader>

      <CardContent>
        {topRoles.length === 0 ? (
          <EmptyState
            icon={CompassIcon}
            title="No roles yet"
            description="Save a few jobs and the roles you are targeting will be grouped and ranked here."
            className="border-0 py-2"
            action={
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/jobs" />}
                nativeButton={false}
              >
                Browse jobs
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {topRoles.map((role) => (
              <li key={role.role} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <BriefcaseIcon
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="truncate text-caption text-foreground">
                      {role.role}
                    </span>
                  </span>
                  <span
                    data-tabular="true"
                    className="shrink-0 text-caption text-muted-foreground"
                  >
                    {role.count}
                    <span> · {role.share}%</span>
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={role.count}
                  aria-valuemin={0}
                  aria-valuemax={peak}
                  aria-label={`${role.role}: ${role.count} saved jobs`}
                  className="h-2 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-ai/70 transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.round((role.count / peak) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
