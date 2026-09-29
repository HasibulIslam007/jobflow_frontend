'use client';

import {
  CalendarIcon,
  StickyNoteIcon,
  TargetIcon,
} from 'lucide-react';

import { StatusPill } from '@/components/ui/status-pill';
import { APPLICATION_STATUS_META, formatShortDate } from '@/features/applications/application-status-meta';
import type { Application } from '@/features/applications/types';
import {
  companyMonogram,
  deadlineMeta,
  DEADLINE_CLASS,
  monogramTint,
} from '@/features/jobs/components/job-card';
import type { Job } from '@/features/jobs/types';
import { cn } from 'cn';

/**
 * Match-score band. `match_score` is a real 0–100 number returned by
 * `ResumeMatchResource`, and it only appears when a match has actually been
 * generated for this job in this session.
 */
function matchTone(score: number): string {
  if (score >= 80) return 'border-success/30 bg-success/10 text-success';
  if (score >= 60) return 'border-ai/30 bg-ai/10 text-ai';

  return 'border-warning/30 bg-warning/10 text-warning';
}

/**
 * One application in the pipeline board.
 *
 * The whole card is a single button that opens the detail panel — status
 * changes deliberately do *not* happen here. On a kanban, an inline status
 * control next to a drag affordance is a trap: it looks draggable but moves
 * on click. Stage changes go through the detail panel, which is also where
 * notes and dates live.
 */
export function ApplicationCard({
  application,
  job,
  matchScore,
  isSelected,
  onOpen,
}: {
  application: Application;
  job: Job;
  matchScore?: number;
  isSelected: boolean;
  onOpen: () => void;
}) {
  const meta = APPLICATION_STATUS_META[application.status];
  const deadline = deadlineMeta(job.deadline);
  const hasNotes = Boolean(application.notes?.trim());

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={isSelected}
      aria-label={`${job.title} at ${job.company}, ${meta.label}. Open application details.`}
      className={cn(
        'group/card w-full rounded-xl border bg-card p-3 text-left',
        'transition-[box-shadow,border-color,transform] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-hover focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
        isSelected
          ? 'border-ai/50 shadow-hover ring-1 ring-ai/30'
          : 'border-border hover:border-foreground/15',
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
          <p className="truncate text-caption text-muted-foreground">{job.company}</p>
          <h3 className="truncate text-body font-medium text-foreground group-hover/card:text-ai">
            {job.title}
          </h3>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <StatusPill label={meta.label} tone={meta.tone} />

        {typeof matchScore === 'number' ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-micro font-medium',
              matchTone(matchScore),
            )}
            title="Highest AI resume match score generated for this job"
          >
            <TargetIcon className="size-3" aria-hidden="true" />
            <span data-tabular="true">{matchScore}%</span>
            <span className="sr-only">resume match</span>
          </span>
        ) : null}

        {hasNotes ? (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-micro text-muted-foreground"
            title="This application has notes"
          >
            <StickyNoteIcon className="size-3" aria-hidden="true" />
            <span className="sr-only">Has notes</span>
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex items-center gap-3 border-t border-border/60 pt-2 text-micro text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarIcon className="size-3" aria-hidden="true" />
          <span className="sr-only">Applied </span>
          {formatShortDate(application.applied_date)}
        </span>

        {deadline ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-1.5 py-px font-medium',
              DEADLINE_CLASS[deadline.tone],
            )}
          >
            {deadline.label}
          </span>
        ) : null}
      </div>
    </button>
  );
}
