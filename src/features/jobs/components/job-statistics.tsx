'use client';

import {
  BookmarkIcon,
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
  hint: string;
  icon: LucideIcon;
  tone: MetricTone;
};

const METRICS: Metric[] = [
  { key: 'total_jobs', label: 'Total jobs', hint: 'Tracked opportunities', icon: BriefcaseIcon, tone: 'primary' },
  { key: 'saved', label: 'Saved', hint: 'Not yet applied', icon: BookmarkIcon, tone: 'neutral' },
  { key: 'applied', label: 'Applied', hint: 'Awaiting a reply', icon: CalendarCheckIcon, tone: 'warning' },
  { key: 'interview', label: 'Interview', hint: 'In conversation', icon: MessagesSquareIcon, tone: 'ai' },
  { key: 'offer', label: 'Offer', hint: 'Offers on the table', icon: TrophyIcon, tone: 'success' },
];

/**
 * Pipeline statistics.
 *
 * These counts come from the dashboard aggregate, not from the rows the
 * list query happens to return — `useJobs` is capped by `per_page`, so
 * counting the visible array would silently under-report on a large
 * pipeline. The query is shared, so navigating here from the dashboard is
 * usually already cached.
 */
function JobStatistics({ stats }: { stats: DashboardStats }) {
  const total = Math.max(stats.total_jobs, 0);

  return (
    <Stagger
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
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
              hint={metric.hint}
              trend={total > 0 ? `${share}% of pipeline` : undefined}
            />
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

/**
 * Skeleton mirrors the real grid so the page does not reflow when the
 * aggregate query lands.
 */
function JobStatisticsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {Array.from({ length: METRICS.length }).map((_, index) => (
        <MetricCard
          key={index}
          label=""
          value={<span className="inline-block h-7 w-10 animate-pulse rounded bg-muted/70" />}
        />
      ))}
    </div>
  );
}

export { JobStatistics, JobStatisticsSkeleton };
