'use client';

import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { FileUpIcon, XIcon } from 'lucide-react';

import { FieldError } from '@/components/form-error';
import { Button } from '@/components/ui/button';
import type { CaptureType } from '@/features/capture/types';
import { ApiError } from '@/lib/api';
import { cn } from 'cn';

export const ACCEPT: Record<Extract<CaptureType, 'pdf' | 'image'>, { accept: string; label: string }> = {
  pdf: { accept: 'application/pdf,.pdf', label: 'PDF up to 10MB' },
  image: { accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp', label: 'JPG, PNG or WebP up to 10MB' },
};

export const MAX_BYTES = 10 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateCaptureFile(
  type: Extract<CaptureType, 'pdf' | 'image'>,
  next: File,
): string | null {
  if (next.size > MAX_BYTES) {
    return 'That file is over 10MB. Please choose a smaller file.';
  }
  if (type === 'pdf' && next.type !== 'application/pdf' && !next.name.toLowerCase().endsWith('.pdf')) {
    return 'Only PDF files are supported for this input method.';
  }
  if (type === 'image' && !/^image\/(jpeg|png|webp)$/.test(next.type)) {
    return 'Only JPG, PNG or WebP images are supported.';
  }

  return null;
}

/**
 * Dropzone shell: drag-and-drop + picker + file preview.
 * Upload progress + submit live in FileUploadActions below.
 */
export function FileDropzone({
  type,
  file,
  disabled,
  onPick,
  onClear,
}: {
  type: Extract<CaptureType, 'pdf' | 'image'>;
  file: File | null;
  disabled: boolean;
  onPick: (file: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const config = ACCEPT[type];

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    onPick(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Drop a ${type === 'pdf' ? 'PDF' : 'screenshot'} file or browse`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'group flex flex-col items-center gap-2.5 rounded-xl border border-dashed px-6 py-10 text-center transition-[background-color,border-color] duration-200',
          dragging
            ? 'border-ai/60 bg-ai/[0.06]'
            : 'border-border bg-card/30 hover:border-foreground/25 hover:bg-card/60',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex size-10 items-center justify-center rounded-xl transition-colors duration-200',
            dragging
              ? 'bg-ai/15 text-ai'
              : 'bg-ai/10 text-ai',
          )}
        >
          <FileUpIcon className="size-5" />
        </span>
        <p className="text-sm font-medium">
          Drag and drop your {type === 'pdf' ? 'PDF' : 'screenshot'} here, or browse
        </p>
        <p className="text-xs text-muted-foreground">{config.label}</p>
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          disabled={disabled}
          onChange={(event) => onPick(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </div>

      {file && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-card">
          <div className="min-w-0">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-caption text-muted-foreground tabular-nums">
              {formatBytes(file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remove file"
            disabled={disabled}
            onClick={onClear}
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  );
}

export function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-1" role="status" aria-label="Upload progress">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-ai transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-caption text-muted-foreground tabular-nums">
        Uploading… {progress}%
      </p>
    </div>
  );
}

export function FileFieldError({ error }: { error: unknown }) {
  const apiError = error instanceof ApiError ? error : null;

  return <FieldError errors={apiError?.errors} field="file" />;
}
