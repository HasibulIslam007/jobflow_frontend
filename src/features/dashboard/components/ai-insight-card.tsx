import { AiCard } from '@/components/ui/ai-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AiInsights } from '@/features/dashboard/types';

function formatConfidence(value: number | null): string {
  return value === null ? '—' : value.toFixed(2);
}

function formatQuality(value: number | null): string {
  return value === null ? '—' : `${value}/100`;
}

/**
 * AI extraction health: average confidence + quality across the user's
 * jobs, plus how many jobs still miss key fields. Rendered as an AiCard so
 * model-derived numbers are always visibly separated from user data.
 */
export function AiInsightCard({ insights }: { insights: AiInsights }) {
  const metrics = [
    { label: 'Avg. confidence', value: formatConfidence(insights.average_confidence), hint: 'AI extraction certainty' },
    { label: 'Avg. quality', value: formatQuality(insights.average_quality_score), hint: 'Posting completeness' },
    {
      label: 'Needs info',
      value: String(insights.missing_information_count),
      hint: 'Jobs missing location, salary or deadline',
    },
  ];

  return (
    <AiCard title="AI insights" description="Extraction quality across your pipeline">
      <dl className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-ai/15 bg-card/50 px-3 py-2.5 text-center"
            title={metric.hint}
          >
            <dt className="text-micro font-medium text-muted-foreground">
              {metric.label}
            </dt>
            <dd
              data-tabular="true"
              className="mt-0.5 font-heading text-lg font-semibold tracking-tight text-foreground"
            >
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </AiCard>
  );
}

export function AiInsightCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
