import { SparklesIcon } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';

/**
 * Intake studio masthead.
 *
 * Deliberately action-free: the whole page is the action, and a button here
 * would compete with the Analyze control in the workspace. The eyebrow is
 * the only place the AI accent is used at this level, so the violet stays a
 * signal ("the model does this") rather than decoration.
 */
function CaptureHeader() {
  return (
    <PageHeader
      eyebrow={
        <span className="inline-flex items-center gap-1.5 text-ai">
          <SparklesIcon aria-hidden="true" className="size-3.5" />
          AI Job Scanner
        </span>
      }
      title="Turn any job post into an organized opportunity"
      description="Paste text, upload a file, or share a link. AI extracts everything you need."
    />
  );
}

export { CaptureHeader };
