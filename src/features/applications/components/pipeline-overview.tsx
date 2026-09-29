'use client';

import {
  BookmarkIcon,
  CalendarCheckIcon,
  MessagesSquareIcon,
  TrophyIcon,
  XCircleIcon,
  type LucideIcon,
} from 'lucide-react';

import { MetricCard, type MetricTone } from '@/components/ui/metric-card';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import type { ApplicationStatus } from '@/features/applications/types';

type Metric = {
  key: ApplicationStatus;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: MetricTone;
};

/**
 * The five headline stages. `preparing` is deliberately absent: the brief
 * scopes the overview to Saved → Applied → Interview → Offer → Rejected,
 * and `preparing` is a working state rather than a pipeline outcome. It
 * still has its own board column, so nothing is unreachable — the board
 * carries all six stages and the totals reconcile.
 */
const METRICS: Metric[] = [
  {
    key: 'saved',
    label: 'Saved',
    hint: 'Shortlisted, not sent',
    icon: BookmarkIcon,
    tone: 'neutral',
  },
  {
    key: 'applied',
    label: 'Applied',
    hint: 'Awaiting a reply',
    icon: CalendarCheckIcon,
    tone: 'primary',
  },
  {
    key: 'interview',
    label: 'Interview',
    hint: 'In conversation',
    icon: MessagesSquareIcon,
    tone: 'ai',
  },
  {
    key: 'offer',
    label: 'Offer',
    hint: 'Offers on the table',
    icon: TrophyIcon,
    tone: 'success',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    hint: 'Closed out',
    icon: XCircleIcon,
    tone: 'danger',
  },
];

/**
 * Pipeline statistics.
 *
 * Counts are computed from the applications actually loaded, and the
 * percentage is that stage's share of the total — both real numbers derived
 * from real records.
 *
 * There is deliberately no week-over-week delta here. The API stores no
 * history table, so any "+3 this week" figure would be invented; the
 * `trend` slot carries the share instead, which is derivable and true.
 */
export function PipelineOverview({
  counts,
  total,
}: {
  counts: Record<ApplicationStatus, number>;
  total: number;
}) {
  return (
    <Stagger
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      stagger={0.05}
    >
      {METRICS.map((metric) => {
        const value = counts[metric.key] ?? 0;
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

/** Mirrors the real grid so the page does not reflow when data lands. */
export function PipelineOverviewSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {METRICS.map((metric) => (
        <MetricCard
          key={metric.key}
          label=""
          value={<span className="inline-block h-7 w-10 animate-pulse rounded bg-muted/70" />}
        />
      ))}
    </div>
  );
}
