'use client';

import { AlertTriangleIcon, ListChecksIcon, LightbulbIcon } from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Resume, ResumeMatch } from '@/features/resume/types';

const SOURCE_META = {
  analysis: {
    label: 'Resume analysis',
    icon: AlertTriangleIcon,
    className: 'text-warning',
  },
  match: {
    label: 'Job match',
    icon: LightbulbIcon,
    className: 'text-ai',
  },
} as const;

type Source = keyof typeof SOURCE_META;

type PlanItem = {
  text: string;
  source: Source;
};

/**
 * Improvement plan — an ordered, actionable rendering of text the AI
 * already produced.
 *
 * Sources, and only these:
 *   - `analysis.missing_information` (gaps a recruiter would notice)
 *   - `match.recommendations` (steps for one specific job)
 *
 * No copy is written here. The panel previously-absent temptation is to
 * pad a short plan with plausible-sounding advice ("add project metrics");
 * anything not returned by the model would be invented guidance attributed
 * to an AI that never said it, which is the one thing this page must never
 * do. Where there is nothing to show, the honest answer is an empty state.
 */
export function ResumeImprovementPlan({
  resume,
  match,
}: {
  resume: Resume;
  match?: ResumeMatch | null;
}) {
  const gaps = resume.analysis?.missing_information ?? [];
  const recommendations = match?.recommendations ?? [];

  const seen = new Set<string>();
  const items: PlanItem[] = [];

  for (const [list, source] of [
    [gaps, 'analysis'],
    [recommendations, 'match'],
  ] as const) {
    for (const raw of list) {
      const text = raw.trim();
      const key = text.toLowerCase();

      if (!key || seen.has(key)) continue;

      seen.add(key);
      items.push({ text, source });
    }
  }

  return (
    <AiCard
      title="Improvement Plan"
      description="Ordered from the AI's own findings — nothing added, nothing reworded"
      icon={<ListChecksIcon className="size-4" />}
    >
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ai/20 px-4 py-8 text-center">
          <p className="text-body text-pretty text-muted-foreground">
            {resume.status === 'completed'
              ? 'Nothing to fix yet — the analysis flagged no gaps. Generate a job match to get role-specific recommendations.'
              : 'The plan appears once AI has analyzed this resume.'}
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => {
            const meta = SOURCE_META[item.source];
            const Icon = meta.icon;

            return (
              <li
                key={`${item.source}-${index}`}
                className="flex items-start gap-3 rounded-lg border border-ai/15 bg-card/40 px-3 py-2.5"
              >
                <span
                  aria-hidden="true"
                  data-tabular="true"
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-ai/12 text-micro font-medium text-ai"
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-body text-pretty text-foreground">
                    {item.text}
                  </p>
                  <span
                    className={`flex items-center gap-1 text-micro ${meta.className}`}
                  >
                    <Icon aria-hidden="true" className="size-3" />
                    {meta.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </AiCard>
  );
}

export function ResumeImprovementPlanSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-ai/20 bg-ai/[0.03] p-4"
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-64" />
      <div className="mt-5 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
