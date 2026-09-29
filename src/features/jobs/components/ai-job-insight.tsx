'use client';

import Link from 'next/link';
import {
  CircleAlertIcon,
  GaugeIcon,
  SparklesIcon,
  TrendingUpIcon,
} from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Skeleton } from '@/components/ui/skeleton';
import { deadlineMeta, daysUntil } from '@/features/jobs/components/job-card';
import type { Job } from '@/features/jobs/types';
import type { DashboardStats } from '@/features/dashboard/types';
import { cn } from 'cn';

/** Stages that represent real forward motion, in pipeline order. */
const ADVANCED_STAGES = ['applied', 'interview', 'offer'] as const;

/** Jobs at or above this readiness score are considered complete. */
const READY_SCORE = 70;

type PipelineHealth = {
  /** Jobs still worth pursuing (everything except rejected). */
  active: number;
  /** How many of those are past the "saved" stage. */
  advanced: number;
  /** Percentage of active roles that have progressed. */
  percent: number;
  label: string;
  tone: 'ai' | 'success' | 'warning';
  summary: string;
};

/**
 * Pipeline health.
 *
 * Derived from the aggregate counts only — the API exposes no historical
 * data, so this is a ratio of two real figures rather than an invented
 * trend. Rejected jobs are excluded from the denominator: a rejection is
 * an outcome, not a stalled opportunity, and counting it would make the
 * number fall every time reality improved.
 */
function pipelineHealth(stats: DashboardStats): PipelineHealth {
  const active = Math.max(stats.total_jobs - stats.rejected, 0);
  const advanced = ADVANCED_STAGES.reduce((sum, stage) => sum + stats[stage], 0);
  const percent = active > 0 ? Math.round((advanced / active) * 100) : 0;

  if (active === 0) {
    return {
      active,
      advanced,
      percent: 0,
      label: 'No data',
      tone: 'warning',
      summary: 'Capture a job and AI will start scoring your pipeline.',
    };
  }

  if (percent >= 60) {
    return {
      active,
      advanced,
      percent,
      label: 'Healthy',
      tone: 'success',
      summary: `${advanced} of ${active} active ${
        active === 1 ? 'role is' : 'roles are'
      } past the saved stage.`,
    };
  }

  if (percent >= 30) {
    return {
      active,
      advanced,
      percent,
      label: 'Building',
      tone: 'ai',
      summary: `${advanced} of ${active} active roles have moved forward. Keep applying to build momentum.`,
    };
  }

  return {
    active,
    advanced,
    percent,
    label: 'Early',
    tone: 'warning',
    summary: `Most of your ${active} active ${
      active === 1 ? 'role is' : 'roles are'
    } still waiting to be applied to.`,
  };
}

/** Saved/preparing roles with the nearest deadline — what needs attention. */
function mostUrgent(jobs: Job[]): Job[] {
  return jobs
    .filter((job) => job.status !== 'rejected' && job.status !== 'offer')
    .filter((job) => daysUntil(job.deadline) !== null)
    .sort((a, b) => (daysUntil(a.deadline) ?? 0) - (daysUntil(b.deadline) ?? 0))
    .slice(0, 3);
}

/**
 * Jobs AI could not read cleanly: never scored, or scored below the
 * readiness bar. These are the ones worth editing by hand.
 */
function needsAttention(jobs: Job[]): Job[] {
  return jobs.filter(
    (job) =>
      job.status !== 'rejected' &&
      (job.ai_confidence_score === null ||
        (job.job_quality_score ?? 0) < READY_SCORE),
  );
}


function UrgentRow({ job }: { job: Job }) {
  const deadline = deadlineMeta(job.deadline);

  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <Link
          href={`/jobs/${job.id}`}
          className="block truncate text-caption font-medium text-foreground transition-colors hover:text-ai"
        >
          {job.title}
        </Link>
        <p className="truncate text-micro text-muted-foreground">{job.company}</p>
      </div>
      {deadline ? (
        <span
          className={cn(
            'shrink-0 text-micro font-medium whitespace-nowrap',
            deadline.tone === 'danger'
              ? 'text-destructive'
              : deadline.tone === 'warning'
                ? 'text-warning'
                : 'text-muted-foreground',
          )}
        >
          {deadline.label}
        </span>
      ) : null}
    </li>
  );
}

/**
 * AI insight panel for the jobs workspace.
 *
 * Every number here is computed from data the API actually returned — the
 * health ratio from the dashboard aggregate and the two lists from the
 * loaded rows. Nothing is sampled, predicted or invented: when the honest
 * answer is "not enough data yet", the panel says so rather than dressing
 * a placeholder up as intelligence.
 */
function AiJobInsight({
  stats,
  jobs,
}: {
  stats: DashboardStats;
  jobs: Job[];
}) {
  const health = pipelineHealth(stats);
  const urgent = mostUrgent(jobs);
  const incomplete = needsAttention(jobs);

  const toneClass = {
    ai: 'text-ai',
    success: 'text-success',
    warning: 'text-warning',
  }[health.tone];

  return (
    <AiCard
      title="AI pipeline insight"
      description="Derived from your pipeline data"
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-ai/15 bg-card/50 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <GaugeIcon aria-hidden="true" className={cn('size-3.5', toneClass)} />
            <span className="text-micro font-medium text-muted-foreground">
              Pipeline health
            </span>
            <span
              data-tabular="true"
              className={cn('ml-auto text-micro font-semibold', toneClass)}
            >
              {health.label}
            </span>
          </div>

          <p
            data-tabular="true"
            className="mt-1 font-heading text-lg leading-none font-semibold text-foreground"
          >
            {health.active > 0 ? `${health.percent}%` : '—'}
          </p>

          <div
            aria-hidden="true"
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 ease-out',
                health.tone === 'success'
                  ? 'bg-success'
                  : health.tone === 'ai'
                    ? 'bg-ai'
                    : 'bg-warning',
              )}
              style={{ width: `${health.percent}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-ai/20 bg-ai/[0.06] px-3 py-2.5">
          <p className="flex items-start gap-2 text-caption text-pretty text-foreground">
            <SparklesIcon
              aria-hidden="true"
              className="mt-px size-3.5 shrink-0 text-ai"
            />
            {health.summary}
          </p>
        </div>

        {urgent.length > 0 ? (
          <div>
            <p className="flex items-center gap-1.5 text-micro font-medium text-muted-foreground">
              <TrendingUpIcon aria-hidden="true" className="size-3.5" />
              Deadlines to act on
            </p>
            <ul className="mt-1 divide-y divide-border/60">
              {urgent.map((job) => (
                <UrgentRow key={job.id} job={job} />
              ))}
            </ul>
          </div>
        ) : null}

        {incomplete.length > 0 ? (
          <div className="rounded-lg border border-warning/25 bg-warning/[0.06] px-3 py-2.5">
            <p className="flex items-start gap-2 text-caption text-pretty text-foreground">
              <CircleAlertIcon
                aria-hidden="true"
                className="mt-px size-3.5 shrink-0 text-warning"
              />
              {incomplete.length}{' '}
              {incomplete.length === 1 ? 'job needs' : 'jobs need'} a fuller
              description before AI can score{' '}
              {incomplete.length === 1 ? 'it' : 'them'} reliably.
            </p>
          </div>
        ) : null}
      </div>
    </AiCard>
  );
}

function AiJobInsightSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-ai/20 bg-ai/[0.03] p-4"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-40" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export { AiJobInsight, AiJobInsightSkeleton };
