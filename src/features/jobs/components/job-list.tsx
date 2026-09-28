import type { Job } from '@/features/jobs/types';
import { JobCard, STATUS_META } from '@/features/jobs/components/job-card';
import { JOB_STATUSES } from '@/features/jobs/types';

/**
 * Responsive card grid: 1 col mobile, 2 cols tablet, 3 cols desktop.
 */
export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <JobCard job={job} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Kanban layout: one column per status, cards grouped visually
 * by their current status. Horizontally scrollable on small screens.
 */
export function JobStatusBoard({ jobs }: { jobs: Job[] }) {
  return (
    <div className="grid grid-flow-col gap-3 overflow-x-auto pb-2 auto-cols-[16rem] sm:auto-cols-[17rem]">
      {JOB_STATUSES.map((status) => {
        const column = jobs.filter((job) => job.status === status);

        return (
          <section
            key={status}
            aria-label={`${STATUS_META[status].label} column`}
            className="flex min-h-32 flex-col rounded-xl bg-muted/40 p-2"
          >
            <header className="flex items-center justify-between px-1.5 py-1">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                {STATUS_META[status].label}
              </h2>
              <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                {column.length}
              </span>
            </header>
            <div className="flex flex-1 flex-col gap-2">
              {column.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {column.length === 0 && (
                <p className="rounded-lg border border-dashed px-3 py-4 text-center text-[11px] text-muted-foreground">
                  No jobs
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
