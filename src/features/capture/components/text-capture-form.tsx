'use client';

import { useState, type FormEvent } from 'react';
import { SparklesIcon } from 'lucide-react';

import { FieldError } from '@/components/form-error';
import { ButtonSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTextCapture } from '@/features/capture/hooks';
import type { CaptureResult } from '@/features/capture/types';
import { ApiError } from '@/lib/api';

const MIN_LENGTH = 20;

/**
 * Paste-text capture: large textarea, 20-char client minimum,
 * POST {type:'text', content}. Server 422 field errors render inline.
 */
export function TextCaptureForm({
  onResult,
  onStart,
}: {
  onResult: (result: CaptureResult) => void;
  onStart: () => void;
}) {
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { mutate: capture, isPending, error } = useCreateTextCapture();

  const apiError = error instanceof ApiError ? error : null;
  const trimmed = content.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_LENGTH;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmed.length < MIN_LENGTH) {
      setLocalError(`Please paste at least ${MIN_LENGTH} characters so AI has enough to work with.`);
      return;
    }

    setLocalError(null);
    capture(trimmed, { onSuccess: (result) => onResult(result) });
    onStart();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <label htmlFor="capture-text" className="text-sm font-medium">
        Job description
      </label>
      <Textarea
        id="capture-text"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Paste the job description here..."
        rows={10}
        disabled={isPending}
        aria-invalid={Boolean(tooShort || apiError?.errors?.content)}
        className="min-h-48 resize-y"
      />
      <div className="flex items-center justify-between text-caption text-muted-foreground">
        <span className="tabular-nums">{trimmed.length} characters</span>
        <span>Minimum {MIN_LENGTH}</span>
      </div>
      {(localError || tooShort) && (
        <p role="alert" className="text-sm text-destructive">
          {localError ?? `Keep going — ${MIN_LENGTH - trimmed.length} more characters needed.`}
        </p>
      )}
      <FieldError errors={apiError?.errors} field="content" />
      <Button
        type="submit"
        variant="ai"
        className="w-full sm:w-auto"
        disabled={isPending}
      >
        {isPending ? <ButtonSpinner /> : <SparklesIcon />}
        {isPending ? 'Analyzing…' : 'Analyze with AI'}
      </Button>
    </form>
  );
}
