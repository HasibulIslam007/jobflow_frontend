'use client';

import { SparklesIcon } from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AiInsights } from '@/features/dashboard/types';
import { cn } from 'cn';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A single 0–100 health figure, blended from the two scores the API
 * actually returns. Confidence (how sure the AI was) and quality (how
 * complete the posting is) are weighted equally because neither dominates
 * a "career health" reading on its own.
 *
 * @param averageConfidence 0–1 extraction certainty, or null.
 * @param averageQuality 0–100 posting completeness, or null.
 */
function healthScore(
  averageConfidence: number | null,
  averageQuality: number | null,
): number | null {
  const parts: number[] = [];

  if (averageConfidence !== null) {
    parts.push(averageConfidence * 100);
  }
  if (averageQuality !== null) {
    parts.push(averageQuality);
  }

  if (parts.length === 0) {
    return null;
  }

  return Math.round(parts.reduce((sum, part) => sum + part, 0) / parts.length);
}

function healthLabel(score: number): { label: string; tone: string } {
  if (score >= 80) {
    return { label: 'Excellent', tone: 'text-success' };
  }
  if (score >= 60) {
    return { label: 'Good', tone: 'text-ai' };
  }
  if (score >= 40) {
    return { label: 'Fair', tone: 'text-warning' };
  }

  return { label: 'Needs attention', tone: 'text-destructive' };
}

/**
 * Explanatory line, derived *only* from the two numbers we were given.
 * The dashboard payload carries a count of incomplete jobs, not which
 * fields are missing, so this deliberately does not name a specific field
 * — claiming "add salary information" would be a guess dressed as insight.
 */
function healthExplanation(insights: AiInsights, score: number): string {
  const missing = insights.missing_information_count;

  if (missing === 0 && score >= 80) {
    return 'Your saved jobs are well organized — AI has what it needs to work with.';
  }
  if (missing === 0) {
    return 'Every job is complete. Raising extraction quality means capturing richer descriptions.';
  }
  if (missing <= 3) {
    return `${missing} ${missing === 1 ? 'job is' : 'jobs are'} missing key details — opening them and filling the gaps sharpens every AI match.`;
  }

  return `${missing} jobs are missing key details. That is your biggest improvement opportunity — completeness drives match quality.`;
}

/**
 * AI Career Health: one glanceable number with the reasoning beneath it.
 */
function CareerScoreCard({ insights }: { insights: AiInsights }) {
  const score = healthScore(
    insights.average_confidence,
    insights.average_quality_score,
  );
  const meta = score === null ? null : healthLabel(score);
  const offset = score === null ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - score / 100);

  return (
    <AiCard title="AI Career Health" description="How well AI can work with your pipeline">
      {score === null || meta === null ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full border border-dashed border-ai/25 text-ai"
          >
            <SparklesIcon className="size-5" />
          </span>
          <p className="text-body text-pretty text-muted-foreground">
            Start adding jobs to generate insights.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <svg
              viewBox="0 0 120 120"
              className="size-28 -rotate-90"
              role="img"
              aria-label={`AI Career Health ${score} out of 100, ${meta.label}`}
            >
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                strokeWidth="8"
                className="stroke-ai/15"
              />
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={cn('stroke-ai transition-[stroke-dashoffset] duration-700 ease-out')}
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

          <div className="min-w-0 space-y-1.5">
            <p className={cn('text-section-title font-heading', meta.tone)}>
              {meta.label}
            </p>
            <p className="text-caption text-pretty text-muted-foreground">
              {healthExplanation(insights, score)}
            </p>
          </div>
        </div>
      )}
    </AiCard>
  );
}

function CareerScoreCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-ai/20 bg-ai/[0.03] p-4"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-44" />
      <div className="mt-5 flex items-center gap-5">
        <Skeleton className="size-28 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

export { CareerScoreCard, CareerScoreCardSkeleton, healthScore };
