'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileSearchIcon,
  SparklesIcon,
  type LucideIcon,
} from 'lucide-react';

import { ScaleHover } from '@/components/ui/motion';
import { cn } from 'cn';

type Action = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** `ai` tints the card with the AI accent — reserved for AI-powered work. */
  tone: 'ai' | 'neutral';
};

const ACTIONS: Action[] = [
  {
    id: 'capture',
    title: 'Capture Job',
    description: 'Paste, upload or drop a link. AI fills in the details.',
    href: '/jobs/create',
    icon: SparklesIcon,
    tone: 'ai',
  },
  {
    id: 'resume',
    title: 'Analyze Resume',
    description: 'Upload your CV and get skills, gaps and match scoring.',
    href: '/resume',
    icon: FileSearchIcon,
    tone: 'ai',
  },
  {
    id: 'jobs',
    title: 'View Jobs',
    description: 'Work the pipeline board and keep every stage current.',
    href: '/jobs',
    icon: BriefcaseIcon,
    tone: 'neutral',
  },
];

/**
 * The three things a user can do from the dashboard. Deliberately a
 * repeating card pattern rather than a CTA banner: these are equal-weight
 * entry points, and giving one of them a hero treatment would imply a
 * priority the product does not have.
 */
function DashboardActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        const isAi = action.tone === 'ai';

        return (
          <ScaleHover key={action.id} lift={2}>
            <Link
              href={action.href}
              className={cn(
                'group/action flex h-full flex-col gap-3 rounded-xl border p-4 transition-[background-color,border-color,box-shadow] duration-200',
                isAi
                  ? 'border-ai/25 bg-ai/[0.04] hover:border-ai/45 hover:bg-ai/[0.07]'
                  : 'border-border bg-card hover:border-foreground/15 hover:bg-accent/40',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg',
                    isAi
                      ? 'bg-ai/15 text-ai'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover/action:translate-x-0.5"
                />
              </div>

              <div className="space-y-1">
                <p className="text-card-title text-foreground">{action.title}</p>
                <p className="text-caption text-pretty text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          </ScaleHover>
        );
      })}
    </div>
  );
}

export { DashboardActions };
