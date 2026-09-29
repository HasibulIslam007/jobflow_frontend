'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  BriefcaseIcon,
  CheckIcon,
  NotebookPenIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/loading';
import { Label } from '@/components/ui/label';
import { APPLICATION_STATUS_META } from '@/features/applications/application-status-meta';
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type CreateApplicationInput,
} from '@/features/applications/types';
import { cn } from 'cn';

/**
 * Status selector.
 *
 * Writes straight through the existing `useUpdateApplication` mutation on
 * change — there is no separate "save" step, because the PATCH is the whole
 * action. The native `<select>` is used (rather than a custom listbox) so it
 * inherits full keyboard and mobile-wheel behaviour for free.
 */
export function StatusSelector({
  application,
  isSaving,
  onChange,
  className,
  idPrefix = 'status',
}: {
  application: Application;
  isSaving: boolean;
  onChange: (status: ApplicationStatus) => void;
  className?: string;
  idPrefix?: string;
}) {
  const selectId = `${idPrefix}-${application.id}`;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={selectId}>Status</Label>
      <div className="flex items-center gap-2">
        <select
          id={selectId}
          value={application.status}
          disabled={isSaving}
          onChange={(event) =>
            onChange(event.target.value as ApplicationStatus)
          }
          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
        >
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {APPLICATION_STATUS_META[status].label}
            </option>
          ))}
        </select>
        {isSaving ? <ButtonSpinner /> : null}
      </div>
    </div>
  );
}


/**
 * Notes editor.
 *
 * Kept read-only until "Add note" is pressed. An always-live textarea would
 * fight the user's typing against server refetches, and would also mean a
 * keystroke can silently PATCH.
 */
export function NotesEditor({
  application,
  isSaving,
  onSave,
}: {
  application: Application;
  isSaving: boolean;
  onSave: (notes: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(application.notes ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    onSave(draft.trim());
  };

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <Label>Notes</Label>
        <p className="rounded-lg border border-border/60 bg-surface/40 px-3 py-2 text-caption whitespace-pre-wrap text-pretty">
          {application.notes?.trim() ? (
            application.notes
          ) : (
            <span className="text-muted-foreground">
              No notes yet — interview questions, referral contacts, follow-up
              dates.
            </span>
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Seed the draft from the server copy at the moment editing
            // starts. This does what a "re-sync on change" effect did, but
            // reads the *current* props, so a save that landed elsewhere is
            // picked up without an effect racing the user's keystrokes.
            setDraft(application.notes ?? '');
            setIsEditing(true);
          }}
          disabled={isSaving}
        >
          <NotebookPenIcon aria-hidden="true" />
          {application.notes?.trim() ? 'Edit note' : 'Add note'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`notes-${application.id}`}>Notes</Label>
      <textarea
        id={`notes-${application.id}`}
        ref={textareaRef}
        value={draft}
        rows={4}
        maxLength={10_000}
        placeholder="What happened in the last call? Who is the hiring manager?"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
        }}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={commit} disabled={isSaving}>
          <SaveIcon aria-hidden="true" />
          Save note
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDraft(application.notes ?? '');
            setIsEditing(false);
          }}
          disabled={isSaving}
        >
          <XIcon aria-hidden="true" />
          Cancel
        </Button>
        {isSaving ? <ButtonSpinner /> : null}
      </div>
    </div>
  );
}

/**
 * APPLICATION ACTIONS — the three things you can do with an application.
 *
 * All three connect to functionality that already existed: the status
 * selector and notes editor write through the existing update mutation, and
 * "Open job" links to the job detail page. Nothing here invents a new API.
 */
export function ApplicationActions({
  application,
  jobTitle,
  isSaving,
  onStatusChange,
  onNotesChange,
}: {
  application: Application;
  jobTitle: string;
  isSaving: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <div className="space-y-5">
      <StatusSelector
        application={application}
        isSaving={isSaving}
        onChange={onStatusChange}
      />

      <NotesEditor
        application={application}
        isSaving={isSaving}
        onSave={onNotesChange}
      />

      <div className="border-t border-border/60 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          render={<Link href={`/jobs/${application.job_id}`} />}
          nativeButton={false}
        >
          <BriefcaseIcon aria-hidden="true" />
          Open job
        </Button>
        <p className="mt-1.5 truncate text-micro text-muted-foreground">
          {jobTitle} · full description, skills and AI analysis
        </p>
      </div>
    </div>
  );
}

/**
 * CREATE APPLICATION composer.
 *
 * An application always belongs to a job — the API only exposes
 * `POST /jobs/{job}/applications`. So "Add Application" is necessarily
 * "choose the job you applied to", which is why this lists jobs rather than
 * opening a blank form.
 */
export function ApplicationCreateForm({
  candidates,
  jobId,
  isPending,
  onJobChange,
  onCreate,
  onCancel,
}: {
  candidates: Array<{ jobId: number; company: string; title: string }>;
  /**
   * Controlled by the page, not local state. The POST is job-scoped
   * (`POST /jobs/{job}/applications`) and the mutation is bound to a job id
   * in the page, so the chosen job has to live where the mutation can see
   * it — otherwise picking a second job would create the record against the
   * first one.
   */
  jobId: number | null;
  isPending: boolean;
  onJobChange: (jobId: number | null) => void;
  onCreate: (input: CreateApplicationInput) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');

  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center">
        <p className="text-caption font-medium text-foreground">
          Every job you track already has an application.
        </p>
        <p className="mt-1 text-micro text-muted-foreground">
          Save another job to your workspace and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <form
      aria-label="Record an application"
      className="space-y-4 rounded-xl border border-border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();

        if (jobId === null) return;

        onCreate({
          status,
          ...(appliedDate ? { applied_date: appliedDate } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="create-application-job">Job</Label>
        <select
          id="create-application-job"
          required
          value={jobId ?? ''}
          disabled={isPending}
          onChange={(event) =>
            onJobChange(
              event.target.value === '' ? null : Number(event.target.value),
            )
          }
          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
        >
          <option value="" disabled>
            Select the job you applied to…
          </option>
          {candidates.map((candidate) => (
            <option key={candidate.jobId} value={candidate.jobId}>
              {candidate.title} — {candidate.company}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="create-application-status">Status</Label>
          <select
            id="create-application-status"
            value={status}
            disabled={isPending}
            onChange={(event) =>
              setStatus(event.target.value as ApplicationStatus)
            }
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
          >
            {APPLICATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {APPLICATION_STATUS_META[value].label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="create-application-date">Applied date</Label>
          <input
            id="create-application-date"
            type="date"
            value={appliedDate}
            disabled={isPending}
            onChange={(event) => setAppliedDate(event.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="create-application-notes">Notes (optional)</Label>
        <textarea
          id="create-application-notes"
          value={notes}
          rows={2}
          maxLength={10_000}
          disabled={isPending}
          placeholder="How did you apply? Who did you contact?"
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending || jobId === null}>
          <CheckIcon aria-hidden="true" />
          Record application
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        {isPending ? <ButtonSpinner /> : null}
      </div>
    </form>
  );
}
