'use client';

import { LayoutGridIcon, Rows3Icon, SearchIcon } from 'lucide-react';

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

const FILTERS: Array<{ value: JobStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  ...JOB_STATUSES.filter((status) => status !== 'preparing').map((status) => ({
    value: status as JobStatus,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  })),
];

/**
 * Search + status pills + list/board toggle. Search is debounced by the
 * parent (URL state); this component is fully controlled and stateless.
 */
export function JobFilters({
  value,
  onChange,
}: {
  value: JobsFilterValue;
  onChange: (next: JobsFilterValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search title, company, location…"
            aria-label="Search jobs"
            value={value.search}
            onChange={(event) =>
              onChange({ ...value, search: event.target.value })
            }
            className="pl-8"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <Button
            size="xs"
            variant={value.view === 'list' ? 'secondary' : 'ghost'}
            onClick={() => onChange({ ...value, view: 'list' })}
            aria-pressed={value.view === 'list'}
          >
            <Rows3Icon />
            List
          </Button>
          <Button
            size="xs"
            variant={value.view === 'board' ? 'secondary' : 'ghost'}
            onClick={() => onChange({ ...value, view: 'board' })}
            aria-pressed={value.view === 'board'}
          >
            <LayoutGridIcon />
            Board
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by status">
        {FILTERS.map((filter) => {
          const active = value.status === filter.value;

          return (
            <button
              key={filter.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange({ ...value, status: filter.value })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
