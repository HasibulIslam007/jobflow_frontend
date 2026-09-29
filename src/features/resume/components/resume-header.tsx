'use client';

import { FileUpIcon, RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

/**
 * Resume intelligence header.
 *
 * Two actions, and the distinction between them is deliberate:
 *
 *  - "Upload Resume" is the only path that *produces* new analysis. The
 *    backend runs extraction + AI analysis inline on POST /resumes, so
 *    there is no separate "re-analyze" endpoint to call.
 *  - "Analyze Again" therefore re-syncs from the server rather than
 *    pretending to re-run a model. It is genuinely useful while a resume
 *    sits in `processing` (the analysis lands after the upload response),
 *    and it is the honest control for that promise.
 */
export function ResumeHeader({
  onUpload,
  onAnalyzeAgain,
  canAnalyze = false,
  isAnalyzing = false,
}: {
  onUpload: () => void;
  onAnalyzeAgain: () => void;
  /** False when there is nothing to re-sync (no resume selected yet). */
  canAnalyze?: boolean;
  isAnalyzing?: boolean;
}) {
  return (
    <PageHeader
      eyebrow="AI Resume Intelligence"
      title="Build a resume that gets noticed"
      description="AI analyzes your skills, experience, and job compatibility."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={!canAnalyze || isAnalyzing}
            onClick={onAnalyzeAgain}
            title="Re-check the latest analysis from the server"
          >
            <RefreshCwIcon
              className={isAnalyzing ? 'animate-spin' : undefined}
              aria-hidden="true"
            />
            {isAnalyzing ? 'Checking…' : 'Analyze Again'}
          </Button>

          <Button size="sm" onClick={onUpload}>
            <FileUpIcon aria-hidden="true" />
            Upload Resume
          </Button>
        </>
      }
    />
  );
}
