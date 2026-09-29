'use client';

import Link from 'next/link';
import { ArrowRightIcon, KanbanSquareIcon, SparklesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/status-pill';
import {
  currentApplication,
  useApplications,
  useUpdateApplication,
} from '@/features/applications/hooks';
import {
  APPLICATION_STATUS_META,
  formatDate,
} from '@/features/applications/application-status-meta';
import { ApplicationActivity } from '@/features/applications/components/application-activity';
import { useMatchScoresByJob } from '@/features/applications/use-application-pipeline';
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/features/applications/types';
import type { Job } from '@/features/jobs/types';
import { cn } from 'cn';

/**
 * APPLICATION INTELLIGENCE — the /jobs/[id] replacement for the old
 * three-card Application Tracking block (status + timeline + notes).
 *
 * It answers three questions and nothing else:
 *   1. Where is this job in my pipeline right now?
 *   2. What has happened so far?
 *   3. Where do I go to manage it?
 *
 * Editing status stays on this page (a single select) because that is the
 * one action a user performs *while* reading a job. Notes and the full
 * timeline live in the pipeline's detail panel, linked at the bottom — that
 * split keeps this card scannable instead of rebuilding the whole editor in
 * a sidebar.
 */
export function ApplicationIntelligenceCard({ job }: { job: Job }) {
  const { data: applications, isPending } = useApplications(job.id);
  const updateMutation = useUpdateApplication();
  const matchScores = useMatchScoresByJob();

  // The backend returns `latest('id')` first — index 0 is the live record.
  const application = currentApplication(applications);
  const matchScore = matchScores.get(job.id);

  if (isPending) {
    return (
      <section
        aria-labelledby="application-intelligence-heading"
        className="rounded-xl border border-border bg-card p-4"
      >
        <h2 id="application-intelligence-heading" className="sr-only">
          Application intelligence
        </h2>
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="mt-3 h-4 w-56 rounded" />
        <Skeleton className="mt-4 h-9 w-full rounded-lg" />
      </section>
    );
  }

  if (!application) {
    return (
      <section
        aria-labelledby="application-intelligence-heading"
        className="rounded-xl border border-dashed border-border bg-surface/40 p-4"
      >
        <h2
          id="application-intelligence-heading"
          className="text-section-title font-heading text-foreground"
        >
          Application intelligence
        </h2>
        <p className="mt-1.5 text-caption text-pretty text-muted-foreground">
          You have not recorded an application for this job yet. Add one to
          start tracking the stage, notes and follow-ups.
        </p>
        <Button
          size="sm"
          className="mt-3"
          render={<Link href="/applications" />}
          nativeButton={false}
        >
          Start an application
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </section>
    );
  }

  const meta = APPLICATION_STATUS_META[application.status];

  return (
    <section
      aria-labelledby="application-intelligence-heading"
      className="rounded-xl border border-border bg-card p-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="application-intelligence-heading"
            className="flex items-center gap-2 text-section-title font-heading text-foreground"
          >
            <KanbanSquareIcon className="size-4 text-ai" aria-hidden="true" />
            Application intelligence
          </h2>
          <p className="mt-1 text-caption text-muted-foreground">
            Tracking since {formatDate(application.created_at)}
          </p>
        </div>

        <StatusPill label={meta.label} tone={meta.tone} size="lg" />
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-caption sm:grid-cols-3">
        <div>
          <dt className="text-micro text-muted-foreground">Applied</dt>
          <dd className="font-medium text-foreground">
            {formatDate(application.applied_date)}
          </dd>
        </div>
        <div>
          <dt className="text-micro text-muted-foreground">Last updated</dt>
          <dd className="font-medium text-foreground">
            {formatDate(application.updated_at)}
          </dd>
        </div>
        <div>
          <dt className="text-micro text-muted-foreground">Resume match</dt>
          <dd
            className={cn(
              'font-medium',
              typeof matchScore === 'number' ? 'text-ai' : 'text-foreground',
            )}
          >
            {typeof matchScore === 'number' ? `${matchScore}%` : '—'}
          </dd>
        </div>
      </dl>

      {application.notes?.trim() ? (
        <p className="mt-3 rounded-lg border border-border/60 bg-surface/40 px-3 py-2 text-caption whitespace-pre-wrap text-pretty">
          {application.notes}
        </p>
      ) : null}

      <div className="mt-4 border-t border-border/60 pt-4">
        <ApplicationActivity application={application} limit={2} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <label
          htmlFor={`job-app-status-${job.id}`}
          className="text-caption font-medium text-foreground"
        >
          Update status
        </label>
        <select
          id={`job-app-status-${job.id}`}
          value={application.status}
          disabled={updateMutation.isPending}
          onChange={(event) =>
            updateMutation.mutate({
              id: application.id,
              input: { status: event.target.value as ApplicationStatus },
            })
          }
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
        >
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {APPLICATION_STATUS_META[status].label}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          className="ml-auto"
          render={<Link href="/applications" />}
          nativeButton={false}
        >
          <SparklesIcon aria-hidden="true" />
          Open Pipeline
        </Button>
      </div>
    </section>
  );
}
