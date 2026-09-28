import { FileTextIcon, ImageIcon, LinkIcon, ScanTextIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecentCapture } from '@/features/dashboard/types';

const TYPE_META: Record<RecentCapture['type'], { label: string; icon: LucideIcon }> = {
  text: { label: 'Paste', icon: ScanTextIcon },
  pdf: { label: 'PDF', icon: FileTextIcon },
  image: { label: 'Image', icon: ImageIcon },
  url: { label: 'URL', icon: LinkIcon },
};

function describe(capture: RecentCapture): string {
  if (capture.type === 'url') {
    return capture.content?.trim() || 'Pasted link';
  }
  if (capture.file_path) {
    return capture.file_path.split('/').pop() ?? capture.file_path;
  }

  return (capture.content ?? '').slice(0, 80) || `${TYPE_META[capture.type].label} capture`;
}

/**
 * Latest capture activity with per-type icon and status badge.
 * Failed captures surface their error inline for quick triage.
 */
export function CaptureCard({ captures }: { captures: RecentCapture[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent captures</CardTitle>
        <CardDescription>Latest 5 AI capture runs across all sources</CardDescription>
      </CardHeader>
      <CardContent>
        {captures.length === 0 ? (
          <p className="rounded-lg bg-muted/50 px-3 py-6 text-center text-sm text-muted-foreground">
            No captures yet. Paste a job post or upload a file to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {captures.map((capture) => {
              const meta = TYPE_META[capture.type];
              const Icon = meta.icon;

              return (
                <li key={capture.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-sm font-medium">{describe(capture)}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.label} · {new Date(capture.created_at).toLocaleDateString()}
                    </p>
                    {capture.status === 'failed' && capture.error_message && (
                      <p className="truncate text-xs text-destructive">
                        {capture.error_message}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      capture.status === 'completed'
                        ? 'secondary'
                        : capture.status === 'failed'
                          ? 'destructive'
                          : 'outline'
                    }
                    className="shrink-0"
                  >
                    {capture.status}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CaptureCardSkeleton() {
  return (
    <Card className="shadow-sm" aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-7 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
