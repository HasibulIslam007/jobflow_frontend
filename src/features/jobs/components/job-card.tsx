import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import type { Job, JobStatus } from '@/features/jobs/types';

/**
 * Single source of truth for job-stage colour. Consumed by the job card,
 * the Kanban board and the dashboard, so a stage always looks the same.
 */
export const STATUS_META: Record<
  JobStatus,
  { label: string; tone: StatusTone }
> = {
  saved: { label: 'Saved', tone: 'neutral' },
  preparing: { label: 'Preparing', tone: 'warning' },
  applied: { label: 'Applied', tone: 'primary' },
  interview: { label: 'Interview', tone: 'ai' },
  offer: { label: 'Offer', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const meta = STATUS_META[status];

  return <StatusPill label={meta.label} tone={meta.tone} />;
}

export function formatConfidence(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return `${Math.round(value * 100)}%`;
}

function daysLabel(deadline: string | null): string | null {
  if (!deadline) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${deadline}T00:00:00`);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (Number.isNaN(diff)) {
    return deadline;
  }
  if (diff < 0) {
    return `${Math.abs(diff)} days overdue`;
  }
  if (diff === 0) {
    return 'Due today';
  }

  return `${diff} days left`;
}

/**
 * Reusable job summary card. Used by both list and Kanban board views;
 * the whole card links to /jobs/[id].
 */
export function JobCard({ job }: { job: Job }) {
  const deadline = daysLabel(job.deadline);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <Card size="sm" interactive className="h-full">
        <CardHeader className="gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-caption font-medium text-muted-foreground">
                {job.company}
              </p>
              <CardTitle className="truncate text-sm">{job.title}</CardTitle>
            </div>
            <StatusBadge status={job.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 text-caption text-muted-foreground">
          {(job.location || job.salary) && (
            <p className="truncate">
              {[job.location, job.salary].filter(Boolean).join(' · ')}
            </p>
          )}

          {deadline && (
            <p>
              <span className="font-medium text-foreground">Deadline: </span>
              {deadline}
            </p>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-micro">
                  {skill.skill_name}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="secondary" className="text-micro">
                  +{job.skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-micro">
            <span>
              AI Confidence:{' '}
              <span
                data-tabular="true"
                className="font-semibold text-foreground tabular-nums"
              >
                {formatConfidence(job.ai_confidence_score)}
              </span>
            </span>
            <span>
              Quality:{' '}
              <span
                data-tabular="true"
                className="font-semibold text-foreground tabular-nums"
              >
                {job.job_quality_score ?? '—'}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
