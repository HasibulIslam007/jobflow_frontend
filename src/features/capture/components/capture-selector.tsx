'use client';

import {
  FileTextIcon,
  ImageIcon,
  LinkIcon,
  ScanTextIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { CaptureType } from '@/features/capture/types';
import { cn } from 'cn';

const OPTIONS: Array<{
  value: CaptureType;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: 'text',
    title: 'Paste Job Description',
    description: 'Paste the full posting — fastest and most reliable.',
    icon: ScanTextIcon,
  },
  {
    value: 'pdf',
    title: 'Upload PDF',
    description: 'Job circulars and PDF postings up to 10MB.',
    icon: FileTextIcon,
  },
  {
    value: 'image',
    title: 'Upload Screenshot',
    description: 'Screenshots: JPG, PNG or WebP up to 10MB.',
    icon: ImageIcon,
  },
  {
    value: 'url',
    title: 'Paste Job URL',
    description: 'Public posting links starting with http(s).',
    icon: LinkIcon,
  },
];

/**
 * Four-card input-method selector with an active ring state.
 * Icons are lucide glyphs (no emoji) per the design system.
 */
export function CaptureSelector({
  value,
  onChange,
}: {
  value: CaptureType;
  onChange: (next: CaptureType) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Choose input method"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
              active
                ? 'border-indigo-500/50 bg-indigo-500/[0.06] shadow-sm ring-1 ring-indigo-500/30'
                : 'border-border bg-background hover:border-muted-foreground/40 hover:bg-muted/40',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                active
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{option.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
