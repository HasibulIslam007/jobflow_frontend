'use client';

import { SparklesIcon } from 'lucide-react';

import { GlassCard, GlassCardSheen } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CareerScore } from '@/features/analytics/types';
import { cn } from 'cn';

/**
 * CAREER HEALTH — the headline number.
 *
 * Distinct from the dashboard's `CareerScoreCard`, which summarises job
 * capture quality. This one is the weighted career score: resume, activity,
 * conversion and matching, each already 0–100 before weighting.
 *
 * The ring is drawn with a conic gradient rather than SVG so it inherits the
 * theme tokens and stays legible in both colour schemes without a second
 * stylesheet. `role="img"` + a text alternative keeps it readable to screen
 * readers, which would otherwise announce nothing.
 */
export function CareerScoreCard({ careerScore }: { careerScore: CareerScore }) {
  const { score, label, factors } = careerScore;

  return (
    <GlassCard className="p-5" aria-labelledby="career-score-heading">
      <GlassCardSheen />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="career-score-heading"
            className="text-section-title font-heading text-foreground"
          >
            Career Health
          </h2>
          <p className="mt-0.5 text-caption text-pretty text-muted-foreground">
            A weighted read on your resume, activity, interviews and matching.
          </p>
        </div>

        <SparklesIcon className="size-4 shrink-0 text-ai" aria-hidden="true" />
      </div>

      <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <ScoreRing score={score} label={label} />

        <ul className="w-full min-w-0 flex-1 space-y-2.5">
          {factors.map((factor) => (
            <li key={factor.key} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-caption text-muted-foreground">
                  {factor.label}
                </span>
                <span
                  data-tabular="true"
                  className="shrink-0 text-caption font-medium text-foreground"
                >
                  {factor.score}
                  <span className="text-muted-foreground">/{factor.weight}%</span>
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={factor.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${factor.label} score`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn('h-full rounded-full', BAR_TONE[barTone(factor.score)])}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}

const BAR_TONE = {
  strong: 'bg-success',
  moderate: 'bg-ai',
  weak: 'bg-warning',
  none: 'bg-muted-foreground/30',
} as const;

/** Same bands the backend uses, so the bar and the headline never disagree. */
function barTone(score: number): keyof typeof BAR_TONE {
  if (score >= 85) return 'strong';
  if (score >= 70) return 'moderate';
  if (score > 0) return 'weak';

  return 'none';
}

const RING_STROKE = {
  Excellent: 'stroke-success',
  'Strong Candidate': 'stroke-ai',
  Developing: 'stroke-warning',
  'Needs Improvement': 'stroke-destructive',
} as const;

/**
 * SVG ring rather than a conic gradient: the sweep is a real stroked circle
 * driven by `stroke-dasharray`, so it stays crisp at any size, inherits theme
 * tokens through a class, and needs no magic `var(--…)` string building.
 */
function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  // score is already clamped to 0–100 by the API.
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const stroke = RING_STROKE[label as keyof typeof RING_STROKE] ?? RING_STROKE.Developing;

  return (
    <div className="relative flex size-32 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="size-full -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn('transition-[stroke-dasharray] duration-700 ease-out', stroke)}
        />
      </svg>

      <div
        role="img"
        aria-label={`Career health score ${score} out of 100 — ${label}`}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span
          data-tabular="true"
          className="font-heading text-3xl leading-none font-semibold text-foreground"
        >
          {score}
        </span>
        <span className="mt-0.5 text-micro text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function CareerScoreCardSkeleton() {
  return (
    <GlassCard className="p-5" aria-hidden="true">
      <Skeleton className="h-5 w-32 rounded" />
      <Skeleton className="mt-2 h-4 w-64 rounded" />
      <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row">
        <Skeleton className="size-32 shrink-0 rounded-full" />
        <div className="w-full flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
