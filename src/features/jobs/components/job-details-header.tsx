'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/loading';
import {
  StatusBadge,
} from '@/features/jobs/components/job-card';
import { useDeleteJob, useUpdateJob } from '@/features/jobs/hooks';
import { JOB_STATUSES, type Job } from '@/features/jobs/types';

export function JobDetailsHeader({ job }: { job: Job }) {
  const { mutate: save, isPending } = useUpdateJob(job.id);
  const { mutate: remove, isPending: isDeleting } = useDeleteJob();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/jobs"
        className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
        Back to jobs
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
          <h1 className="text-2xl font-medium tracking-tight">{job.title}</h1>
          <div className="flex items-center gap-2 pt-1">
            <StatusBadge status={job.status} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <select
              aria-label="Change job status"
              value={job.status}
              disabled={isPending}
              onChange={(event) =>
                save({ status: event.target.value as Job['status'] })
              }
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
            >
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            {isPending && <ButtonSpinner />}
          </label>
          {!confirming ? (
            <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
              <Trash2Icon />
              Delete
            </Button>
          ) : (
            <div
              role="alertdialog"
              aria-label="Confirm job deletion"
              className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2"
            >
              <p className="text-xs font-medium">
                Delete &ldquo;{job.title}&rdquo;? This cannot be undone.
              </p>
              <div className="flex gap-1.5">
                <Button variant="destructive" size="xs" disabled={isDeleting} onClick={() => remove(job.id)}>
                  {isDeleting && <ButtonSpinner />}
                  Confirm
                </Button>
                <Button variant="ghost" size="xs" disabled={isDeleting} onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
