import Link from 'next/link';
import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  CheckIcon,
  MapPinIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  companyMonogram,
  DEADLINE_CLASS,
  deadlineMeta,
  formatConfidence,
  monogramTint,
  StatusBadge,
} from '@/features/jobs/components/job-card';
import type { CaptureResult } from '@/features/capture/types';
import { cn } from 'cn';

/** `2026-03-04` → `4 Mar 2026`. Falls back to the raw value if unparseable. */
function formatDeadline(deadline: string | null): string | null {
  if (!deadline) {
    return null;
  }

  const date = new Date(`${deadline}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? deadline
    : date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

/** One labelled fact about the created opportunity. */
function Fact({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof CalendarIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
      >
        <Icon className="size-3" />
      </span>
      <div className="min-w-0">
        <dt className="text-micro text-muted-foreground">{label}</dt>
        <dd className="text-body text-foreground">{children}</dd>
      </div>
    </div>
  );
}

/**
 * Success screen.
 *
 * Rendered exclusively from the real `meta.job` payload — company, role,
 * location, deadline, confidence and quality are all fields the backend
 * returned. Unknown values degrade to an explicit "Not detected" rather than
 * an optimistic guess, and `job.missing_fields` is surfaced so the user can
 * see exactly what the model could not find and fill it in.
 */
export function CaptureSuccess({
  result,
  onReset,
}: {
  result: CaptureResult;
  onReset: () => void;
}) {
  const job = result.job;

  if (!job) {
    return (
      <Card className="border-success/25">
        <CardHeader>
          <CardTitle>Capture complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-body text-muted-foreground">
            Capture #{result.capture.id} finished, but no job details came back.
          </p>
          <Button
            variant="outline"
            render={<Link href="/jobs" />}
            nativeButton={false}
          >
            Go to jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  const deadline = deadlineMeta(job.deadline);
  const skills = job.skills ?? [];
  const missing = job.missing_fields ?? [];

  return (
    <Card className="border-success/30">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/12 text-success"
          >
            <CheckIcon className="size-5" />
          </span>
          <div className="space-y-0.5">
            <CardTitle>Opportunity created</CardTitle>
            <p className="text-body text-muted-foreground">
              AI read your posting and filed it in your pipeline.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-4 rounded-xl border border-border bg-surface/40 p-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg text-caption font-semibold',
                monogramTint(job.company),
              )}
            >
              {companyMonogram(job.company)}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-caption text-muted-foreground">
                {job.company}
              </p>
              <h2 className="text-section-title font-heading text-balance text-foreground">
                {job.title}
              </h2>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact label="Location" icon={MapPinIcon}>
              {job.location?.trim() || (
                <span className="text-muted-foreground">Not detected</span>
              )}
            </Fact>

            <Fact label="Deadline" icon={CalendarIcon}>
              {job.deadline ? (
                <span className="flex flex-wrap items-center gap-2">
                  {formatDeadline(job.deadline)}
                  {deadline ? (
                    <span
                      className={cn(
                        'inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-micro font-medium',
                        DEADLINE_CLASS[deadline.tone],
                      )}
                    >
                      {deadline.label}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="text-muted-foreground">Not detected</span>
              )}
            </Fact>

            <Fact label="AI confidence" icon={SparklesIcon}>
              <span data-tabular="true">
                {formatConfidence(job.ai_confidence_score)}
              </span>
            </Fact>

            <Fact label="Quality score" icon={ChartNoAxesColumnIcon}>
              <span data-tabular="true">{job.job_quality_score ?? '—'}</span>
            </Fact>
          </dl>

          {skills.length > 0 && (
            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <p className="text-micro text-muted-foreground">Detected skills</p>
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 8).map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="text-micro"
                  >
                    {skill.skill_name}
                  </Badge>
                ))}
                {skills.length > 8 && (
                  <Badge variant="secondary" className="text-micro">
                    +{skills.length - 8}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div className="flex items-start gap-2 border-t border-border/60 pt-3">
              <TriangleAlertIcon
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0 text-warning"
              />
              <p className="text-caption text-muted-foreground">
                AI could not find: {missing.join(', ')}. You can add these on the
                job page.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button render={<Link href={`/jobs/${job.id}`} />} nativeButton={false}>
            View Job
          </Button>
          <Button variant="outline" onClick={onReset}>
            Create Another
          </Button>
          <Button
            variant="ghost"
            render={<Link href="/dashboard" />}
            nativeButton={false}
          >
            Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

