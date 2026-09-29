'use client';

import {
  CircleAlertIcon,
  CircleCheckIcon,
  FileTextIcon,
  ImageIcon,
  LinkIcon,
  Loader2Icon,
  RefreshCwIcon,
  ScanTextIcon,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import { useDashboard } from '@/features/dashboard/hooks';
import type { RecentCapture } from '@/features/dashboard/types';

const TYPE_META: Record<RecentCapture['type'], { label: string; icon: LucideIcon }> =
  {
    text: { label: 'Paste', icon: ScanTextIcon },
    pdf: { label: 'PDF', icon: FileTextIcon },
    image: { label: 'Image', icon: ImageIcon },
    url: { label: 'URL', icon: LinkIcon },
  };

const STATUS_META: Record<
  RecentCapture['status'],
  { label: string; tone: StatusTone; icon: LucideIcon }
> = {
  pending: { label: 'Pending', tone: 'neutral', icon: CircleAlertIcon },
  processing: { label: 'Processing', tone: 'ai', icon: Loader2Icon },
  completed: { label: 'Completed', tone: 'success', icon: CircleCheckIcon },
  failed: { label: 'Failed', tone: 'danger', icon: CircleAlertIcon },
};

/** Compact relative label — "2h ago", "3d ago". */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return '';
  }

  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/** Full timestamp for the `title` tooltip so the exact date is never lost. */
function absoluteTime(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

/** Short human label for what was actually captured. */
function describe(capture: RecentCapture): string {
  if (capture.type === 'url') {
    return capture.content?.trim() || 'Pasted link';
  }
  if (capture.file_path) {
    return capture.file_path.split('/').pop() ?? capture.file_path;
  }

  const text = (capture.content ?? '').replace(/\s+/g, ' ').trim();

  return text.slice(0, 72) || `${TYPE_META[capture.type].label} capture`;
}

/**
 * Recent capture history.
 *
 * Reads the `recent_captures` array the dashboard aggregate already returns —
 * no new endpoint, service or hook. The same `dashboardQueryKey` is
 * invalidated by every capture mutation, so this list refreshes itself the
 * moment a run finishes.
 *
 * Type, status and date are shown as specified, and a failed run keeps its
 * error message inline: a silent failure in this list is what makes a user
 * retry the same unusable file forever.
 */
export function CaptureHistory() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useDashboard();
  const captures = data?.recent_captures ?? [];

  const errorMessage =
    error instanceof Error ? error.message : 'Could not load recent captures.';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Recent captures</CardTitle>
            <p className="text-caption text-muted-foreground">
              Every posting the scanner has processed for you.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh captures"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCwIcon
              aria-hidden="true"
              className={isFetching ? 'animate-spin' : undefined}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <ul aria-hidden="true" className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="h-3.5 flex-1" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <ErrorState
            title="Could not load recent captures"
            description={`${errorMessage} Capturing a new job still works.`}
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCwIcon />
                Try again
              </Button>
            }
          />
        ) : captures.length === 0 ? (
          <EmptyState
            size="compact"
            icon={ScanTextIcon}
            title="No captures yet"
            description="Your first posting appears here as soon as the scanner finishes reading it."
          />
        ) : (
          <>
            <table className="hidden w-full text-left md:table">
              <caption className="sr-only">Recent job captures</caption>
              <thead>
                <tr className="border-b border-border text-micro text-muted-foreground">
                  <th scope="col" className="pb-2 font-medium">
                    Type
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Source
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {captures.map((capture) => {
                  const type = TYPE_META[capture.type];
                  const status = STATUS_META[capture.status];
                  const TypeIcon = type.icon;
                  const StatusIcon = status.icon;
                  const stamp = capture.processed_at ?? capture.created_at;

                  return (
                    <tr key={capture.id}>
                      <td className="py-2.5 pr-4">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ai/10 text-ai"
                          >
                            <TypeIcon className="size-3.5" />
                          </span>
                          <span className="text-body text-foreground">
                            {type.label}
                          </span>
                        </span>
                      </td>

                      <td className="max-w-[22rem] py-2.5 pr-4">
                        <p className="truncate text-body text-muted-foreground">
                          {describe(capture)}
                        </p>
                        {capture.status === 'failed' &&
                        capture.error_message ? (
                          <p className="truncate text-caption text-destructive">
                            {capture.error_message}
                          </p>
                        ) : null}
                      </td>

                      <td className="py-2.5 pr-4">
                        <StatusPill
                          label={status.label}
                          tone={status.tone}
                          leading={
                            <StatusIcon
                              aria-hidden="true"
                              className={
                                capture.status === 'processing'
                                  ? 'size-3 animate-spin'
                                  : 'size-3'
                              }
                            />
                          }
                        />
                      </td>

                      <td className="py-2.5 text-right whitespace-nowrap">
                        <span
                          title={absoluteTime(stamp)}
                          className="text-caption text-muted-foreground"
                        >
                          {relativeTime(stamp)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <ul className="divide-y divide-border md:hidden">
              {captures.map((capture) => {
                const type = TYPE_META[capture.type];
                const status = STATUS_META[capture.status];
                const TypeIcon = type.icon;
                const StatusIcon = status.icon;
                const stamp = capture.processed_at ?? capture.created_at;

                return (
                  <li
                    key={capture.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai"
                    >
                      <TypeIcon className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-body font-medium text-foreground">
                        {type.label} capture
                      </p>
                      <p className="truncate text-caption text-muted-foreground">
                        {describe(capture)}
                      </p>
                      {capture.status === 'failed' &&
                      capture.error_message ? (
                        <p className="truncate text-caption text-destructive">
                          {capture.error_message}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusPill
                        label={status.label}
                        tone={status.tone}
                        leading={
                          <StatusIcon
                            aria-hidden="true"
                            className={
                              capture.status === 'processing'
                                ? 'size-3 animate-spin'
                                : 'size-3'
                            }
                          />
                        }
                      />
                      <span className="text-micro text-muted-foreground">
                        {relativeTime(stamp)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Standalone skeleton, exported for callers that need to reserve the height
 * before the aggregate arrives.
 */
export function CaptureHistorySkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-3.5 flex-1" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}



