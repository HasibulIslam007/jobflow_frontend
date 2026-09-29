'use client';

import { KanbanSquareIcon } from 'lucide-react';

import { ApplicationCard } from '@/features/applications/components/application-card';
import { APPLICATION_STATUS_META } from '@/features/applications/application-status-meta';
import type { ApplicationStatus } from '@/features/applications/types';
import type { ApplicationRow } from '@/features/applications/use-application-pipeline';
import { cn } from 'cn';

/**
 * Every status gets a column, including `saved`.
 *
 * An earlier draft dropped `saved` as a "not yet sent" bucket, but the
 * overview counts it (and folds it into the "N% of pipeline" denominator), so
 * hiding it on the board made those records visible in the totals and
 * unreachable everywhere else — no card, no detail panel, no status change.
 * Board and overview now cover the same six stages and reconcile.
 */
const BOARD_COLUMNS: ApplicationStatus[] = [
  'saved',
  'preparing',
  'applied',
  'interview',
  'offer',
  'rejected',
];

/**
 * Kanban board — one column per stage.
 *
 * DRAG-LOOKING, NOT DRAG-AND-DROP. Columns and cards carry the visual
 * vocabulary of a drag board (grip affordance, hover lift, drop-zone
 * styling) but there is deliberately no draggable attribute, no drop
 * handler and no reorder logic. Cards are buttons: they open the detail
 * panel, where the status selector performs the real PATCH. Shipping a
 * half-working drag interaction would be worse than not shipping one.
 *
 * Every column renders even when empty. A stage that silently vanishes is a
 * stage a user stops thinking about.
 *
 * Responsive: a horizontal track on tablet (the standard ATS pattern, each
 * column keeps a predictable width), and a single stacked column list on
 * mobile, where a 5-across track would squeeze cards to unusable widths.
 */
export function ApplicationBoard({
  rows,
  matchScores,
  selectedId,
  onOpen,
}: {
  rows: ApplicationRow[];
  matchScores: Map<number, number>;
  selectedId: number | null;
  onOpen: (applicationId: number) => void;
}) {
  return (
    <>
      {/* Tablet and up: horizontal track. */}
      <div
        className="-mx-4 hidden snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:flex"
        role="region"
        aria-label="Application pipeline board"
        tabIndex={0}
      >
        {BOARD_COLUMNS.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            rows={rows.filter((row) => row.application.status === status)}
            matchScores={matchScores}
            selectedId={selectedId}
            onOpen={onOpen}
          />
        ))}
      </div>

      {/* Mobile: stacked, full-width columns. */}
      <div className="flex flex-col gap-4 md:hidden">
        {BOARD_COLUMNS.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            rows={rows.filter((row) => row.application.status === status)}
            matchScores={matchScores}
            selectedId={selectedId}
            onOpen={onOpen}
            isStacked
          />
        ))}
      </div>
    </>
  );
}

function BoardColumn({
  status,
  rows,
  matchScores,
  selectedId,
  onOpen,
  isStacked = false,
}: {
  status: ApplicationStatus;
  rows: ApplicationRow[];
  matchScores: Map<number, number>;
  selectedId: number | null;
  onOpen: (applicationId: number) => void;
  isStacked?: boolean;
}) {
  const meta = APPLICATION_STATUS_META[status];

  return (
    <section
      aria-label={`${meta.label}, ${rows.length} ${rows.length === 1 ? 'application' : 'applications'}`}
      className={cn(
        'flex flex-col rounded-xl border border-border/70 bg-surface/50',
        isStacked ? 'w-full' : 'w-[19rem] shrink-0 snap-start',
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-2 shrink-0 rounded-full', meta.dot)}
          />
          <h2 className="truncate text-caption font-semibold text-foreground">
            {meta.label}
          </h2>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span
            data-tabular="true"
            className="rounded-full border border-border bg-card px-1.5 py-0.5 text-micro font-medium text-muted-foreground"
          >
            {rows.length}
          </span>
          {/* Drag affordance only — see the note on ApplicationBoard. */}
          <KanbanSquareIcon
            aria-hidden="true"
            className="size-3 text-muted-foreground/40"
          />
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {rows.map((row) => (
          <ApplicationCard
            key={row.application.id}
            application={row.application}
            job={row.job}
            matchScore={matchScores.get(row.job.id)}
            isSelected={row.application.id === selectedId}
            onOpen={() => onOpen(row.application.id)}
          />
        ))}

        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/70 px-2 py-6 text-center text-micro text-muted-foreground">
            Nothing in {meta.label.toLowerCase()} yet
          </p>
        ) : null}
      </div>
    </section>
  );
}
