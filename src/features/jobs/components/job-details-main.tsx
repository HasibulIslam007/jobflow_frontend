import {
  CalendarClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  WalletIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Job } from '@/features/jobs/types';

export function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

/**
 * Left column: Job Information / Description / Skills.
 */
export function JobDetailsMain({ job }: { job: Job }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Job information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border/60">
            <InfoRow label="Location">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {job.location ?? '—'}
              </span>
            </InfoRow>
            <InfoRow label="Salary">
              <span className="inline-flex items-center gap-1">
                <WalletIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {job.salary ?? '—'}
              </span>
            </InfoRow>
            <InfoRow label="Deadline">
              <span className="inline-flex items-center gap-1">
                <CalendarClockIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {job.deadline ?? '—'}
              </span>
            </InfoRow>
            <InfoRow label="Source">
              <span className="inline-flex items-center gap-2">
                <Badge variant="outline">{job.source_type}</Badge>
                {job.source_url && (
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Original posting
                    <ExternalLinkIcon className="size-3" aria-hidden="true" />
                  </a>
                )}
              </span>
            </InfoRow>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          {job.description ? (
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {job.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No description captured for this job.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
