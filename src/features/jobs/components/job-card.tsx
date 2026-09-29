'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import type { Job, JobStatus } from '@/features/jobs/types';
import { cn } from 'cn';

/**
 * Single source of truth for job-stage colour. Consumed by the card, the
 * Kanban columns, the table and the detail header, so a stage always looks
 * the same everywhere.
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

/** Whole days from today until `deadline`; negative when already past. */
export function daysUntil(deadline: string | null): number | null {
  if (!deadline) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${deadline}T00:00:00`);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  return Number.isNaN(diff) ? null : diff;
}

export type DeadlineMeta = {
  label: string;
  tone: 'danger' | 'warning' | 'neutral';
  urgent: boolean;
};

/** Deadline badge copy + colour. Shared by the card, table and insight. */
export function deadlineMeta(deadline: string | null): DeadlineMeta | null {
  const diff = daysUntil(deadline);

  if (diff === null) {
    return null;
  }
  if (diff < 0) {
    return { label: `${Math.abs(diff)}d overdue`, tone: 'danger', urgent: true };
  }
  if (diff === 0) {
    return { label: 'Due today', tone: 'danger', urgent: true };
  }
  if (diff === 1) {
    return { label: 'Due tomorrow', tone: 'warning', urgent: true };
  }
  if (diff <= 7) {
    return { label: `${diff}d left`, tone: 'warning', urgent: false };
  }

  return { label: `${diff}d left`, tone: 'neutral', urgent: false };
}

/** Deadline badge palette. Shared so the table, card and insight agree. */
export const DEADLINE_CLASS: Record<DeadlineMeta['tone'], string> = {
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  neutral: 'border-border bg-muted text-muted-foreground',
};

/**
 * Two-letter monogram used as the company logo placeholder.
 *
 * Exported so every surface that shows a company — job card, Kanban, table
 * and the capture success card — renders the identical monogram and tint
 * rather than each re-implementing the initialism rule.
 */
export function companyMonogram(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/**
 * Deterministic placeholder tint so the same company always gets the same
 * swatch — a real logo slot can replace this later without churn.
 */
export function monogramTint(company: string): string {
  const tints = [
    'bg-ai/15 text-ai',
    'bg-primary/15 text-primary',
    'bg-success/15 text-success',
    'bg-warning/15 text-warning',
  ];
  const index =
    [...company].reduce((sum, char) => sum + char.charCodeAt(0), 0) % tints.length;

  return tints[index];
}


/**
 * Compact ATS-style job card. Used by the Kanban board and the mobile list;
 * the desktop table has its own denser row layout. The whole card is one
 * link to /jobs/[id].
 */
export function JobCard({ job }: { job: Job }) {
  const deadline = deadlineMeta(job.deadline);
  const skills = job.skills ?? [];

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group/job block rounded-xl focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <article
        className={cn(
          'flex h-full flex-col gap-2.5 rounded-xl border border-border bg-card p-3',
          'transition-[box-shadow,border-color,transform] duration-200 ease-out',
          'hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-hover',
        )}
      >
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg text-micro font-semibold',
              monogramTint(job.company),
            )}
          >
            {companyMonogram(job.company)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-caption text-muted-foreground">
              {job.company}
            </p>
            <h3 className="truncate text-body font-medium text-foreground group-hover/job:text-ai">
              {job.title}
            </h3>
          </div>
        </div>

        {(job.location || job.salary) && (
          <p className="truncate text-caption text-muted-foreground">
            {[job.location, job.salary].filter(Boolean).join(' · ')}
          </p>
        )}

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

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-micro">
                {skill.skill_name}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="secondary" className="text-micro">
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-2 text-micro">
          <span className="text-muted-foreground">
            AI{' '}
            <span
              data-tabular="true"
              className="font-semibold text-foreground"
            >
              {formatConfidence(job.ai_confidence_score)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Quality{' '}
            <span
              data-tabular="true"
              className="font-semibold text-foreground"
            >
              {job.job_quality_score ?? '—'}
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}

