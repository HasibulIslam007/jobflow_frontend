'use client';

import { useCallback, useRef, useState } from 'react';
import {
  FileTextIcon,
  Loader2Icon,
  UploadCloudIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { useUploadResume } from '@/features/resume/hooks';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Phase = 'uploading' | 'analyzing';

/**
 * Drag & drop resume upload (PDF, ≤10MB). Shows filename, size and the
 * processing state while the backend runs extraction + AI analysis inline:
 * uploading → analyzing → completed | failed.
 */
export function ResumeUpload() {
  const upload = useUploadResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;

      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Only PDF resumes are supported right now.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error('The file is larger than 10MB.');
        return;
      }

      setSelected(file);
      setPhase('uploading');
      upload.mutate(
        {
          file,
          onUploadProgress: (percent) => {
            // Once the bytes are on the wire, the backend is running
            // extraction + AI analysis — flip the label accordingly.
            if (percent >= 100) setPhase('analyzing');
          },
        },
        {
          onSettled: () => {
            setSelected(null);
            setPhase(null);
          },
        },
      );
    },
    [upload],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      handleFile(event.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  const isBusy = upload.isPending;
  const statusLabel =
    phase === 'analyzing'
      ? 'Analyzing with AI…'
      : phase === 'uploading'
        ? 'Uploading…'
        : 'Upload PDF Resume';

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={isBusy}
        onClick={() => !isBusy && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!isBusy && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isBusy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-border hover:border-indigo-400/60 hover:bg-indigo-500/[0.03]'
        } ${isBusy ? 'pointer-events-none opacity-70' : ''}`}
      >
        {isBusy ? (
          <Loader2Icon className="size-8 animate-spin text-indigo-500" aria-hidden="true" />
        ) : (
          <UploadCloudIcon className="size-8 text-indigo-500" aria-hidden="true" />
        )}

        <p className="text-sm font-medium">{statusLabel}</p>
        <p className="text-xs text-muted-foreground">
          Drag &amp; drop or click to browse — PDF, up to 10MB.
        </p>

        {selected && (
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs">
            <FileTextIcon className="size-3.5 text-indigo-500" aria-hidden="true" />
            <span className="font-medium">{selected.name}</span>
            <span className="text-muted-foreground">
              {formatFileSize(selected.size)}
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {upload.isError && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {upload.error instanceof Error
            ? upload.error.message
            : 'Could not upload the resume.'}
        </p>
      )}
    </div>
  );
}
