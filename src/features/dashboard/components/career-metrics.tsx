'use client';

import {
  BriefcaseIcon,
  CalendarCheckIcon,
  MessagesSquareIcon,
  TrophyIcon,
  type LucideIcon,
} from 'lucide-react';

import { MetricCard, type MetricTone } from '@/components/ui/metric-card';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import type { DashboardStats } from '@/features/dashboard/types';

type Metric = {
  key: keyof DashboardStats;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: MetricTone;
};

/**
 * The four numbers a job seeker actually steers by. Everything else on the
 * dashboard is context for these four.
 */
const METRICS: Metric[] = [
  {
    key: 'total_jobs',
    label: 'Total opportunities',
    description: 'Jobs in your pipeline',
    icon: BriefcaseIcon,
    tone: 'primary',
  },
  {
    key: 'applied',
    label: 'Applications',
    description: 'Submitted and awaiting reply',
    icon: CalendarCheckIcon,
    tone: 'warning',
  },
  {
    key: 'interview',
    label: 'Interviews',
    description: 'In conversation with a team',
    icon: MessagesSquareIcon,
    tone: 'ai',
  },
  {
    key: 'offer',
    label: 'Offers',
    description: 'Offers on the table',
    icon: TrophyIcon,
    tone: 'success',
  },
];

/**
 * Pipeline metrics.
 *
 * The `trend` line is a *derived share of the pipeline*, never a time
 * series: the dashboard payload has no historical data, so showing a
 * "+12% this week" style delta would be inventing a number the API never
 * sent. A ratio of two real figures is honest and still informative.
 */
function CareerMetrics({ stats }: { stats: DashboardStats }) {
  const total = Math.max(stats.total_jobs, 0);

  return (
    <Stagger
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      stagger={0.05}
    >
      {METRICS.map((metric) => {
        const value = stats[metric.key];
        const share = total > 0 ? Math.round((value / total) * 100) : 0;

        return (
          <StaggerItem key={metric.key} className="h-full">
            <MetricCard
              className="h-full"
              label={metric.label}
              value={value}
              icon={metric.icon}
              tone={metric.tone}
              hint={metric.description}
              trend={total > 0 ? `${share}% of pipeline` : undefined}
            />
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

/**
 * Skeleton mirrors the real card metrics so the grid does not reflow when
 * the query lands.
 */
function CareerMetricsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <MetricCard
          key={index}
          label=""
          value={<span className="inline-block h-7 w-10 animate-pulse rounded bg-muted/70" />}
        />
      ))}
    </div>
  );
}

export { CareerMetrics, CareerMetricsSkeleton };
