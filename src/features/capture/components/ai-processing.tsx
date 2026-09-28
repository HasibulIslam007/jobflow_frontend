import { useEffect, useState } from 'react';
import { CheckIcon, Loader2Icon } from 'lucide-react';

import { cn } from 'cn';

function useElapsedSince(startedAt: number, tickMs = 1000): number {
  const [now, setNow] = useState<number>(startedAt);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, tickMs);

    return () => clearInterval(timer);
  }, [tickMs]);

  return Math.max(0, now - startedAt);
}

const STEPS = [
  'Reading job content',
  'Extracting requirements',
  'Finding skills',
  'Detecting deadline',
  'Creating job card',
];

/**
 * Premium processing state. Steps light up progressively on a timer —
 * purely presentational: the real completion signal is the mutation
 * resolving. Driven ONLY by `isPending`; never fake backend data.
 */
export function AiProcessing({ startedAt }: { startedAt: number }) {
  const elapsed = useElapsedSince(startedAt);
  const activeIndex = Math.min(STEPS.length - 1, Math.floor(elapsed / 2500));

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-6 rounded-xl border border-ai/20 bg-ai/[0.03] px-6 py-12 text-center"
    >
      <span className="relative flex size-12 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-ai/20" />
        <span className="relative flex size-12 items-center justify-center rounded-full bg-ai/10 text-ai">
          <Loader2Icon className="size-6 animate-spin" aria-hidden="true" />
        </span>
      </span>
      <div className="space-y-1">
        <h2 className="text-section-title font-heading text-foreground">
          Analyzing your job…
        </h2>
        <p className="text-body text-muted-foreground">
          AI is reading the posting and building your job card.
        </p>
      </div>
      <ul className="w-full max-w-xs space-y-2 text-left text-body">
        {STEPS.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;

          return (
            <li key={step} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full',
                  done
                    ? 'bg-success/15 text-success'
                    : active
                      ? 'bg-ai/15 text-ai'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {done ? (
                  <CheckIcon className="size-3" aria-hidden="true" />
                ) : active ? (
                  <Loader2Icon className="size-3 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className={cn(done || active ? 'text-foreground' : 'text-muted-foreground')}>
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
