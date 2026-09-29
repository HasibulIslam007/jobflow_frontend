'use client';

import { FilterIcon } from 'lucide-react';

import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import type { MetricTone } from '@/components/ui/metric-card';
import type { ApplicationMetrics, JobStage } from '@/features/analytics/types';
import { cn } from 'cn';

/**
 * The stage list is driven by the six keys in declared order rather than a
 * hand-written payload, so a stage can never silently disappear from the chart
 * while still being counted.
 */
const STAGES: Array<{ key: keyof JobStage; label: string; tone: MetricTone; bar: string }> = [
  { key: 'saved', label: 'Saved', tone: 'neutral', bar: 'bg-muted-foreground/50' },
  { key: 'preparing', label: 'Preparing', tone: 'warning', bar: 'bg-warning' },
  { key: 'applied', label: 'Applied', tone: 'primary', bar: 'bg-primary' },
  { key: 'interview', label: 'Interview', tone: 'ai', bar: 'bg-ai' },
  { key: 'offer', label: 'Offer', tone: 'success', bar: 'bg-success' },
  { key: 'rejected', label: 'Rejected', tone: 'danger', bar: 'bg-destructive' },
];

/**
 * APPLICATION FUNNEL — the metric tiles are about *applications*; the stage
 * chart below them is about *tracked jobs*.
 *
 * WHY BOTH, AND WHY LABELLED
 * --------------------------
 * The API returns two different populations (see JobStage). Rendering them
 * under one "Applied" heading would be misleading — 30 saved jobs and 4 sent
 * applications are not the same fact. So the chart is explicitly headed as the
 * job pipeline and the tiles as application performance, in words, rather than
 * leaving the reader to reconcile two different "Applied" numbers.
 *
 * Bar widths are relative to the *largest* stage, not the total, so a funnel
 * that is 90% "saved" still renders every other stage legibly.
 */
export function ApplicationFunnel({
  pipeline,
  metrics,
}: {
  pipeline: JobStage;
  metrics: ApplicationMetrics;
}) {
  const peak = Math.max(1, ...STAGES.map((stage) => pipeline[stage.key]));
  const totalJobs = STAGES.reduce((sum, stage) => sum + pipeline[stage.key], 0);

  return (
    <div className="flex flex-col gap-4">
      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StaggerItem className="h-full">
          <MetricCard
            className="h-full"
            label="Applications sent"
            value={metrics.total_applications}
            hint="Application records you created"
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <MetricCard
            className="h-full"
            label="Response rate"
            value={`${metrics.response_rate}%`}
            tone="primary"
            hint="Employer replied at all"
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <MetricCard
            className="h-full"
            label="Interview rate"
            value={`${metrics.interview_rate}%`}
            tone="ai"
            hint="Currently at interview"
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <MetricCard
            className="h-full"
            label="Offer rate"
            value={`${metrics.offer_rate}%`}
            tone="success"
            // The proxy is disclosed rather than presented as a precise
            // measurement, and "not enough data" never renders as "0 days".
            hint={
              metrics.average_days_to_response === null
                ? 'No response measured yet'
                : `~${metrics.average_days_to_response}d to a response*`
            }
          />
        </StaggerItem>
      </Stagger>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <h2 className="text-section-title font-heading text-foreground">
              Your tracked jobs
            </h2>
            <p className="mt-0.5 text-caption text-pretty text-muted-foreground">
              {totalJobs} job{totalJobs === 1 ? '' : 's'} saved in total, by the
              stage each one is at.
            </p>
          </div>
          <FilterIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </CardHeader>

        <CardContent>
          <ul className="space-y-2.5">
            {STAGES.map((stage) => {
              const value = pipeline[stage.key] ?? 0;
              const share = totalJobs > 0
                ? Math.round((value / totalJobs) * 100)
                : 0;

              return (
                <li key={stage.key} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-caption text-foreground">
                      {stage.label}
                    </span>
                    <span
                      data-tabular="true"
                      className="shrink-0 text-caption text-muted-foreground"
                    >
                      {value}
                      {totalJobs > 0 ? <span> · {share}%</span> : null}
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={peak}
                    aria-label={`${stage.label}: ${value} jobs`}
                    className="h-2 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-500 ease-out',
                        stage.bar,
                        value === 0 && 'opacity-40',
                      )}
                      style={{ width: `${Math.round((value / peak) * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {metrics.average_days_to_response !== null ? (
            <p className="mt-4 text-micro text-pretty text-muted-foreground">
              *Days to response is measured from the date you applied to the
              last change on that application — the closest the data gets to a
              reply date.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
