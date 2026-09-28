'use client';

import { ApplicationStatus } from '@/features/applications/components/application-status';
import { ApplicationTimeline } from '@/features/applications/components/application-timeline';
import { NotesCard } from '@/features/applications/components/notes-card';
import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
  useUpdateApplication,
} from '@/features/applications/hooks';
import type { Job } from '@/features/jobs/types';

/**
 * APPLICATION TRACKING panel for /jobs/[id]: Application Status +
 * Timeline + Notes sections, wired to the Applications API. Application
 * status is tracked independently from the job board status (the job
 * header already owns that selector).
 */
export function ApplicationPanel({ job }: { job: Job }) {
  const { data: applications, isPending } = useApplications(job.id);
  const createMutation = useCreateApplication(job.id);
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  // List is `latest('id')` first — index 0 is the current record.
  const application = applications?.[0];

  return (
    <>
      <ApplicationStatus
        job={job}
        application={application}
        isPending={isPending}
        isSaving={
          createMutation.isPending ||
          updateMutation.isPending ||
          deleteMutation.isPending
        }
        onCreate={(input) => createMutation.mutate(input)}
        onUpdate={(input) => {
          if (!application) {
            return;
          }
          updateMutation.mutate({
            id: application.id,
            input,
          });
        }}
        onDelete={() => {
          if (application) {
            deleteMutation.mutate(application.id);
          }
        }}
      />

      <ApplicationTimeline
        job={job}
        application={application}
        isPending={isPending}
      />

      <NotesCard
        applicationId={application?.id}
        initialNotes={application?.notes ?? null}
        isSaving={updateMutation.isPending}
        onSave={(notes) => {
          if (application) {
            updateMutation.mutate({ id: application.id, input: { notes } });
          }
        }}
      />
    </>
  );
}
