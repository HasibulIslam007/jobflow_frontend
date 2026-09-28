import Link from 'next/link';
import { PartyPopperIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatConfidence, StatusBadge } from '@/features/jobs/components/job-card';
import type { CaptureResult } from '@/features/capture/types';

/**
 * Success screen: rendered ONLY from the real `meta.job` payload.
 * Title/company/confidence/quality come from the created Job —
 * nothing is invented here.
 */
export function CaptureSuccess({
  result,
  onReset,
}: {
  result: CaptureResult;
  onReset: () => void;
}) {
  const job = result.job;

  return (
    <Card className="border-emerald-500/20 shadow-sm">
      <CardHeader className="items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <PartyPopperIcon className="size-5" aria-hidden="true" />
        </span>
        <CardTitle>Job created successfully</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {job ? (
          <div className="w-full space-y-2 rounded-xl bg-muted/50 px-4 py-3 text-center">
            <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
            <p className="text-base font-semibold tracking-tight">{job.title}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <StatusBadge status={job.status} />
              <Badge variant="outline" className="tabular-nums">
                AI {formatConfidence(job.ai_confidence_score)}
              </Badge>
              <Badge variant="outline" className="tabular-nums">
                Quality {job.job_quality_score ?? '—'}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Capture #{result.capture.id} completed.
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {job ? (
            <Button size="sm" render={<Link href={`/jobs/${job.id}`} />} nativeButton={false}>
              View Job
            </Button>
          ) : (
            <Button size="sm" render={<Link href="/jobs" />} nativeButton={false}>
              View Jobs
            </Button>
          )}
          <Button size="sm" variant="outline" render={<Link href="/dashboard" />} nativeButton={false}>
            Go Dashboard
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset}>
            Add Another Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
