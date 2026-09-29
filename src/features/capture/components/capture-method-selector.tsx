'use client';

import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  LinkIcon,
  type LucideIcon,
} from 'lucide-react';

import { ScaleHover } from '@/components/ui/motion';
import type { CaptureType } from '@/features/capture/types';
import { cn } from 'cn';

type Method = {
  value: CaptureType;
  title: string;
  description: string;
  icon: LucideIcon;
};

/**
 * Ordered exactly as the source of truth for capture types so the keyboard
 * order matches the mental order: type it, then attach it, then link it.
 */
const METHODS: Method[] = [
  {
    value: 'text',
    title: 'Paste Job Description',
    description: 'Fastest and most accurate. Paste the full posting text.',
    icon: FileTextIcon,
  },
  {
    value: 'pdf',
    title: 'Upload PDF',
    description: 'Job circulars and PDF postings up to 10MB.',
    icon: FileIcon,
  },
  {
    value: 'image',
    title: 'Upload Screenshot',
    description: 'JPG, PNG or WebP screenshots up to 10MB.',
    icon: ImageIcon,
  },
  {
    value: 'url',
    title: 'Import URL',
    description: 'Paste a public link and AI fetches the posting.',
    icon: LinkIcon,
  },
];

/**
 * Four large method cards.
 *
 * Rendered as toggle buttons (`aria-pressed`) rather than a tablist: the
 * cards choose *which input to show*, they do not own a tab panel, and
 * claiming `role="tab"` without a matching `tabpanel` misleads screen
 * readers. The violet border + soft glow on the active card is the only
 * place this screen uses the AI accent outside the preview panel.
 */
function CaptureMethodSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: CaptureType;
  onChange: (next: CaptureType) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Choose a capture method"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {METHODS.map((method) => {
        const Icon = method.icon;
        const active = value === method.value;

        return (
          <ScaleHover key={method.value} className="h-full">
            <button
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(method.value)}
              className={cn(
                'flex h-full w-full flex-col gap-3 rounded-xl border p-4 text-left',
                'transition-[background-color,border-color,box-shadow] duration-200 ease-out',
                'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
                'disabled:cursor-not-allowed disabled:opacity-60',
                active
                  ? 'border-ai/50 bg-ai/[0.06] shadow-glow ring-1 ring-ai/30'
                  : 'border-border bg-card hover:border-foreground/20 hover:bg-surface/60',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
                  active ? 'bg-ai/15 text-ai' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="size-4" />
              </span>

              <span className="space-y-1">
                <span
                  className={cn(
                    'block text-body font-medium',
                    active ? 'text-ai' : 'text-foreground',
                  )}
                >
                  {method.title}
                </span>
                {/* Hidden on the narrowest phones so the 2-up grid stays
                    scannable; the title alone carries the meaning there. */}
                <span className="hidden text-caption text-muted-foreground sm:block">
                  {method.description}
                </span>
              </span>
            </button>
          </ScaleHover>
        );
      })}
    </div>
  );
}

export { CaptureMethodSelector };
