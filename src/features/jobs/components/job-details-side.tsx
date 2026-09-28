import { SparklesIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatConfidence } from '@/features/jobs/components/job-card';
import type { Job } from '@/features/jobs/types';

/**
 * Right column: skills + AI analysis. Applications/Reminders were moved
 * out in Phase 5.5 — applications render as the ApplicationPanel in the
 * main column and reminders via ReminderCard below this sidebar.
 */
export function JobDetailsSide({ job }: { job: Job }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Extracted by AI from the original posting.</CardDescription>
        </CardHeader>
        <CardContent>
          {job.skills && job.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.skill_name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills extracted.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-indigo-500/20 bg-indigo-500/[0.04] shadow-sm dark:border-indigo-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-indigo-500" aria-hidden="true" />
            AI analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-semibold tabular-nums">
              {formatConfidence(job.ai_confidence_score)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quality</span>
            <span className="font-semibold tabular-nums">
              {job.job_quality_score !== null ? `${job.job_quality_score}/100` : '—'}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground">Missing fields</p>
            {job.missing_fields.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.missing_fields.map((field) => (
                  <Badge key={field} variant="outline">
                    {field}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                Complete profile
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
