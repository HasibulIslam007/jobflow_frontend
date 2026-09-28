'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '@/features/applications/types';

/**
 * Create-form shown when a job has no application record yet.
 * Records status (defaults to `applied`), applied date and an optional
 * first note in a single POST.
 */
export function ApplicationForm({
  jobId,
  onCreate,
  isPending,
}: {
  jobId: number;
  onCreate: (input: {
    status: ApplicationStatus;
    applied_date?: string;
    notes?: string;
  }) => void;
  isPending: boolean;
}) {
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <form
      aria-label="Record application"
      data-job-id={jobId}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({
          status,
          ...(appliedDate ? { applied_date: appliedDate } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`application-status-${jobId}`}>Status</Label>
          <select
            id={`application-status-${jobId}`}
            value={status}
            disabled={isPending}
            onChange={(event) =>
              setStatus(event.target.value as ApplicationStatus)
            }
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
          >
            {APPLICATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`application-date-${jobId}`}>Applied date</Label>
          <Input
            id={`application-date-${jobId}`}
            type="date"
            value={appliedDate}
            disabled={isPending}
            onChange={(event) => setAppliedDate(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`application-notes-${jobId}`}>Notes (optional)</Label>
        <textarea
          id={`application-notes-${jobId}`}
          value={notes}
          disabled={isPending}
          rows={3}
          maxLength={10_000}
          placeholder="How did you apply? Who did you contact?"
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50"
        />
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        Record application
      </Button>
    </form>
  );
}
