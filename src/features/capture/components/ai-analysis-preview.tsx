'use client';

import { useEffect, useState } from 'react';
import {
  BriefcaseIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  CoinsIcon,
  ListChecksIcon,
  Loader2Icon,
  MapPinIcon,
  SparklesIcon,
} from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { motion } from '@/components/ui/motion';
import type { CaptureType } from '@/features/capture/types';
import { useReducedMotion } from 'framer-motion';
import { cn } from 'cn';

/**
 * Pipeline stages, in the order the backend works through them.
 *
 * These are labels for work in progress, not results. Nothing is parsed out
 * of them and no value is invented — the panel never shows an extracted field
 * until the mutation actually resolves with the job payload.
 */
const STEPS = [
  'Reading job information',
  'Extracting company details',
  'Detecting required skills',
  'Analyzing deadline',
  'Creating opportunity card',
] as const;

/** One stage every 2.2s — tuned so a typical 5-8s capture lands mid-pipeline. */
const STEP_MS = 2200;

const FIELDS = [
  { label: 'Role and seniority', icon: BriefcaseIcon },
  { label: 'Company details', icon: Building2Icon },
  { label: 'Location', icon: MapPinIcon },
  { label: 'Salary', icon: CoinsIcon },
  { label: 'Application deadline', icon: CalendarIcon },
  { label: 'Required skills', icon: ListChecksIcon },
];

const METHOD_NOTE: Record<CaptureType, string> = {
  text: 'The full posting, requirements section included, gives the best result.',
  pdf: 'Text is extracted from the PDF before the model reads it.',
  image: 'The screenshot is read with vision — keep the text legible.',
  url: 'The posting page is fetched and cleaned before analysis.',
};

const METHOD_LABEL: Record<CaptureType, string> = {
  text: 'Pasted text',
  pdf: 'PDF document',
  image: 'Screenshot',
  url: 'Imported link',
};

/**
 * Ticks once a second so the elapsed readout stays honest without a timer per
 * step. State is only written from inside the interval callback — a
 * synchronous `setState` in the effect body would cascade a second render on
 * every mount.
 */
function useElapsedSeconds(startedAt: number | null): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (startedAt === null) {
      return;
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, [startedAt]);

  if (startedAt === null) {
    return 0;
  }

  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

/**
 * AI preview / reasoning panel — the right column of the studio.
 *
 * Two honest modes:
 *   • ready   — states what the model will extract for the chosen method.
 *   • running — a progressive pipeline driven by the real mutation.
 *
 * The last stage can only ever render *active*, never complete: completion is
 * signalled by the mutation resolving, at which point the caller swaps this
 * panel for the result. Showing a finished pipeline before the response
 * arrives would be among the most misleading things this screen could do.
 */
function AiAnalysisPreview({
  method,
  running,
  startedAt,
  uploadProgress = null,
}: {
  method: CaptureType;
  running: boolean;
  startedAt: number | null;
  /** Real upload percentage for file captures, when known. */
  uploadProgress?: number | null;
}) {
  const elapsed = useElapsedSeconds(startedAt);
  const reduced = useReducedMotion();
  const activeIndex = Math.min(
    STEPS.length - 1,
    Math.floor((elapsed * 1000) / STEP_MS),
  );

  if (!running) {
    return (
      <AiCard
        title="AI preview"
        description="What the model will pull out of your posting."
      >
        <ul className="grid gap-2">
          {FIELDS.map((field) => {
            const Icon = field.icon;

            return (
              <li key={field.label} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ai/12 text-ai"
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="text-body text-foreground">{field.label}</span>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-ai/15 pt-3 text-caption text-muted-foreground">
          {METHOD_NOTE[method]}
        </p>
      </AiCard>
    );
  }

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <AiCard
        title="Analyzing your job"
        description={`Working on ${METHOD_LABEL[method].toLowerCase()}.`}
        action={
          <span
            aria-hidden="true"
            data-tabular="true"
            className="text-caption text-muted-foreground"
          >
            {elapsed}s
          </span>
        }
      >
        <ol className="space-y-2.5">
          {STEPS.map((step, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;

            return (
              <li key={step} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                    done
                      ? 'bg-success/15 text-success'
                      : active
                        ? 'bg-ai/15 text-ai'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {done ? (
                    <CheckIcon aria-hidden="true" className="size-3" />
                  ) : active ? (
                    <Loader2Icon
                      aria-hidden="true"
                      className="size-3 animate-spin"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-current"
                    />
                  )}
                </span>
                <span
                  className={cn(
                    'text-body transition-colors duration-300',
                    done || active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>

        {uploadProgress !== null && (
          <div className="space-y-1.5">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="status"
              aria-label="Upload progress"
            >
              <div
                className="h-full rounded-full bg-ai transition-[width] duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-caption text-muted-foreground">
              <span data-tabular="true">{uploadProgress}%</span> uploaded
            </p>
          </div>
        )}

        <p className="flex items-start gap-2 border-t border-ai/15 pt-3 text-caption text-muted-foreground">
          <SparklesIcon
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-ai"
          />
          Your opportunity card appears here the moment the model responds.
        </p>
      </AiCard>
    </motion.div>
  );
}

export { AiAnalysisPreview };


