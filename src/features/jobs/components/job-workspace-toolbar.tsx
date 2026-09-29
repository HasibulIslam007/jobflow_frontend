'use client';

import { LayoutGridIcon, Rows3Icon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JOB_STATUSES, type JobStatus } from '@/features/jobs/types';
import { cn } from 'cn';

export type JobsView = 'list' | 'board';

export type JobsFilterValue = {
  search: string;
  status: JobStatus | 'all';
  view: JobsView;
};

const STATUS_FILTERS: Array<{ value: JobStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  ...JOB_STATUSES.map((status) => ({
    value: status as JobStatus,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  })),
];

/**
 * Sticky workspace toolbar: search, status filter and view switcher.
 *
 * Fully controlled and stateless — the page owns the filter value and the
 * debounce. Status filtering is server-side; search is applied in memory
 * by `useJobs`, so there is no URL plumbing to keep in sync.
 */
function JobWorkspaceToolbar({
  value,
  onChange,
  resultCount,
}: {
  value: JobsFilterValue;
  onChange: (next: JobsFilterValue) => void;
  resultCount: number;
}) {
  return (
    <div className="sticky top-16 z-20 -mx-4 space-y-3 bg-background/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search role, company or location…"
            aria-label="Search jobs"
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            className="h-10 rounded-xl pl-9"
          />
        </div>

        <div
          className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1"
          role="group"
          aria-label="Switch view"
        >
          <Button
            size="sm"
            variant={value.view === 'list' ? 'secondary' : 'ghost'}
            onClick={() => onChange({ ...value, view: 'list' })}
            aria-pressed={value.view === 'list'}
          >
            <Rows3Icon />
            List
          </Button>
          <Button
            size="sm"
            variant={value.view === 'board' ? 'secondary' : 'ghost'}
            onClick={() => onChange({ ...value, view: 'board' })}
            aria-pressed={value.view === 'board'}
          >
            <LayoutGridIcon />
            Board
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((filter) => {
          const active = value.status === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange({ ...value, status: filter.value })}
              aria-pressed={active}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-caption font-medium transition-colors duration-200',
                active
                  ? 'border-ai/30 bg-ai/12 text-ai'
                  : 'border-border bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          );
        })}

        {value.status !== 'all' || value.search !== '' ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onChange({ ...value, status: 'all', search: '' })}
            className="ml-auto text-muted-foreground"
          >
            <XIcon />
            Clear
          </Button>
        ) : null}

        <span className="text-caption text-muted-foreground tabular-nums">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </span>
      </div>
    </div>
  );
}

export { JobWorkspaceToolbar };
