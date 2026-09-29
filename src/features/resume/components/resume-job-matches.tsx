'use client';

import Link from 'next/link';
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  CheckCircle2Icon,
  Loader2Icon,
  SparklesIcon,
  TargetIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import { useJobs } from '@/features/jobs/hooks';
import type { Job } from '@/features/jobs/types';
import { useMatchResume, useResumeMatch } from '@/features/resume/hooks';
import type { Resume, ResumeMatch } from '@/features/resume/types';
import { cn } from 'cn';

/**
 * How many jobs to offer for matching. Each match is a real AI run triggered
 * by the user, so this is a shortlist rather than an exhaustive list — the
 * rest stay reachable from the jobs workspace.
 */
const MATCH_CANDIDATE_LIMIT = 6;

/**
 * `match_score` comes from `ResumeMatchResource` (0–100), computed
 * server-side. Thresholds mirror the resume health band so an 86% job match
 * and an 86 ATS score read as equally strong.
 */
function matchBand(score: number): {
  label: string;
  text: string;
  tone: StatusTone;
} {
  if (score >= 80) {
    return { label: 'Strong match', text: 'text-success', tone: 'success' };
  }
  if (score >= 60) {
    return { label: 'Good match', text: 'text-ai', tone: 'ai' };
  }

  return { label: 'Low match', text: 'text-warning', tone: 'warning' };
}

/**
 * Every match generated against this resume, anywhere in the session,
 * keyed by job id.
 *
 * Why not a query: `useResumeMatch` is `enabled: false` and only ever holds
 * data that `useMatchResume` wrote into the cache with `setQueryData`. There
 * is no endpoint that lists a resume's saved matches, so this reads the cache
 * directly — via `useSyncExternalStore` over the query cache's event bus so
 * it stays reactive as matches are generated.
 *
 * `getSnapshot` must return a referentially stable value between changes or
 * React will loop, hence the signature cache.
 */
export function useMatchesForResume(resumeId: number): Map<number, ResumeMatch> {
  const queryClient = useQueryClient();
  const lastRef = useRef<{
    signature: string;
    value: Map<number, ResumeMatch>;
  } | null>(null);

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(() => onStoreChange()),
    [queryClient],
  );

  const getSnapshot = useCallback(() => {
    const entries: Array<[number, ResumeMatch]> = [];

    for (const query of queryClient.getQueryCache().getAll()) {
      if (query.queryKey[1] !== 'match') continue;

      const match = query.state.data as ResumeMatch | undefined;
      if (!match || match.resume_id !== resumeId) continue;

      entries.push([match.job_id, match]);
    }

    entries.sort((a, b) => a[0] - b[0]);

    const signature = entries
      .map(([jobId, match]) => `${jobId}:${match.match_score}`)
      .join('|');
    const cached = lastRef.current;

    if (cached && cached.signature === signature) return cached.value;

    const value = new Map(entries);
    lastRef.current = { signature, value };

    return value;
  }, [queryClient, resumeId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function SkillChips({
  skills,
  tone,
}: {
  skills: string[];
  tone: 'matched' | 'missing';
}) {
  const Icon = tone === 'matched' ? CheckCircle2Icon : TriangleAlertIcon;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <li key={skill} className="min-w-0 max-w-full">
          <Badge
            variant="outline"
            className={cn(
              'flex max-w-full items-center gap-1 font-normal',
              // Skills like "Senior leadership experience" are whole phrases —
              // without these they overflow the card rather than wrapping.
              'break-words whitespace-normal text-left',
              tone === 'matched'
                ? 'border-success/35 bg-success/5 text-success'
                : 'border-warning/40 bg-warning/5 text-warning',
            )}
          >
            <Icon aria-hidden="true" className="size-3 shrink-0" />
            <span className="min-w-0">{skill}</span>
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function MatchScore({ score }: { score: number }) {
  const band = matchBand(score);

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <span className="flex items-baseline gap-0.5">
        <span
          data-tabular="true"
          className={cn(
            'font-heading text-2xl leading-none font-semibold tracking-tight',
            band.text,
          )}
        >
          {score}
        </span>
        <span className="text-caption text-muted-foreground">%</span>
      </span>

      {/* The bar renders `match_score` directly — a second copy of one
          number, not a second derivation of it. */}
      <span
        aria-hidden="true"
        className="h-1.5 w-20 overflow-hidden rounded-full bg-foreground/10"
      >
        <span
          className={cn(
            'block h-full rounded-full transition-[width] duration-700 ease-out',
            band.tone === 'success'
              ? 'bg-success'
              : band.tone === 'ai'
                ? 'bg-ai'
                : 'bg-warning',
          )}
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </span>

      <span className="text-micro text-muted-foreground">{band.label}</span>
    </div>
  );
}

/**
 * One job, one match. Each card owns its own mutation so jobs can be matched
 * independently, and nothing here runs on mount — a match only exists once
 * the user asks for it.
 */
function JobMatchCard({ job, resume }: { job: Job; resume: Resume }) {
  const { data: cachedMatch } = useResumeMatch(job.id, resume.id);
  const mutation = useMatchResume(job.id);

  // The mutation writes under the same cache key the read above observes, so
  // a freshly generated match renders here with no local state.
  const match: ResumeMatch | undefined =
    cachedMatch ??
    (mutation.data?.resume_id === resume.id ? mutation.data : undefined);

  const errorMessage =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : null;

  // The API surfaces provider failures verbatim — a Gemini/OpenAI JSON body
  // with a request id. Dumping that into the card is unreadable and blows the
  // layout out to full height, so the headline is human and the raw text
  // stays one hover away for anyone debugging.
  const errorDetail = errorMessage ? `AI service error: ${errorMessage}` : null;

  const hasDetail = (m: ResumeMatch | undefined) =>
    !!m &&
    (m.matched_skills.length > 0 ||
      m.missing_skills.length > 0 ||
      m.recommendations.length > 0);

  return (
    <Card interactive className="min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <CardDescription className="truncate text-caption">
              {job.company}
            </CardDescription>
            <CardTitle className="truncate" title={job.title}>
              {job.title}
            </CardTitle>
          </div>

          {match ? (
            <MatchScore score={match.match_score} />
          ) : (
            <StatusPill label="Not matched" tone="neutral" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorDetail ? (
          <p
            role="alert"
            title={errorDetail}
            className="flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/[0.05] px-2.5 py-2 text-caption text-destructive"
          >
            <TriangleAlertIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Couldn&apos;t generate the match — the AI service is busy right
              now. Try again in a moment.
            </span>
          </p>
        ) : null}

        {match ? (
          hasDetail(match) ? (
            <>
              {match.matched_skills.length > 0 ? (
                <section className="space-y-1.5">
                  <p className="text-micro font-medium text-success">
                    Strong matches
                  </p>
                  <SkillChips
                    skills={match.matched_skills}
                    tone="matched"
                  />
                </section>
              ) : null}

              {match.missing_skills.length > 0 ? (
                <section className="space-y-1.5">
                  <p className="text-micro font-medium text-warning">
                    Missing skills
                  </p>
                  <SkillChips
                    skills={match.missing_skills}
                    tone="missing"
                  />
                </section>
              ) : null}

              {match.recommendations.length > 0 ? (
                <section className="space-y-1.5">
                  <p className="text-micro font-medium text-ai">
                    Recommendations
                  </p>
                  <ul className="space-y-1">
                    {match.recommendations.map((recommendation) => (
                      <li
                        key={recommendation}
                        className="text-caption text-pretty text-muted-foreground"
                      >
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : (
            <p className="text-caption text-muted-foreground italic">
              The AI returned a score for this role but no supporting detail.
            </p>
          )
        ) : (
          <p className="text-caption text-pretty text-muted-foreground">
            Score this resume against the role to see matched skills, gaps and
            tailored advice.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          <Button
            variant={match ? 'outline' : 'ai'}
            size="sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(resume.id)}
          >
            {mutation.isPending ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <SparklesIcon aria-hidden="true" />
            )}
            {mutation.isPending
              ? 'Matching…'
              : match
                ? 'Re-run Match'
                : 'Generate Match'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/jobs/${job.id}`} />}
            nativeButton={false}
          >
            View Job
            <ArrowUpRightIcon aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Job matches — this resume against the jobs already in the workspace.
 *
 * The constraint that shapes this panel: `routes/api.php` exposes no "list
 * matches for a resume" endpoint. A match only comes into existence through
 * `POST /jobs/{job}/match-resume/{resume}`, and `useMatchResume` caches the
 * result under `resumeMatchKey(jobId, resumeId)`.
 *
 * So this does not present a saved-match list it cannot fetch. It surfaces
 * the matches that genuinely exist — read from the cache, which means any
 * match generated here *or* on /jobs/[id] shows up — and offers to generate
 * the rest on demand. Cards for already-scored jobs float to the top. Every
 * number shown is one the API actually returned; nothing is pre-populated
 * with a plausible-looking placeholder score.
 */
export function ResumeJobMatches({ resume }: { resume: Resume }) {
  const { jobs, isPending, isError } = useJobs({
    per_page: MATCH_CANDIDATE_LIMIT,
  });

  const matches = useMatchesForResume(resume.id);

  // Already-scored jobs first, best match leading — the panel answers
  // "where am I strongest?" before asking for more work.
  const candidates = useMemo(() => {
    return jobs
      .slice(0, MATCH_CANDIDATE_LIMIT)
      .map((job) => ({ job, match: matches.get(job.id) }))
      .sort((a, b) => {
        if (a.match && !b.match) return -1;
        if (!a.match && b.match) return 1;
        if (a.match && b.match) return b.match.match_score - a.match.match_score;

        return 0;
      })
      .map((entry) => entry.job);
  }, [jobs, matches]);

  return (
    <section aria-labelledby="job-matches-heading" className="space-y-4">
      <div className="space-y-1">
        <h2
          id="job-matches-heading"
          className="flex items-center gap-2 text-section-title font-heading text-foreground"
        >
          <TargetIcon className="size-4 text-ai" aria-hidden="true" />
          Job Matches
        </h2>
        <p className="text-caption text-pretty text-muted-foreground">
          {matches.size > 0
            ? `${matches.size} ${matches.size === 1 ? 'job' : 'jobs'} scored against this resume.`
            : 'Score this resume against the jobs you are tracking.'}
        </p>
      </div>

      {isPending ? (
        <ResumeJobMatchesSkeleton />
      ) : isError ? (
        <EmptyState
          size="compact"
          icon={BriefcaseIcon}
          title="Could not load your jobs"
          description="Matching needs your job list. Save a job to the workspace and it will appear here, ready to score."
        />
      ) : candidates.length === 0 ? (
        <EmptyState
          size="compact"
          icon={BriefcaseIcon}
          title="No jobs to match against yet"
          description="Save a job to your workspace and it will show up here, ready to score against this resume."
          action={
            <Button
              size="sm"
              render={<Link href="/jobs/create" />}
              nativeButton={false}
            >
              Add a job
            </Button>
          }
        />
      ) : (
        // Single column: this panel lives inside the half-width page column,
        // so a further split here would squeeze cards to ~170px. Cards only
        // fan out when the page itself is full width (no analysis beside them).
        <div className="grid gap-4 2xl:grid-cols-2">
          {candidates.map((job) => (
            <JobMatchCard key={job.id} job={job} resume={resume} />
          ))}
        </div>
      )}
    </section>
  );
}

export function ResumeJobMatchesSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-4 2xl:grid-cols-2"
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}
