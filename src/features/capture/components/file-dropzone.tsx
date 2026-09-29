'use client';

import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import {
  CircleCheckIcon,
  FileTextIcon,
  FileUpIcon,
  ImageIcon,
  Loader2Icon,
  SparklesIcon,
  TriangleAlertIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';

import { FieldError } from '@/components/form-error';
import { Button } from '@/components/ui/button';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import type { CaptureType } from '@/features/capture/types';
import {
  exceedsMaxSize,
  formatBytes,
  isImageFile,
  isPdfFile,
  MAX_UPLOAD_BYTES,
} from '@/lib/files';
import { ApiError } from '@/lib/api';
import { cn } from 'cn';

export const ACCEPT: Record<
  Extract<CaptureType, 'pdf' | 'image'>,
  { accept: string; label: string }
> = {
  pdf: { accept: 'application/pdf,.pdf', label: 'PDF up to 10MB' },
  image: {
    accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
    label: 'JPG, PNG or WebP up to 10MB',
  },
};

export const MAX_BYTES = MAX_UPLOAD_BYTES;

/**
 * Client-side pre-flight mirroring the server rules, so an obviously bad
 * file never costs a round-trip. The server remains authoritative.
 */
export function validateCaptureFile(
  type: Extract<CaptureType, 'pdf' | 'image'>,
  next: File,
): string | null {
  if (exceedsMaxSize(next)) {
    return 'That file is over 10MB. Please choose a smaller file.';
  }
  if (type === 'pdf' && !isPdfFile(next)) {
    return 'Only PDF files are supported for this input method.';
  }
  if (type === 'image' && !isImageFile(next)) {
    return 'Only JPG, PNG or WebP images are supported.';
  }

  return null;
}

/**
 * The five states a picked file moves through. `uploading` is driven by real
 * `onUploadProgress` bytes and `analyzing` by the mutation still being in
 * flight — nothing here is on a timer.
 */
export type FileState = 'idle' | 'uploading' | 'analyzing' | 'completed' | 'failed';

const STATE_META: Record<
  Exclude<FileState, 'idle'>,
  { label: string; tone: StatusTone; icon: LucideIcon }
> = {
  uploading: { label: 'Uploading', tone: 'ai', icon: Loader2Icon },
  analyzing: { label: 'Analyzing', tone: 'ai', icon: SparklesIcon },
  completed: { label: 'Extracted', tone: 'success', icon: CircleCheckIcon },
  failed: { label: 'Failed', tone: 'danger', icon: TriangleAlertIcon },
};

/** Live byte progress. Only rendered while real progress is known. */
function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-1.5" role="status" aria-label="Upload progress">
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
 * File input surface.
 *
 * Two visual modes share one element: an empty dropzone, and — once a file is
 * chosen — a file card carrying name, size, live progress and a state pill.
 * The card replaces the dropzone rather than stacking beneath it, because the
 * drop target and the upload status are the same object to the user.
 *
 * Fully controlled: the workspace owns the file, the mutation and therefore
 * the state. This component only renders what it is told.
 */
function FileDropzone({
  type,
  file,
  state,
  progress,
  disabled,
  onPick,
  onClear,
}: {
  type: Extract<CaptureType, 'pdf' | 'image'>;
  file: File | null;
  state: FileState;
  /** Real upload percentage, or null when not yet known. */
  progress: number | null;
  disabled: boolean;
  onPick: (file: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const config = ACCEPT[type];
  const meta = state === 'idle' ? null : STATE_META[state];
  const FileIcon = type === 'pdf' ? FileTextIcon : ImageIcon;

  function open() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) {
      onPick(event.dataTransfer.files?.[0] ?? null);
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={config.accept}
      disabled={disabled}
      onChange={(event) => {
        onPick(event.target.files?.[0] ?? null);
        // Reset so re-picking the same filename after a failure still fires.
        event.target.value = '';
      }}
      className="sr-only"
    />
  );

  if (file) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'space-y-3 rounded-xl border p-3',
          state === 'failed'
            ? 'border-destructive/30 bg-destructive/[0.04]'
            : state === 'completed'
              ? 'border-success/30 bg-success/[0.04]'
              : 'border-ai/30 bg-ai/[0.03]',
        )}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ai/12 text-ai"
          >
            <FileIcon className="size-4" />
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-body font-medium text-foreground">
              {file.name}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                data-tabular="true"
                className="text-caption text-muted-foreground"
              >
                {formatBytes(file.size)}
              </span>
              {meta ? (
                <StatusPill
                  label={meta.label}
                  tone={meta.tone}
                  leading={
                    <meta.icon
                      aria-hidden="true"
                      className={cn(
                        'size-3',
                        state === 'uploading' || state === 'analyzing'
                          ? 'animate-pulse'
                          : null,
                      )}
                    />
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={disabled}
              onClick={open}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove file"
              disabled={disabled}
              onClick={onClear}
            >
              <XIcon />
            </Button>
          </div>
        </div>

        {state === 'uploading' && progress !== null && (
          <UploadProgress progress={progress} />
        )}

        {state === 'analyzing' && (
          <p className="text-caption text-muted-foreground">
            Upload complete — AI is reading your file.
          </p>
        )}

        {input}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={`Drop a ${type === 'pdf' ? 'PDF' : 'screenshot'} here, or browse`}
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
          'flex flex-col items-center gap-2.5 rounded-xl border border-dashed px-6 py-9 text-center',
          'transition-[background-color,border-color] duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
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
            : `Drag and drop your ${type === 'pdf' ? 'PDF' : 'screenshot'} here, or browse`}
        </p>
        <p className="text-caption text-muted-foreground">{config.label}</p>
      </div>

      {input}
    </div>
  );
}

export function FileFieldError({ error }: { error: unknown }) {
  const apiError = error instanceof ApiError ? error : null;

  return <FieldError errors={apiError?.errors} field="file" />;
}

export { FileDropzone, UploadProgress };
/** Re-exported so the capture feature keeps its single import site. */
export { formatBytes };

