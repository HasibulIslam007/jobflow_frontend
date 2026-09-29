'use client';

import { FadeIn } from '@/components/ui/motion';
import { CaptureHeader } from '@/features/capture/components/capture-header';
import { CaptureHistory } from '@/features/capture/components/capture-history';
import { CaptureWorkspace } from '@/features/capture/components/capture-workspace';

/**
 * /jobs/create — the AI Job Intake Studio.
 *
 * Three stacked sections and nothing else:
 *   1. CaptureHeader   — what this screen is for (no actions; the studio is
 *                        the action, and a second button up here would
 *                        compete with Analyze).
 *   2. CaptureWorkspace — method picker, input area, AI panel, results. It
 *                        owns all state, so this page holds none.
 *   3. CaptureHistory  — recent runs, from the existing dashboard aggregate.
 *
 * The page itself is deliberately dumb: it only provides vertical rhythm and
 * a staggered fade. Every piece of behaviour lives one level down where it
 * can be tested against the real mutations.
 */
export default function CreateJobPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <CaptureHeader />
      </FadeIn>

      <FadeIn delay={0.04}>
        <CaptureWorkspace />
      </FadeIn>

      <FadeIn delay={0.08}>
        <CaptureHistory />
      </FadeIn>
    </div>
  );
}

