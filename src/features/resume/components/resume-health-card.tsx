'use client';

import { GaugeIcon, SparklesIcon } from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import type { Resume } from '@/features/resume/types';
import { cn } from 'cn';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Band = 'excellent' | 'good' | 'needs-work';

const BAND_META: Record<
  Band,
  { label: string; text: string; stroke: string; tone: StatusTone }
> = {
  excellent: {
    label: 'Excellent',
    text: 'text-success',
    stroke: 'stroke-success',
    tone: 'success',
  },
  good: { label: 'Good', text: 'text-ai', stroke: 'stroke-ai', tone: 'ai' },
  'needs-work': {
    label: 'Needs improvement',
    text: 'text-warning',
    stroke: 'stroke-warning',
    tone: 'warning',
  },
};

/**
 * Labels the score the API already calculated. These thresholds are
 * presentation bands, not a second scoring pass — `ResumeAnalysisService`
 * derives `ai_score` server-side and nothing here recomputes or adjusts it.
 */
function bandFor(score: number): Band {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';

  return 'needs-work';
}

/**
 * Public banding helper so the health ring and the resume library never
 * disagree about what an 84 means.
 */
export function resumeScoreBand(score: number): {
  label: string;
  text: string;
  tone: StatusTone;
} {
  return BAND_META[bandFor(score)];
}

/**
 * Explanation built *only* from the counts the score is actually made of
 * (the backend formula rewards skills and roles, and subtracts for flagged
 * gaps). No specific advice is invented here — naming a missing technology
 * would be a guess, so that job belongs to the improvement plan, which
 * quotes the AI verbatim.
 */
function explain(
  band: Band,
  skills: number,
  roles: number,
  gaps: number,
): string {
  if (gaps === 0 && band === 'excellent') {
    return 'No gaps flagged — AI found the skills and history recruiters look for.';
  }
  if (gaps === 0) {
    return `No gaps flagged. ${skills} skills across ${roles} ${roles === 1 ? 'role' : 'roles'} give AI solid ground to work from.`;
  }
  if (gaps <= 2) {
    return `${gaps} gap${gaps === 1 ? '' : 's'} flagged. Closing ${gaps === 1 ? 'it' : 'them'} is the fastest lift on this score.`;
  }

  return `${gaps} gaps flagged — work them off in order from the improvement plan below.`;
}

function Factor({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-micro text-muted-foreground">{label}</dt>
      <dd
        data-tabular="true"
        className="font-heading text-section-title leading-none font-semibold text-foreground"
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Resume health: the ATS score the backend produced, with the reasoning
 * beside it.
 *
 * The three figures on the right are the exact inputs
 * `ResumeAnalysisService::calculateScore()` uses — skills extracted, roles
 * listed and gaps flagged. Showing them makes the number auditable instead
 * of magic, without the client ever re-deriving it.
 */
export function ResumeHealthCard({ resume }: { resume: Resume }) {
  const analysis = resume.analysis;
  const score = resume.ai_score;

  if (score === null || resume.status !== 'completed') {
    return (
      <AiCard
        title="AI Resume Health"
        description="Your ATS score, as calculated by the analysis pipeline"
        icon={<GaugeIcon className="size-4" />}
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full border border-dashed border-ai/25 text-ai"
          >
            <SparklesIcon className="size-5" />
          </span>
          <p className="text-body text-pretty text-muted-foreground">
            {resume.status === 'processing'
              ? 'Analysis is still running — the score appears here as soon as it lands.'
              : resume.status === 'failed'
                ? 'Analysis failed for this resume, so there is no score to show. Upload it again to retry.'
                : 'No score yet. Upload a resume — AI scores it as soon as it reads it.'}
          </p>
        </div>
      </AiCard>
    );
  }

  const band = bandFor(score);
  const meta = BAND_META[band];
  const skills = analysis?.skills.length ?? 0;
  const roles = analysis?.experience.length ?? 0;
  const gaps = analysis?.missing_information.length ?? 0;
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <AiCard
      title="AI Resume Health"
      description="Your ATS score, as calculated by the analysis pipeline"
      icon={<GaugeIcon className="size-4" />}
      action={<StatusPill label={meta.label} tone={meta.tone} showDot />}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative shrink-0 self-center sm:self-auto">
          <svg
            viewBox="0 0 120 120"
            className="size-28 -rotate-90"
            role="img"
            aria-label={`ATS score ${score} out of 100 — ${meta.label}`}
          >
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              className="stroke-foreground/10"
            />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(
                meta.stroke,
                'transition-[stroke-dashoffset] duration-700 ease-out',
              )}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              data-tabular="true"
              className="font-heading text-2xl leading-none font-semibold text-foreground"
            >
              {score}
            </span>
            <span className="text-micro text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className={cn('text-section-title font-heading', meta.text)}>
            {meta.label}
          </p>
          <p className="text-caption text-pretty text-muted-foreground">
            {explain(band, skills, roles, gaps)}
          </p>
        </div>

        {analysis ? (
          <dl className="grid shrink-0 grid-cols-3 gap-4 border-t border-ai/15 pt-4 sm:gap-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
            <Factor label="Skills" value={skills} />
            <Factor label="Roles" value={roles} />
            <Factor label="Gaps" value={gaps} />
          </dl>
        ) : null}
      </div>
    </AiCard>
  );
}

export function ResumeHealthCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-ai/20 bg-ai/[0.03] p-4"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-52" />
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Skeleton className="size-28 shrink-0 self-center rounded-full sm:self-auto" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-12 w-40 shrink-0" />
      </div>
    </div>
  );
}
