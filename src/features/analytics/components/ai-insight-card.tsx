'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileTextIcon,
  ListChecksIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
} from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Button } from '@/components/ui/button';
import type { CareerInsight, InsightType } from '@/features/analytics/types';

/**
 * AI RECOMMENDATIONS.
 *
 * IMPORTANT — WHY THERE IS NO MODEL CALL BEHIND THIS CARD
 * ---------------------------------------------------
 * The card carries the AI tint and the "AI generated" badge because that is the
 * product language users expect here, but the copy is produced by
 * deterministic server-side rules over real aggregates — no LLM, no network
 * call, no invented suggestions. That is a deliberate trade: an LLM would
 * hallucinate skills the user does not need and could not be held to a number.
 *
 * Because of that, the copy below is explicit about provenance rather than
 * letting the badge imply more than it is, and every message quotes the figure
 * it came from so the user can check it.
 */
const ICON_BY_TYPE: Record<InsightType, typeof SparklesIcon> = {
  skill: TargetIcon,
  activity: TrendingUpIcon,
  resume: FileTextIcon,
  conversion: ListChecksIcon,
  role: BriefcaseIcon,
  matching: SparklesIcon,
  getting_started: SparklesIcon,
};

export function AiInsightCard({ insights }: { insights: CareerInsight[] }) {
  return (
    <AiCard
      title="Recommendations"
      description="Derived from your own records — every figure below comes from your data."
      className="h-full"
    >
      <ul className="space-y-2">
        {insights.map((insight, index) => {
          const Icon = ICON_BY_TYPE[insight.type] ?? SparklesIcon;

          return (
            <li
              key={`${insight.type}-${index}`}
              className="flex gap-2.5 rounded-lg border border-ai/15 bg-background/40 px-3 py-2.5"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-ai" aria-hidden="true" />
              <p className="text-caption text-pretty text-foreground">
                {insight.message}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ai/15 pt-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/applications" />}
          nativeButton={false}
        >
          Track an application
          <ArrowRightIcon aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/resume" />}
          nativeButton={false}
        >
          Improve your resume
        </Button>
      </div>
    </AiCard>
  );
}
