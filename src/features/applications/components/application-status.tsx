'use client';

import { useState } from 'react';
import { Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/loading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ApplicationForm } from '@/features/applications/components/application-form';
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type CreateApplicationInput,
  type UpdateApplicationInput,
} from '@/features/applications/types';
import type { Job } from '@/features/jobs/types';

type ApplicationSummary = {
  id: number;
  status: string;
  applied_date: string | null;
};

/**
 * APPLICATION STATUS section. When the job has no application record it
 * renders the create-form; otherwise a live status selector + applied
 * date + delete. Status changes PATCH the application (and the page also
 * syncs the parent job status so board/dashboard stay consistent).
 */
export function ApplicationStatus({
  job,
  application,
  isPending,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: {
  job: Job;
  application: ApplicationSummary | undefined;
  isPending: boolean;
  isSaving: boolean;
  onCreate: (input: CreateApplicationInput) => void;
  onUpdate: (input: UpdateApplicationInput) => void;
  onDelete: () => void;
}) {
  const [status, setStatus] = useState(application?.status ?? job.status);
  const [prevStatus, setPrevStatus] = useState(application?.status);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Adjust local state during render when the server value changes —
  // keeps the select in sync without a setState-in-effect cascade.
  if (application?.status !== prevStatus) {
    setPrevStatus(application?.status);
    if (application) {
      setStatus(application.status);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Application status</CardTitle>
        <CardDescription>
          {application
            ? 'Track each stage here — this is independent from the job board status.'
            : 'No application recorded for this job yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ButtonSpinner />
            Loading application…
          </div>
        ) : !application ? (
          <ApplicationForm
            jobId={job.id}
            isPending={isSaving}
            onCreate={onCreate}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <select
                  aria-label="Change application status"
                  value={status}
                  disabled={isSaving}
                  onChange={(event) => {
                    const next = event.target.value as ApplicationStatus;
                    setStatus(next);
                    onUpdate({ status: next });
                  }}
                  className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
                >
                  {APPLICATION_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              {isSaving && <ButtonSpinner />}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
              <p className="text-muted-foreground">
                Applied:{' '}
                <span className="font-medium text-foreground">
                  {application.applied_date ?? '—'}
                </span>
              </p>
              {!confirmingDelete ? (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete application record"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isSaving}
                    onClick={() => {
                      setConfirmingDelete(false);
                      onDelete();
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
