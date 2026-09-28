import type { LucideIcon } from 'lucide-react';
import {
  BookmarkIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  MessagesSquareIcon,
  TrophyIcon,
  XCircleIcon,
} from 'lucide-react';

import { MetricCard, type MetricTone } from '@/components/ui/metric-card';
import type { DashboardStats } from '@/features/dashboard/types';

type StatDef = {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  tone: MetricTone;
};

const STATS: StatDef[] = [
  { key: 'total_jobs', label: 'Total jobs', icon: BriefcaseIcon, tone: 'primary' },
  { key: 'saved', label: 'Saved', icon: BookmarkIcon, tone: 'neutral' },
  { key: 'applied', label: 'Applied', icon: CalendarCheckIcon, tone: 'warning' },
  { key: 'interview', label: 'Interview', icon: MessagesSquareIcon, tone: 'ai' },
  { key: 'offer', label: 'Offer', icon: TrophyIcon, tone: 'success' },
  { key: 'rejected', label: 'Rejected', icon: XCircleIcon, tone: 'danger' },
];

/**
 * Six-tile pipeline overview. Tones come from the shared design system so
 * the same status always reads the same colour across dashboard, job cards
 * and the Kanban board.
 */
export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {STATS.map((stat) => (
        <MetricCard
          key={stat.key}
          label={stat.label}
          value={stats[stat.key]}
          icon={stat.icon}
          tone={stat.tone}
        />
      ))}
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <MetricCard
          key={index}
          label=""
          value={<span className="inline-block h-6 w-8 animate-pulse rounded bg-muted/70" />}
        />
      ))}
    </div>
  );
}
