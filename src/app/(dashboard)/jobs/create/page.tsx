'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/ui/page-header';
import { AiProcessing } from '@/features/capture/components/ai-processing';
import { CaptureError } from '@/features/capture/components/capture-error';
import { CaptureSelector } from '@/features/capture/components/capture-selector';
import { CaptureSuccess } from '@/features/capture/components/capture-success';
import { FileUpload } from '@/features/capture/components/file-upload';
import { TextCaptureForm } from '@/features/capture/components/text-capture-form';
import { UrlCaptureForm } from '@/features/capture/components/url-capture-form';
import type { CaptureResult, CaptureType } from '@/features/capture/types';

/**
 * /jobs/create — premium AI capture workspace. Two-column on desktop
 * (selector left, form right), single column on mobile. The screen is a
 * state machine over the REAL mutation lifecycle:
 *
 *   idle (form) → pending (AiProcessing) →
 *   settled: capture.status === 'completed' + meta.job → CaptureSuccess
 *          | transport error OR status === 'failed' → CaptureError
 *
 * No polling: the API processes inline and returns the job in meta.
 */
function CaptureContent() {
  const [method, setMethod] = useState<CaptureType>('text');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [failure, setFailure] = useState<{ result: CaptureResult | null; error: unknown } | null>(null);

  const processing = startedAt !== null && !result && !failure;

  function handleResult(next: CaptureResult) {
    if (next.capture.status === 'completed' && next.job) {
      setResult(next);
    } else {
      // Backend 201 with status=failed: pipeline ran, AI rejected the input.
      setFailure({ result: next, error: null });
    }
    setStartedAt(null);
  }

  function handleReset() {
    setResult(null);
    setFailure(null);
    setStartedAt(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="JobFlow AI · Capture"
        title="Add a new job"
        description="Let AI organize your opportunity"
        className="text-center sm:text-left"
      />

      {result ? (
        <CaptureSuccess result={result} onReset={handleReset} />
      ) : failure ? (
        <CaptureError
          result={failure.result}
          error={failure.error}
          onRetry={handleReset}
        />
      ) : processing ? (
        <AiProcessing startedAt={startedAt} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <div className="space-y-3">
            <h2 className="text-sm font-medium">Choose input method</h2>
            <CaptureSelector
              value={method}
              onChange={(next) => {
                setMethod(next);
                setFailure(null);
              }}
            />
          </div>
          <div className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-card">
            {method === 'text' && (
              <TextCaptureForm
                key="text"
                onResult={handleResult}
                onStart={() => {
                  setFailure(null);
                  setStartedAt(Date.now());
                }}
              />
            )}
            {method === 'pdf' && (
              <FileUpload
                key="pdf"
                type="pdf"
                onResult={handleResult}
                onStart={() => {
                  setFailure(null);
                  setStartedAt(Date.now());
                }}
              />
            )}
            {method === 'image' && (
              <FileUpload
                key="image"
                type="image"
                onResult={handleResult}
                onStart={() => {
                  setFailure(null);
                  setStartedAt(Date.now());
                }}
              />
            )}
            {method === 'url' && (
              <UrlCaptureForm
                key="url"
                onResult={handleResult}
                onStart={() => {
                  setFailure(null);
                  setStartedAt(Date.now());
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateJobPage() {
  return <CaptureContent />;
}
