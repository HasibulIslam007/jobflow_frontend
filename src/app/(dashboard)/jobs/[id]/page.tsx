'use client';

import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ApplicationIntelligenceCard } from '@/features/applications/components/application-intelligence-card';
import { ReminderCard } from '@/features/applications/components/reminder-card';
import { JobDetailsHeader } from '@/features/jobs/components/job-details-header';
import { JobDetailsMain } from '@/features/jobs/components/job-details-main';
import { JobDetailsSide } from '@/features/jobs/components/job-details-side';
import { JobDetailsSkeleton } from '@/features/jobs/components/job-skeleton';
import { useJob } from '@/features/jobs/hooks';
import { SkillMatch } from '@/features/resume/components/skill-match';
import { ApiError } from '@/lib/api';

function errorMessageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'This job could not be found. It may have been deleted.';
    }
    if (error.status === 403) {
      return 'You do not have access to this job.';
    }

    return error.message || 'Could not load this job.';
  }

  return error instanceof Error ? error.message : 'Could not load this job.';
}


/**
 * /jobs/[id] — full detail: header (title/company/status selector/delete)
 * plus Job Information / Description / Skills / AI Analysis sections, the
 * Application Intelligence card (state, timeline preview, pipeline link),
 * the AI Resume Match card and the read-only reminder card.
 */
function JobDetailsContent({ id }: { id: number }) {
  const { data: job, isPending, isError, error, refetch } = useJob(id);

  if (isPending) {
    return <JobDetailsSkeleton />;
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
        <p role="alert" className="text-sm font-medium">
          {errorMessageFor(error)}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <JobDetailsHeader job={job} />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <JobDetailsMain job={job} />
          <ApplicationIntelligenceCard job={job} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <JobDetailsSide job={job} />
          <SkillMatch jobId={job.id} />
          <ReminderCard job={job} />
        </div>
      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  return Number.isNaN(id) ? (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <p role="alert" className="text-sm font-medium">
        Invalid job id.
      </p>
    </div>
  ) : (
    <JobDetailsContent id={id} />
  );
}

