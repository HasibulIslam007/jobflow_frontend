'use client';

import { useCallback, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  CircleCheckIcon,
  FileTextIcon,
  FileUpIcon,
  Loader2Icon,
  SparklesIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import { useUploadResume } from '@/features/resume/hooks';
import type { UploadState } from '@/features/resume/types';
import { exceedsMaxSize, formatBytes, isPdfFile } from '@/lib/files';
import { cn } from 'cn';

/**
 * The five states a picked file moves through, matching the AI Capture
 * Studio's file surface so both intake screens feel like one product.
 *
 * `uploading` is driven by real `onUploadProgress` bytes and `analyzing` by
 * the mutation still being in flight — nothing runs on a timer or a guessed
 * delay, because the backend performs extraction and analysis inside the
 * same request and there is no separate polling endpoint.
 */
const STATE_META: Record<
  Exclude<UploadState, 'idle'>,
  { label: string; tone: StatusTone; icon: LucideIcon; spin?: boolean }
> = {
  uploading: { label: 'Uploading', tone: 'ai', icon: Loader2Icon, spin: true },
  analyzing: { label: 'Analyzing', tone: 'ai', icon: SparklesIcon },
  completed: { label: 'Analyzed', tone: 'success', icon: CircleCheckIcon },
  failed: { label: 'Failed', tone: 'danger', icon: TriangleAlertIcon },
};

/** What the user should read while the AI is working. */
const STATE_HINT: Record<Exclude<UploadState, 'idle'>, string> = {
  uploading: 'Sending your resume to the server…',
  analyzing: 'Upload complete — AI is reading your resume.',
  completed: 'Analysis finished. Your dashboard has been updated.',
  failed: 'Something went wrong. Try uploading the file again.',
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Live byte progress. Only rendered while a real percentage is known. */
function UploadProgress({ progress }: { progress: number }) {
  return (
    <div
      className="space-y-1.5"
      role="status"
      aria-label="Upload progress"
    >
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-ai transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-micro text-muted-foreground">
        <span data-tabular="true">{progress}%</span> uploaded
      </p>
    </div>
  );
}

/**
 * Client-side pre-flight mirroring the server rules, so an obviously bad file
 * never costs a round-trip. The server remains authoritative.
 */
function validateResumeFile(file: File): string | null {
  if (!isPdfFile(file)) {
    return 'Only PDF resumes are supported right now.';
  }
  if (exceedsMaxSize(file)) {
    return 'That file is over 10MB. Choose a smaller file.';
  }

  return null;
}

type Result = { ok: boolean; message: string } | null;

/**
 * Resume upload — PDF only, ≤10MB, drag & drop or browse.
 *
 * Redesigned to match the AI Capture Studio: the same dashed drop target,
 * the same "the file card replaces the dropzone" behaviour (they are the same
 * object to the user), the same state vocabulary and the same progress bar.
 *
 * The request itself is unchanged — `useUploadResume` still owns the multipart
 * call, the cache invalidation and the toasts. This component only decides
 * what to render for the state it is in, and deliberately keeps the failed
 * file on screen so the user can see what was rejected and retry.
 */
export function ResumeUpload({ onComplete }: { onComplete?: () => void }) {
  const upload = useUploadResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result>(null);

  const busy = state === 'uploading' || state === 'analyzing';

  function open() {
    if (!busy) inputRef.current?.click();
  }

  const handleFile = useCallback(
    (next: File | null | undefined) => {
      if (!next) return;

      const invalid = validateResumeFile(next);

      if (invalid) {
        setFile(next);
        setState('failed');
        setResult({ ok: false, message: invalid });
        toast.error(invalid);
        return;
      }

      setFile(next);
      setState('uploading');
      setProgress(0);
      setResult(null);

      upload.mutate(
        {
          file: next,
          onUploadProgress: (percent) => {
            setProgress(percent);

            // Once the bytes are on the wire the backend is running
            // extraction + AI analysis — relabel accordingly.
            if (percent >= 100) setState('analyzing');
          },
        },
        {
          onSuccess: (data) => {
            if (data.resume.status === 'failed') {
              setState('failed');
              setResult({
                ok: false,
                message:
                  data.error ??
                  'The resume uploaded, but AI analysis failed. Upload it again to retry.',
              });
              return;
            }

            setState('completed');
            setResult({
              ok: true,
              message:
                data.resume.ai_score === null
                  ? 'Resume uploaded.'
                  : `Analyzed — AI score ${data.resume.ai_score}/100.`,
            });
            onComplete?.();
          },
          onError: (error: unknown) => {
            setState('failed');
            setResult({
              ok: false,
              message:
                error instanceof Error
                  ? error.message
                  : 'Could not upload the resume.',
            });
          },
        },
      );
    },
    [onComplete, upload],
  );

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!busy) handleFile(event.dataTransfer.files?.[0]);
  }

  function reset() {
    setFile(null);
    setState('idle');
    setProgress(null);
    setResult(null);
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      onChange={(event) => {
        handleFile(event.target.files?.[0]);
        // Allow re-picking the same file after a failure.
        event.target.value = '';
      }}
    />
  );

  // File card — replaces the dropzone once a file exists, carrying name,
  // size, live progress and the state pill.
  if (file && state !== 'idle') {
    const meta = STATE_META[state];
    const Icon = meta.icon;

    return (
      <div className="space-y-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-card/40 px-3.5 py-3',
            'transition-colors duration-200 ease-out',
            state === 'failed' ? 'border-destructive/35' : 'border-ai/25',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg',
              state === 'failed'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-ai/12 text-ai',
            )}
          >
            <FileTextIcon className="size-4" />
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <p
              className="truncate text-body font-medium text-foreground"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="text-micro text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>

          <StatusPill
            label={meta.label}
            tone={meta.tone}
            showDot={false}
            leading={
              <Icon
                aria-hidden="true"
                className={cn('size-3', meta.spin && 'animate-spin')}
              />
            }
          />
        </div>

        <AnimatePresence initial={false}>
          {state === 'uploading' && progress !== null ? (
            <motion.div
              key="progress"
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
            >
              <UploadProgress progress={progress} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <p
          role={state === 'failed' ? 'alert' : 'status'}
          className={cn(
            'text-caption text-pretty',
            state === 'failed' ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {result?.message ?? STATE_HINT[state]}
        </p>

        <div className="flex items-center gap-2">
          {state === 'failed' || state === 'completed' ? (
            <Button size="sm" variant="outline" onClick={open}>
              <FileUpIcon aria-hidden="true" />
              Upload another
            </Button>
          ) : null}

          {!busy ? (
            <Button size="sm" variant="ghost" onClick={reset}>
              Clear
            </Button>
          ) : null}
        </div>

        {input}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop a PDF resume here, or browse"
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-dashed px-6 py-9 text-center',
          'transition-[background-color,border-color] duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
          dragging
            ? 'border-ai/60 bg-ai/[0.06]'
            : 'border-border bg-card/30 hover:border-ai/40 hover:bg-card/60',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex size-10 items-center justify-center rounded-xl transition-colors duration-200',
            dragging ? 'bg-ai/20 text-ai' : 'bg-ai/10 text-ai',
          )}
        >
          <FileUpIcon className="size-5" />
        </span>

        <p className="text-body font-medium text-foreground">
          {dragging
            ? 'Drop it here'
            : 'Drag and drop your PDF resume here, or browse'}
        </p>
        <p className="text-caption text-muted-foreground">
          PDF up to 10MB · AI extracts skills, experience and projects
        </p>
      </div>

      {input}
    </div>
  );
}


