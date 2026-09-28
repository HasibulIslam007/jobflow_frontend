'use client';

import {
  CheckCircle2Icon,
  FileTextIcon,
  Loader2Icon,
  XCircleIcon,
} from 'lucide-react';

import { AiBadge } from '@/components/ui/ai-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import type { Resume, ResumeStatus } from '@/features/resume/types';
import { cn } from 'cn';

const STATUS_META: Record<
  ResumeStatus,
  { label: string; tone: StatusTone; icon: React.ReactNode }
> = {
  uploaded: {
    label: 'Uploaded',
    tone: 'neutral',
    icon: <FileTextIcon className="size-3" aria-hidden="true" />,
  },
  processing: {
    label: 'Analyzing',
    tone: 'ai',
    icon: <Loader2Icon className="size-3 animate-spin" aria-hidden="true" />,
  },
  completed: {
    label: 'Analyzed',
    tone: 'success',
    icon: <CheckCircle2Icon className="size-3" aria-hidden="true" />,
  },
  failed: {
    label: 'Failed',
    tone: 'danger',
    icon: <XCircleIcon className="size-3" aria-hidden="true" />,
  },
};

export function ResumeStatusBadge({ status }: { status: ResumeStatus }) {
  const meta = STATUS_META[status];

  return (
    <StatusPill label={meta.label} tone={meta.tone} leading={meta.icon} />
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Resume card: title, status, AI score and extracted skills with a
 * "View Analysis" action (toggles the analysis panel on the /resume page).
 */
export function ResumeCard({
  resume,
  selected = false,
  onView,
}: {
  resume: Resume;
  selected?: boolean;
  onView?: (resume: Resume) => void;
}) {
  const skills = resume.analysis?.skills ?? [];

  return (
    <Card
      className={cn(
        'transition-[box-shadow,border-color] duration-200',
        selected && 'border-ai/50 bg-ai/[0.03]',
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            {resume.title}
          </CardTitle>
          <ResumeStatusBadge status={resume.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {resume.status === 'completed' && resume.ai_score !== null && (
          <div className="flex items-baseline gap-2">
            <span
              data-tabular="true"
              className="font-heading text-2xl leading-none font-semibold tracking-tight text-ai"
            >
              {resume.ai_score}
            </span>
            <span className="text-caption text-muted-foreground">
              /100 AI score
            </span>
            <AiBadge className="ml-auto" />
          </div>
        )}

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary" className="font-normal">
                {skill}
              </Badge>
            ))}
            {skills.length > 6 && (
              <span className="self-center text-caption text-muted-foreground">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-caption text-muted-foreground">
            {resume.status === 'failed'
              ? 'Analysis failed — try uploading again.'
              : 'No skills extracted yet.'}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-caption text-muted-foreground">
            Uploaded {formatDate(resume.created_at)}
          </span>
          {onView && (
            <Button
              variant={selected ? 'ai' : 'outline'}
              size="sm"
              onClick={() => onView(resume)}
            >
              {selected ? 'Hide Analysis' : 'View Analysis'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
