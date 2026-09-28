'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, FileTextIcon, SparklesIcon } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';
import { ResumeAnalysisView } from '@/features/resume/components/resume-analysis';
import { ResumeCard } from '@/features/resume/components/resume-card';
import { ResumeUpload } from '@/features/resume/components/resume-upload';
import { useResumes } from '@/features/resume/hooks';
import type { Resume } from '@/features/resume/types';

function ResumeListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}

function errorMessageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Please sign in again to see your resumes.';
    return error.message || 'Could not load your resumes.';
  }

  return error instanceof Error ? error.message : 'Could not load your resumes.';
}

/**
 * /resume — Resume Intelligence (Phase 5.6): drag & drop upload, resume
 * cards with status/AI score, and the AI analysis panel. Two-column on
 * desktop (cards | analysis), single column on mobile.
 */
function ResumeContent() {
  const { data: resumes, isPending, isError, error, refetch } = useResumes();
  const [selected, setSelected] = useState<Resume | null>(null);

  // Keep the selected resume in sync with the freshest server copy
  // (e.g. after an upload invalidates the list).
  const active =
    (selected && resumes?.find((resume) => resume.id === selected.id)) ||
    null;

  const toggleView = (resume: Resume) => {
    setSelected((current) => (current?.id === resume.id ? null : resume));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="JobFlow AI · Resume Intelligence"
        title="My Resume"
        description="Let AI understand and improve your CV."
        actions={
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/dashboard" />}
            nativeButton={false}
          >
            <ArrowLeftIcon />
            Dashboard
          </Button>
        }
      />

      <section aria-labelledby="upload-heading" className="space-y-3">
        <h2
          id="upload-heading"
          className="text-section-title font-heading text-foreground"
        >
          Upload a resume
        </h2>
        <ResumeUpload />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="resumes-heading" className="min-w-0 space-y-3">
          <h2
            id="resumes-heading"
            className="text-section-title font-heading text-foreground"
          >
            Your resumes
          </h2>

          {isPending ? (
            <ResumeListSkeleton />
          ) : isError || !resumes ? (
            <ErrorState
              title="Could not load your resumes"
              description={errorMessageFor(error)}
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          ) : resumes.length === 0 ? (
            <EmptyState
              size="compact"
              icon={FileTextIcon}
              title="No resumes yet"
              description="Upload your PDF resume above — AI will extract your skills, experience and projects."
            />
          ) : (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  selected={active?.id === resume.id}
                  onView={toggleView}
                />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="analysis-heading" className="min-w-0 space-y-3">
          <h2
            id="analysis-heading"
            className="flex items-center gap-2 text-section-title font-heading text-foreground"
          >
            <SparklesIcon className="size-4 text-ai" aria-hidden="true" />
            AI analysis
          </h2>

          {active ? (
            <ResumeAnalysisView resume={active} />
          ) : (
            <EmptyState
              size="compact"
              icon={SparklesIcon}
              title="No analysis selected"
              description="Choose “View Analysis” on a resume to see its AI insights — summary, skills, experience, projects and gaps."
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default function ResumePage() {
  return <ResumeContent />;
}
