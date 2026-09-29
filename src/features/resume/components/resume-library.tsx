'use client';

import {
  CircleAlertIcon,
  CircleCheckIcon,
  EyeIcon,
  FileTextIcon,
  Loader2Icon,
  Trash2Icon,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import { resumeScoreBand } from '@/features/resume/components/resume-health-card';
import type { Resume, ResumeStatus } from '@/features/resume/types';
import { cn } from 'cn';

const STATUS_META: Record<
  ResumeStatus,
  { label: string; tone: StatusTone; icon: LucideIcon; spin?: boolean }
> = {
  uploaded: { label: 'Uploaded', tone: 'neutral', icon: FileTextIcon },
  processing: {
    label: 'Analyzing',
    tone: 'ai',
    icon: Loader2Icon,
    spin: true,
  },
  completed: { label: 'Analyzed', tone: 'success', icon: CircleCheckIcon },
  failed: { label: 'Failed', tone: 'danger', icon: CircleAlertIcon },
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ResumeLibraryCard({
  resume,
  selected,
  onView,
}: {
  resume: Resume;
  selected: boolean;
  onView: (resume: Resume) => void;
}) {
  const meta = STATUS_META[resume.status];
  const scored = resume.status === 'completed' && resume.ai_score !== null;
  const band = scored ? resumeScoreBand(resume.ai_score as number) : null;

  return (
    <Card
      interactive
      className={cn(
        'transition-[border-color,background-color] duration-200',
        selected && 'border-ai/50 bg-ai/[0.03]',
      )}
    >
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex min-w-0 items-center gap-2">
            <FileTextIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="truncate" title={resume.title}>
              {resume.title}
            </span>
          </CardTitle>

          <StatusPill
            label={meta.label}
            tone={meta.tone}
            leading={
              <meta.icon
                aria-hidden="true"
                className={cn('size-3', meta.spin && 'animate-spin')}
              />
            }
          />
        </div>

        <div className="flex items-end justify-between gap-3">
          {scored && band ? (
            <div className="flex items-baseline gap-1.5">
              <span
                data-tabular="true"
                className={cn(
                  'font-heading text-2xl leading-none font-semibold tracking-tight',
                  band.text,
                )}
              >
                {resume.ai_score}
              </span>
              <span className="text-caption text-muted-foreground">
                /100 · {band.label}
              </span>
            </div>
          ) : (
            <CardDescription>
              {resume.status === 'failed'
                ? 'Analysis failed — upload again to retry.'
                : resume.status === 'processing'
                  ? 'AI is reading this resume.'
                  : 'Not scored yet.'}
            </CardDescription>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <span className="text-caption text-muted-foreground">
            {formatDate(resume.created_at)}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant={selected ? 'ai' : 'outline'}
              size="sm"
              onClick={() => onView(resume)}
              aria-pressed={selected}
            >
              <EyeIcon aria-hidden="true" />
              {selected ? 'Viewing' : 'View Analysis'}
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              disabled
              aria-label={`Delete ${resume.title}`}
              title="Deleting a resume is not available yet — the API exposes create and read only."
            >
              <Trash2Icon aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Resume library — every uploaded resume, with the AI score and the two
 * card actions. "View Analysis" drives the whole dashboard above it (one
 * selected resume at a time), which is why the selected card is visually
 * connected to the panels rather than opening a detail route.
 *
 * The delete control is rendered but disabled: `routes/api.php` exposes
 * only `resumes.index`, `resumes.store`, `resumes.show` and the job-match
 * route, and this phase may not touch the backend or the service layer. The
 * affordance is shown so the layout is truthful about what the feature will
 * have, and its tooltip states the limitation instead of failing silently.
 */
export function ResumeLibrary({
  resumes,
  selectedId,
  onView,
}: {
  resumes: Resume[];
  selectedId: number | null;
  onView: (resume: Resume) => void;
}) {
  if (resumes.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {resumes.map((resume) => (
        <ResumeLibraryCard
          key={resume.id}
          resume={resume}
          selected={selectedId === resume.id}
          onView={onView}
        />
      ))}
    </div>
  );
}

export function ResumeLibrarySkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}
