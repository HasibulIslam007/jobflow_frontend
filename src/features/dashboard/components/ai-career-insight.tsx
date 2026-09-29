'use client';

import {
  CircleAlertIcon,
  CircleCheckIcon,
  GaugeIcon,
  SparklesIcon,
} from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AiInsights } from '@/features/dashboard/types';
import { cn } from 'cn';

function formatConfidence(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`;
}

function formatQuality(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)}/100`;
}

/**
 * The single most useful sentence on the dashboard, written by rule from
 * the two scores and the missing-info count we were given. No model is
 * called and no field is guessed — the API does not tell us *which* fields
 * are missing, only how many jobs are incomplete, so the copy stays at that
 * level of specificity on purpose.
 */
function assistantLine(insights: AiInsights): string {
  const { average_confidence, missing_information_count: missing } = insights;

  if (average_confidence === null && missing === 0) {
    return 'Start adding jobs to generate insights.';
  }
  if (missing > 0) {
    return `Your biggest improvement opportunity is completing ${missing} ${
      missing === 1 ? 'job' : 'jobs'
    } that are missing key details.`;
  }
  if (average_confidence !== null && average_confidence >= 0.85) {
    return 'Your saved jobs are well organized. AI is reading them cleanly.';
  }

  return 'Every job has its details. Pasting fuller descriptions will raise extraction confidence.';
}

function AiStat({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof GaugeIcon;
  tone: 'ai' | 'success' | 'warning';
}) {
  const toneClass = {
    ai: 'text-ai',
    success: 'text-success',
    warning: 'text-warning',
  }[tone];

  return (
    <div className="rounded-lg border border-ai/15 bg-card/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon aria-hidden="true" className={cn('size-3.5', toneClass)} />
        <span className="text-micro font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <p
        data-tabular="true"
        className="mt-1 font-heading text-lg leading-none font-semibold text-foreground"
      >
        {value}
      </p>
      <p className="mt-1 text-micro text-muted-foreground">{hint}</p>
    </div>
  );
}

/**
 * AI insight panel — the assistant voice of the dashboard.
 */
function AiCareerInsight({ insights }: { insights: AiInsights }) {
  const missing = insights.missing_information_count;

  return (
    <AiCard title="AI career insight" description="How your pipeline is performing">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
          <AiStat
            label="Avg. confidence"
            value={formatConfidence(insights.average_confidence)}
            hint="AI extraction certainty"
            icon={GaugeIcon}
            tone="ai"
          />
          <AiStat
            label="Avg. quality"
            value={formatQuality(insights.average_quality_score)}
            hint="Posting completeness"
            icon={CircleCheckIcon}
            tone="success"
          />
          <AiStat
            label="Needs info"
            value={String(missing)}
            hint="Jobs missing key details"
            icon={CircleAlertIcon}
            tone={missing > 0 ? 'warning' : 'success'}
          />
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-ai/20 bg-ai/[0.06] px-3 py-2.5 text-caption text-pretty text-foreground">
          <SparklesIcon
            aria-hidden="true"
            className="mt-px size-3.5 shrink-0 text-ai"
          />
          {assistantLine(insights)}
        </p>
      </div>
    </AiCard>
  );
}

function AiCareerInsightSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-ai/20 bg-ai/[0.03] p-4"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-40" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export { AiCareerInsight, AiCareerInsightSkeleton };
