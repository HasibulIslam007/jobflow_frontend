'use client';

import Link from 'next/link';
import { AlertTriangleIcon, GraduationCapIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { SkillGap, SkillImportance } from '@/features/analytics/types';
import { cn } from 'cn';

/**
 * SKILL GAPS — what the user's saved jobs want that their resume does not list.
 *
 * Every row is anchored to a real number ("in 12 of your saved jobs"), so the
 * card stays auditable: a user can open the jobs list and check.
 */
export function SkillGapCard({ skillGaps }: { skillGaps: SkillGap[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <h2 className="text-section-title font-heading text-foreground">
          Skills to improve
        </h2>
        <p className="mt-0.5 text-caption text-pretty text-muted-foreground">
          {skillGaps.length > 0
            ? 'Required by the jobs you saved, but missing from your resume.'
            : 'Compared against the skills your analysed resumes already list.'}
        </p>
      </CardHeader>

      <CardContent>
        {skillGaps.length === 0 ? (
          <EmptyState
            icon={GraduationCapIcon}
            title="No skill gaps detected"
            description={
              'Either your resume already covers what your saved jobs require, or there are not enough analysed jobs yet to compare. Add skills to your jobs and upload a resume to get a real comparison.'
            }
            className="border-0 py-2"
            action={
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/jobs" />}
                nativeButton={false}
              >
                Review jobs
              </Button>
            }
          />
        ) : (
          <>
            <ul className="space-y-2.5">
              {skillGaps.map((gap) => (
                // Plain <li> rather than a motion wrapper: StaggerItem renders
                // a <div>, which is not a valid child of <ul>.
                <li
                  key={gap.skill}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-caption font-medium text-foreground">
                      {gap.skill}
                    </p>
                    <p className="mt-0.5 text-micro text-muted-foreground">
                      Required by {gap.frequency} of your saved jobs
                    </p>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2 py-0.5 text-micro font-medium',
                      IMPORTANCE_STYLE[gap.importance],
                    )}
                  >
                    {IMPORTANCE_LABEL[gap.importance]}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex gap-2 rounded-lg border border-ai/25 bg-ai/[0.04] px-3 py-2.5 text-micro text-pretty text-muted-foreground">
              <AlertTriangleIcon className="mt-px size-3.5 shrink-0 text-ai" aria-hidden="true" />
              <span>
                Importance is measured against your own saved jobs: a skill
                wanted by most of them is high, no matter how small the absolute
                number is.
              </span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const IMPORTANCE_LABEL: Record<SkillImportance, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const IMPORTANCE_STYLE: Record<SkillImportance, string> = {
  high: 'border-destructive/30 bg-destructive/10 text-destructive',
  medium: 'border-warning/30 bg-warning/10 text-warning',
  low: 'border-border bg-muted text-muted-foreground',
};
