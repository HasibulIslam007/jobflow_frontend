'use client';

import {
  CircleAlertIcon,
  CircleCheckIcon,
  FileTextIcon,
  ImageIcon,
  LinkIcon,
  Loader2Icon,
  ScanTextIcon,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import type { RecentCapture } from '@/features/dashboard/types';

const TYPE_META: Record<
  RecentCapture['type'],
  { label: string; icon: LucideIcon }
> = {
  text: { label: 'Paste', icon: ScanTextIcon },
  pdf: { label: 'PDF', icon: FileTextIcon },
  image: { label: 'Image', icon: ImageIcon },
  url: { label: 'URL', icon: LinkIcon },
};

const STATUS_META: Record<
  RecentCapture['status'],
  { label: string; tone: StatusTone; icon: React.ReactNode }
> = {
  pending: { label: 'Pending', tone: 'neutral', icon: <CircleAlertIcon className="size-3" /> },
  processing: { label: 'Processing', tone: 'ai', icon: <Loader2Icon className="size-3 animate-spin" /> },
  completed: { label: 'Completed', tone: 'success', icon: <CircleCheckIcon className="size-3" /> },
  failed: { label: 'Failed', tone: 'danger', icon: <CircleAlertIcon className="size-3" /> },
};

/** Compact relative time — "2h ago", "3d ago". */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

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
 * Recent capture activity.
 *
 * This is the audit trail of what the AI has been doing on the user's
 * behalf, so a failed run surfaces its error inline rather than as a badge
 * the user has to go hunting for.
 */
function RecentActivity({ captures }: { captures: RecentCapture[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>

      <CardContent>
        {captures.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-body text-muted-foreground">
            No captures yet. Paste a job post or upload a file to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {captures.map((capture) => {
              const type = TYPE_META[capture.type];
              const status = STATUS_META[capture.status];
              const TypeIcon = type.icon;

              return (
                <li
                  key={capture.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai"
                  >
                    <TypeIcon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-medium text-foreground">
                      {type.label} capture
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {describe(capture)}
                    </p>
                    {capture.status === 'failed' && capture.error_message && (
                      <p className="truncate text-caption text-destructive">
                        {capture.error_message}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusPill
                      label={status.label}
                      tone={status.tone}
                      leading={status.icon}
                    />
                    <span className="text-micro text-muted-foreground">
                      {relativeTime(capture.processed_at ?? capture.created_at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivitySkeleton() {
  return (
    <Card className="h-full" aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { RecentActivity, RecentActivitySkeleton };
