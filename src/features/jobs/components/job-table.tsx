'use client';

import Link from 'next/link';

import { ButtonSpinner } from '@/components/loading';
import {
  DEADLINE_CLASS,
  StatusBadge,
  deadlineMeta,
  formatConfidence,
} from '@/features/jobs/components/job-card';
import { Select } from '@/components/ui/select';
import { useUpdateJob } from '@/features/jobs/hooks';
import { JOB_STATUSES, type Job } from '@/features/jobs/types';
import { cn } from 'cn';

/**
 * Inline status control. Owns its own mutation instance so each row saves
 * independently without blocking the rest of the table.
 */
function RowStatusSelect({ job }: { job: Job }) {
  const { mutate: save, isPending } = useUpdateJob(job.id);

  return (
    <div className="flex items-center gap-1.5">
      <Select
        aria-label={`Change status for ${job.title}`}
        value={job.status}
        disabled={isPending}
        onChange={(event) => save({ status: event.target.value as Job['status'] })}
        className="h-8 w-32 text-caption"
      >
        {JOB_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </Select>
      {isPending ? <ButtonSpinner /> : null}
    </div>
  );
}

function ScoreCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-caption text-muted-foreground">—</span>;
  }

  return (
    <span
      data-tabular="true"
      className={cn(
        'text-caption font-medium',
        value >= 0.85
          ? 'text-success'
          : value >= 0.7
            ? 'text-warning'
            : 'text-destructive',
      )}
    >
      {Math.round(value * 100)}%
    </span>
  );
}

function DeadlineCell({ job }: { job: Job }) {
  const deadline = deadlineMeta(job.deadline);

  if (!deadline) {
    return <span className="text-caption text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-micro font-medium whitespace-nowrap',
        DEADLINE_CLASS[deadline.tone],
      )}
    >
      {deadline.label}
    </span>
  );
}

/**
 * List view.
 *
 * Desktop is a dense table — scanning many rows at once is the whole point
 * of this view, so rows stay one line tall. Below `md` it collapses into
 * cards, because a seven-column table on a phone is a horizontal scroll
 * nobody enjoys. Sorting is deliberately absent: the API returns a fixed
 * order and the search/filter controls already narrow the set.
 */
function JobTable({ jobs }: { jobs: Job[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Your job pipeline, with status, deadline and AI scores
          </caption>

          <thead>
            <tr className="border-b border-border bg-surface/60">
              {[
                'Role',
                'Company',
                'Status',
                'Deadline',
                'AI score',
                'Quality',
                'Actions',
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-3 py-2.5 text-caption font-medium text-muted-foreground whitespace-nowrap"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr key={job.id} className="transition-colors hover:bg-accent/40">
                <td className="max-w-[15rem] px-3 py-2.5">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block truncate text-body font-medium text-foreground transition-colors hover:text-ai"
                  >
                    {job.title}
                  </Link>
                  {job.location ? (
                    <span className="block truncate text-micro text-muted-foreground">
                      {job.location}
                    </span>
                  ) : null}
                </td>

                <td className="max-w-[11rem] px-3 py-2.5">
                  <span className="block truncate text-caption text-foreground">
                    {job.company}
                  </span>
                  {job.salary ? (
                    <span className="block truncate text-micro text-muted-foreground">
                      {job.salary}
                    </span>
                  ) : null}
                </td>

                <td className="px-3 py-2.5">
                  <StatusBadge status={job.status} />
                </td>

                <td className="px-3 py-2.5">
                  <DeadlineCell job={job} />
                </td>

                <td className="px-3 py-2.5">
                  <ScoreCell value={job.ai_confidence_score} />
                </td>

                <td className="px-3 py-2.5">
                  <span
                    data-tabular="true"
                    className="text-caption font-medium text-foreground"
                  >
                    {job.job_quality_score ?? '—'}
                  </span>
                </td>

                <td className="px-3 py-2.5">
                  <RowStatusSelect job={job} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>




      <ul className="space-y-2.5 md:hidden">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="rounded-xl border border-border bg-card p-3 shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/jobs/${job.id}`}
                  className="block truncate text-body font-medium text-foreground"
                >
                  {job.title}
                </Link>
                <p className="truncate text-caption text-muted-foreground">
                  {job.company}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {job.location || job.salary ? (
              <p className="mt-2 truncate text-caption text-muted-foreground">
                {[job.location, job.salary].filter(Boolean).join(' · ')}
              </p>
            ) : null}

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <DeadlineCell job={job} />
              <span className="text-micro text-muted-foreground">
                AI{' '}
                <span data-tabular="true" className="font-medium text-foreground">
                  {formatConfidence(job.ai_confidence_score)}
                </span>
                {' · '}Quality{' '}
                <span data-tabular="true" className="font-medium text-foreground">
                  {job.job_quality_score ?? '—'}
                </span>
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-2.5">
              <RowStatusSelect job={job} />
              <Link
                href={`/jobs/${job.id}`}
                className="text-caption font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Open details
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export { JobTable };
