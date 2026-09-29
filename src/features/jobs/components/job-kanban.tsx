'use client';

import { JobCard, STATUS_META } from '@/features/jobs/components/job-card';
import {
  JOB_STATUSES,
  type Job,
  type JobStatus,
} from '@/features/jobs/types';
import { cn } from 'cn';

const COLUMN_DOT: Record<JobStatus, string> = {
  saved: 'bg-muted-foreground',
  preparing: 'bg-warning',
  applied: 'bg-primary',
  interview: 'bg-ai',
  offer: 'bg-success',
  rejected: 'bg-destructive',
};

/**
 * Kanban board — one column per stage.
 *
 * Every column is always rendered, including empty ones: a stage that
 * silently disappears is a stage a user stops thinking about. The track
 * scrolls horizontally on small screens, which is the standard ATS pattern
 * and keeps each column a predictable width.
 */
function JobKanban({ jobs }: { jobs: Job[] }) {
  return (
    <div
      className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
      role="region"
      aria-label="Job pipeline board"
      tabIndex={0}
    >
      {JOB_STATUSES.map((status) => {
        const column = jobs.filter((job) => job.status === status);
        const meta = STATUS_META[status];

        return (
          <section
            key={status}
            aria-label={`${meta.label}, ${column.length} jobs`}
            className="flex w-[17rem] shrink-0 snap-start flex-col rounded-xl border border-border/70 bg-surface/50"
          >
            <header className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('size-2 rounded-full', COLUMN_DOT[status])}
                />
                <h2 className="text-caption font-semibold text-foreground">
                  {meta.label}
                </h2>
              </span>
              <span
                data-tabular="true"
                className="rounded-full border border-border bg-card px-1.5 py-0.5 text-micro font-medium text-muted-foreground"
              >
                {column.length}
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-2 p-2">
              {column.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}

              {column.length === 0 && (
                <p className="rounded-lg border border-dashed border-border/70 px-2 py-6 text-center text-micro text-muted-foreground">
                  Nothing here yet
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export { JobKanban };
