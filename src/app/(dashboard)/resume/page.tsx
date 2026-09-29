'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronUpIcon, FileTextIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { FadeIn, SlideUp, Stagger, StaggerItem } from '@/components/ui/motion';
import { ResumeAnalysisDashboard } from '@/features/resume/components/resume-analysis-dashboard';
import { ResumeHeader } from '@/features/resume/components/resume-header';
import {
  ResumeHealthCard,
  ResumeHealthCardSkeleton,
} from '@/features/resume/components/resume-health-card';
import {
  ResumeJobMatches,
  useMatchesForResume,
} from '@/features/resume/components/resume-job-matches';
import { ResumeImprovementPlan } from '@/features/resume/components/resume-improvement-plan';
import {
  ResumeLibrary,
  ResumeLibrarySkeleton,
} from '@/features/resume/components/resume-library';
import { ResumeUpload } from '@/features/resume/components/resume-upload';
import { SkillIntelligence } from '@/features/resume/components/skill-intelligence';
import { useResumes } from '@/features/resume/hooks';
import type { Resume, ResumeMatch } from '@/features/resume/types';
import { ApiError } from '@/lib/api';

const EASE = [0.16, 1, 0.3, 1] as const;

function errorMessageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Please sign in again to see your resumes.';

    return error.message || 'Could not load your resumes.';
  }

  return error instanceof Error ? error.message : 'Could not load your resumes.';
}

/**
 * The resume the whole dashboard is describing.
 *
 * Defaults to the first analyzed resume so a first-time visitor lands on real
 * data instead of an empty "pick one" prompt; an explicit choice always wins
 * and survives list refetches, because the selection is stored as an id and
 * re-resolved against the freshest server copy on every render.
 */
function resolveActive(
  resumes: Resume[] | undefined,
  selectedId: number | null,
): Resume | null {
  if (!resumes || resumes.length === 0) return null;

  const chosen = selectedId
    ? resumes.find((resume) => resume.id === selectedId)
    : undefined;

  if (chosen) return chosen;

  return resumes.find((resume) => resume.status === 'completed') ?? resumes[0];
}

/** Highest-scoring match for this resume, if any has been generated. */
function bestMatch(matches: Map<number, ResumeMatch>): ResumeMatch | null {
  let best: ResumeMatch | null = null;

  for (const match of matches.values()) {
    if (!best || match.match_score > best.match_score) best = match;
  }

  return best;
}

/**
 * /resume — AI Resume Intelligence Center (Phase 6.6).
 *
 * Reading order is deliberate: prove the resume is good (health score),
 * show what AI understood (analysis + skill intelligence), show where it
 * applies (job matches), then say what to fix (improvement plan). The
 * library sits last because it is the control surface, not the content.
 *
 * Selection lives in an id, not an object, so an upload that invalidates the
 * list never leaves a stale copy of the resume on screen.
 */
function ResumeContent() {
  const { data: resumes, isPending, isError, error, refetch, isFetching } =
    useResumes();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const uploadRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const active = resolveActive(resumes, selectedId);
  const matches = useMatchesForResume(active?.id ?? 0);
  const match = useMemo(() => bestMatch(matches), [matches]);

  const hasResumes = Boolean(resumes && resumes.length > 0);

  // "Upload Resume" scrolls to the panel and opens it — one action, and the
  // user never has to hunt for the dropzone after clicking it.
  const openUpload = useCallback(() => {
    setUploadOpen(true);
    requestAnimationFrame(() => {
      uploadRef.current?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'center',
      });
    });
  }, [reduced]);

  const selectResume = useCallback((resume: Resume) => {
    setSelectedId((current) => (current === resume.id ? current : resume.id));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <ResumeHeader
          onUpload={openUpload}
          onAnalyzeAgain={() => refetch()}
          canAnalyze={hasResumes}
          isAnalyzing={isFetching}
        />
      </FadeIn>

      {/* Upload panel — secondary once a resume exists, primary when none does. */}
      <AnimatePresence initial={false}>
        {uploadOpen || !hasResumes ? (
          <motion.div
            key="upload"
            ref={uploadRef}
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0 : 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <SlideUp>
              <section
                aria-labelledby="upload-heading"
                className="rounded-xl border border-border/80 bg-card/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2
                    id="upload-heading"
                    className="text-card-title font-heading text-foreground"
                  >
                    Upload a resume
                  </h2>

                  {hasResumes ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setUploadOpen(false)}
                      aria-label="Collapse upload panel"
                    >
                      <ChevronUpIcon aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>

                <ResumeUpload onComplete={() => refetch()} />
              </section>
            </SlideUp>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isPending ? (
        <div className="space-y-4">
          <ResumeHealthCardSkeleton />
          <ResumeLibrarySkeleton />
        </div>
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
        /* Premium first-run state (Part 11). */
        <EmptyState
          icon={FileTextIcon}
          title="No resume analyzed yet"
          description="Upload your resume and AI will read it — pulling out your skills, experience and projects, scoring it against ATS standards, and finding the jobs it fits best."
          action={
            <Button variant="ai" onClick={openUpload}>
              Upload your resume
            </Button>
          }
        />
      ) : !active ? null : (
        <Stagger stagger={0.06} className="flex flex-col gap-6">
          <StaggerItem>
            <ResumeHealthCard resume={active} />
          </StaggerItem>

          {/* Analysis (wide) beside Job Matches, side by side on desktop,
              stacked on mobile. */}
          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <StaggerItem className="flex min-w-0 flex-col gap-6">
              <ResumeAnalysisDashboard resume={active} />
              <SkillIntelligence resume={active} match={match} />
            </StaggerItem>

            <StaggerItem className="flex min-w-0 flex-col gap-6">
              <ResumeJobMatches resume={active} />
              <ResumeImprovementPlan resume={active} match={match} />
            </StaggerItem>
          </div>

          <StaggerItem>
            <section aria-labelledby="library-heading" className="space-y-4">
              <div className="space-y-1">
                <h2
                  id="library-heading"
                  className="flex items-center gap-2 text-section-title font-heading text-foreground"
                >
                  <FileTextIcon className="size-4" aria-hidden="true" />
                  Resume Library
                </h2>
                <p className="text-caption text-pretty text-muted-foreground">
                  Everything you have uploaded. Select one to run the
                  dashboard above against it.
                </p>
              </div>

              <ResumeLibrary
                resumes={resumes}
                selectedId={active.id}
                onView={selectResume}
              />
            </section>
          </StaggerItem>
        </Stagger>
      )}
    </div>
  );
}

export default function ResumePage() {
  return <ResumeContent />;
}

