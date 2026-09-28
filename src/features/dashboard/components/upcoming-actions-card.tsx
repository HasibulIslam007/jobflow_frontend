'use client';

import Link from 'next/link';

import {
  ArrowRightIcon,
  CalendarClockIcon,
  FileTextIcon,
  FlameIcon,
  TargetIcon,
  type LucideIcon,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpcomingDeadline } from '@/features/dashboard/types';
import { useResumes } from '@/features/resume/hooks';
import { cn } from 'cn';

type Action = {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  href: string;
  tone: 'urgent' | 'warn' | 'info';
};

const TONE_CLASSES: Record<Action['tone'], string> = {
  urgent: 'bg-red-500/10 text-red-600 dark:text-red-400',
  warn: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
};

/**
 * "Upcoming Actions" — the do-things-now list. Every row is derived from
 * real data (dashboard deadlines, resume analysis, pipeline stats); rows
 * with nothing to act on are simply omitted, never faked.
 */
export function UpcomingActionsCard({
  deadlines,
  interviewCount,
}: {
  deadlines: UpcomingDeadline[];
  interviewCount: number;
}) {
  const { data: resumes } = useResumes();

  const actions: Action[] = [];

  // 🔥 Nearest deadline within 3 days (or overdue) — act now.
  const urgentDeadline = deadlines.find(
    (deadline) => deadline.days_remaining <= 3,
  );
  if (urgentDeadline) {
    const days = urgentDeadline.days_remaining;
    const label =
      days < 0
        ? `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'}`
        : days === 0
          ? 'Deadline today'
          : days === 1
            ? 'Deadline tomorrow'
            : `Deadline in ${days} days`;
    actions.push({
      id: `deadline-${urgentDeadline.id}`,
      icon: FlameIcon,
      title: label,
      detail: `${urgentDeadline.title} · ${urgentDeadline.company}`,
      href: `/jobs/${urgentDeadline.id}`,
      tone: 'urgent',
    });
  }

  // ⚠ Resume signals — missing details, failed analysis, or none yet.
  if (resumes) {
    const completed = resumes.find((resume) => resume.status === 'completed');
    const failed = resumes.find((resume) => resume.status === 'failed');
    const missingCount = completed?.analysis?.missing_information.length ?? 0;

    if (completed && missingCount > 0) {
      actions.push({
        id: 'resume-missing',
        icon: FileTextIcon,
        title: `Resume missing ${missingCount} ${
          missingCount === 1 ? 'detail' : 'details'
        }`,
        detail: 'Fill the gaps to sharpen your AI matches',
        href: '/resume',
        tone: 'warn',
      });
    } else if (failed) {
      actions.push({
        id: 'resume-failed',
        icon: FileTextIcon,
        title: 'Resume analysis failed',
        detail: 'Retry the upload to unlock AI matching',
        href: '/resume',
        tone: 'warn',
      });
    } else if (!completed) {
      actions.push({
        id: 'resume-missing-upload',
        icon: FileTextIcon,
        title: 'No resume uploaded yet',
        detail: 'Add your resume to unlock AI job matching',
        href: '/resume',
        tone: 'warn',
      });
    }
  }

  // 🎯 Interview stage pipeline — keep follow-ups moving.
  if (interviewCount > 0) {
    actions.push({
      id: 'interviews',
      icon: TargetIcon,
      title: `${interviewCount} ${interviewCount === 1 ? 'application' : 'applications'} in interview`,
      detail: 'Prep and follow up while they are hot',
      href: '/jobs',
      tone: 'info',
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClockIcon
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          Upcoming Actions
        </CardTitle>
        <CardDescription>What needs your attention now</CardDescription>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="rounded-lg bg-muted/50 px-3 py-6 text-center text-sm text-muted-foreground">
            {resumes === undefined
              ? 'Nothing urgent — checking your pipeline…'
              : "You're all caught up."}
          </p>
        ) : (
          <ul className="space-y-2">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <li key={action.id}>
                  <Link
                    href={action.href}
                    className="group flex items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full',
                        TONE_CLASSES[action.tone],
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {action.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {action.detail}
                      </span>
                    </span>
                    <ArrowRightIcon
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingActionsCardSkeleton() {
  return (
    <Card className="shadow-sm" aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}