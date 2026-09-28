'use client';

import { useState } from 'react';
import { SparklesIcon } from 'lucide-react';

import { ButtonSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import {
  FileDropzone,
  FileFieldError,
  UploadProgress,
  validateCaptureFile,
} from '@/features/capture/components/file-dropzone';
import { useCreateFileCapture } from '@/features/capture/hooks';
import type { CaptureResult, CaptureType } from '@/features/capture/types';

/**
 * FileUpload wires the dropzone to the multipart mutation:
 * client MIME + 10MB pre-check, live progress, server 422 inline.
 */
export function FileUpload({
  type,
  onResult,
  onStart,
}: {
  type: Extract<CaptureType, 'pdf' | 'image'>;
  onResult: (result: CaptureResult) => void;
  onStart: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { mutate: capture, isPending, error, progress } = useCreateFileCapture();

  return (
    <div className="space-y-3">
      <FileDropzone
        type={type}
        file={file}
        disabled={isPending}
        onPick={(next) => {
          setLocalError(null);
          if (!next) {
            setFile(null);
            return;
          }
          const problem = validateCaptureFile(type, next);
          if (problem) {
            setLocalError(problem);
            setFile(null);
            return;
          }
          setFile(next);
        }}
        onClear={() => setFile(null)}
      />

      {isPending && progress !== null && <UploadProgress progress={progress} />}

      {localError && (
        <p role="alert" className="text-sm text-destructive">
          {localError}
        </p>
      )}
      <FileFieldError error={error} />

      <Button
        className="w-full sm:w-auto"
        disabled={isPending || !file}
        onClick={() => {
          if (file) {
            onStart();
            capture({ type, file }, { onSuccess: (result) => onResult(result) });
          }
        }}
      >
        {isPending ? <ButtonSpinner /> : <SparklesIcon />}
        {isPending ? 'Analyzing…' : 'Analyze with AI'}
      </Button>
    </div>
  );
}
