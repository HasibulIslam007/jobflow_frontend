'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BriefcaseIcon, KanbanSquareIcon, PlusIcon, RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationCreateForm } from '@/features/applications/components/application-actions';
import { ApplicationBoard } from '@/features/applications/components/application-board';
import { ApplicationDetailPanel } from '@/features/applications/components/application-detail-panel';
import { ApplicationHeader } from '@/features/applications/components/application-header';
import {
  PipelineOverview,
  PipelineOverviewSkeleton,
} from '@/features/applications/components/pipeline-overview';
import {
  useCreateApplication,
  useUpdateApplication,
} from '@/features/applications/hooks';
import {
  useApplicationRows,
  useMatchScoresByJob,
} from '@/features/applications/use-application-pipeline';
import type { ApplicationStatus } from '@/features/applications/types';
import { useJobs } from '@/features/jobs/hooks';
import { cn } from 'cn';
import { ApiError } from '@/lib/api';

/** Blank slate for the status tallies, so a loading board never reads as "0". */
const EMPTY_COUNTS: Record<ApplicationStatus, number> = {
  saved: 0,
  preparing: 0,
  applied: 0,
  interview: 0,
  offer: 0,
  rejected: 0,
};

function errorMessageFor(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || 'Could not load your applications.';
  }

  return error instanceof Error
    ? error.message
    : 'Could not load your applications.';
}

/**
 * /applications — the Application Pipeline (Phase 6.7).
 *
 * Reading order: prove the shape of the pipeline (overview counts), then
 * work it (board), then go deep on one record (detail panel).
 *
 * DATA SHAPE, AND WHY IT IS BUILT THIS WAY
 * ----------------------------------------
 * The Applications API is job-scoped: `GET /jobs/{job}/applications` is the
 * only list endpoint and there is no global one. So this page loads the job
 * list, then fans out one applications request per job
 * (see `use-application-pipeline.ts`). Every count, column and percentage
 * below is therefore derived from real records — nothing is estimated, and
 * nothing is pre-filled with a plausible-looking placeholder.
 *
 * SELECTION is stored as an application id rather than an object, so a
 * mutation that invalidates and refetches the fan-out queries can never
 * leave a stale copy of the record on screen.
 */
function ApplicationsContent() {
  const {
    jobs,
    data: jobsData,
    isPending: jobsPending,
    isError: jobsError,
    error: jobsErrorValue,
    refetch: refetchJobs,
  } = useJobs({ per_page: 100 });

  const {
    rows,
    isPending: rowsPending,
    isError: rowsError,
    failedCount,
    totalCount,
    refetch: refetchRows,
  } = useApplicationRows(jobs, { enabled: !jobsPending });

  const matchScores = useMatchScoresByJob();
  const updateMutation = useUpdateApplication();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  // `useCreateApplication` is job-scoped (the POST is nested under the job),
  // so the mutation is bound to whichever job the composer is creating for.
  // The composer is controlled (see ApplicationCreateForm) so this id always
  // matches what the user actually picked. 0 is a never-submitted sentinel:
  // the form disables submit until a real job is chosen.
  const [composerJobId, setComposerJobId] = useState<number | null>(null);
  const createMutation = useCreateApplication(composerJobId ?? 0);

  const isPending = jobsPending || rowsPending;
  const errorMessage = errorMessageFor(jobsErrorValue);

  // The jobs endpoint caps at 100 records, but the fan-out can only see the
  // jobs it was given. Comparing the server total against what loaded turns a
  // silent under-count into an explicit warning.
  const totalJobs = jobsData?.pagination.total ?? 0;
  const isTruncated = !jobsPending && totalJobs > jobs.length;

  // A fan-out error is only fatal when *nothing* loaded. If some rows arrived,
  // show the board plus a partial-failure notice rather than replacing real
  // data with an error screen.
  const hasHardFailure = jobsError || (rowsError && rows.length === 0);
  const hasPartialFailure = !hasHardFailure && rowsError;

  const retryAll = () => {
    if (jobsError) refetchJobs();
    if (rowsError) refetchRows();
  };

  const counts = useMemo(() => {
    const next = { ...EMPTY_COUNTS };

    for (const row of rows) {
      next[row.application.status] += 1;
    }

    return next;
  }, [rows]);

  // The selection is resolved on render rather than stored as an object, so a
  // mutation that invalidates and refetches the fan-out queries can never
  // leave a stale copy of the record on screen — and if the record disappears
  // entirely, `selected` simply becomes null and the panel closes. Deriving it
  // here also avoids a setState-in-effect cascade.
  const selected = useMemo(
    () => rows.find((row) => row.application.id === selectedId) ?? null,
    [rows, selectedId],
  );

  // Jobs with no application yet — the only valid targets for a new record.
  const candidates = useMemo(() => {
    const tracked = new Set(rows.map((row) => row.job.id));

    return jobs
      .filter((job) => !tracked.has(job.id))
      .map((job) => ({ jobId: job.id, company: job.company, title: job.title }));
  }, [jobs, rows]);

  const openComposer = () => {
    const first = candidates[0];

    if (!first) return;

    setComposerJobId(first.jobId);
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setComposerJobId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <ApplicationHeader
        onAddApplication={openComposer}
        isComposerOpen={composerOpen}
        canAdd={candidates.length > 0}
        addDisabledReason="Every job you track already has an application. Save a new job first."
      />

      {/* The overview only means something once applications exist, so the
          empty state replaces it rather than sitting above five zeroes. */}
      {isPending ? (
        <PipelineOverviewSkeleton />
      ) : rows.length > 0 ? (
        <PipelineOverview counts={counts} total={rows.length} />
      ) : null}

      <AnimatePresence initial={false}>
        {composerOpen ? (
          <motion.div
            key="composer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ApplicationCreateForm
              candidates={candidates}
              jobId={composerJobId}
              isPending={createMutation.isPending}
              onJobChange={setComposerJobId}
              onCreate={(input) => {
                createMutation.mutate(input, {
                  onSuccess: closeComposer,
                });
              }}
              onCancel={closeComposer}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!isPending && !hasHardFailure ? (
        <PipelineNotices
          isTruncated={isTruncated}
          loadedJobs={jobs.length}
          totalJobs={totalJobs}
          partialFailure={hasPartialFailure}
          failedCount={failedCount}
          totalCount={totalCount}
          onRetry={retryAll}
        />
      ) : null}

      {isPending ? (
        <BoardSkeleton />
      ) : hasHardFailure ? (
        <ErrorState
          title="Could not load your applications"
          description={`${errorMessage} Your data is safe — try again in a moment.`}
          action={
            <Button variant="outline" size="sm" onClick={retryAll}>
              <RefreshCwIcon aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={KanbanSquareIcon}
          title="No applications tracked yet"
          description="Applications you record land here as a pipeline — move from preparing to applied, interview, offer or rejected, and keep every note, date and follow-up in one place."
          action={
            candidates.length > 0 ? (
              <Button onClick={openComposer}>
                <PlusIcon aria-hidden="true" />
                Start applying
              </Button>
            ) : (
              <Button
                render={<Link href="/jobs" />}
                nativeButton={false}
              >
                <BriefcaseIcon aria-hidden="true" />
                Start applying
              </Button>
            )
          }
        />
      ) : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="min-w-0">
            <ApplicationBoard
              rows={rows}
              matchScores={matchScores}
              selectedId={selectedId}
              onOpen={setSelectedId}
            />
          </div>

          <AnimatePresence mode="wait">
            {selected ? (
              <ApplicationDetailPanel
                key={selected.application.id}
                application={selected.application}
                job={selected.job}
                isSaving={updateMutation.isPending}
                onStatusChange={(status) =>
                  updateMutation.mutate({
                    id: selected.application.id,
                    input: { status },
                  })
                }
                onNotesChange={(notes) =>
                  updateMutation.mutate({
                    id: selected.application.id,
                    input: { notes },
                  })
                }
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <aside
                key="placeholder"
                className="hidden rounded-xl border border-dashed border-border bg-surface/40 p-4 xl:block"
              >
                <p className="text-caption font-medium text-foreground">
                  Select an application
                </p>
                <p className="mt-1 text-micro text-pretty text-muted-foreground">
                  Pick any card to see its status, notes and activity timeline
                  here.
                </p>
              </aside>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/**
 * Honest reporting about what the fan-out could and could not see.
 *
 * Both notices exist because the underlying API is job-scoped: there is no
 * global applications endpoint, so a "complete" pipeline is only ever complete
 * with respect to the jobs that loaded. Saying nothing would let the counts
 * above look authoritative when they are not.
 */
function PipelineNotices({
  isTruncated,
  loadedJobs,
  totalJobs,
  partialFailure,
  failedCount,
  totalCount,
  onRetry,
}: {
  isTruncated: boolean;
  loadedJobs: number;
  totalJobs: number;
  partialFailure: boolean;
  failedCount: number;
  totalCount: number;
  onRetry: () => void;
}) {
  if (!isTruncated && !partialFailure) return null;

  return (
    <div className="space-y-2">
      {isTruncated ? (
        <Notice tone="warning">
          <TriangleAlertIcon aria-hidden="true" />
          <span>
            Showing applications for the {loadedJobs} most recent of{' '}
            <strong className="font-medium text-foreground">{totalJobs}</strong>{' '}
            jobs. The jobs API returns 100 records at a time, so applications
            for older jobs are not in these counts.
          </span>
        </Notice>
      ) : null}

      {partialFailure ? (
        <Notice tone="warning">
          <TriangleAlertIcon aria-hidden="true" />
          <span>
            Could not load applications for {failedCount} of {totalCount} jobs, so
            this board is incomplete.
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto shrink-0"
            onClick={onRetry}
          >
            <RefreshCwIcon aria-hidden="true" />
            Retry
          </Button>
        </Notice>
      ) : null}
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: 'warning';
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-caption text-pretty',
        tone === 'warning' && 'border-warning/40 bg-warning/5 text-warning',
      )}
    >
      {children}
    </div>
  );
}

/** Column-shaped placeholders so the board does not reflow when data lands. */
function BoardSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, columnIndex) => (
        <div
          key={columnIndex}
          className="flex w-[19rem] shrink-0 flex-col gap-2 rounded-xl border border-border/70 bg-surface/50 p-2"
        >
          <Skeleton className="h-6 w-full rounded-lg" />
          {Array.from({ length: columnIndex === 0 ? 2 : 1 }).map((_, cardIndex) => (
            <Skeleton key={cardIndex} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ApplicationsPage() {
  return <ApplicationsContent />;
}
