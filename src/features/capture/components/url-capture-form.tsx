'use client';

import { useState, type FormEvent } from 'react';
import { LinkIcon, SparklesIcon } from 'lucide-react';

import { FieldError } from '@/components/form-error';
import { ButtonSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateUrlCapture } from '@/features/capture/hooks';
import type { CaptureResult } from '@/features/capture/types';
import { ApiError } from '@/lib/api';

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());

    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * URL capture: single input, http(s)-only client check mirroring the
 * server `starts_with:http://,https://` rule, POST {type:'url', content}.
 */
export function UrlCaptureForm({
  onResult,
  onStart,
}: {
  onResult: (result: CaptureResult) => void;
  onStart: () => void;
}) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const { mutate: capture, isPending, error } = useCreateUrlCapture();

  const apiError = error instanceof ApiError ? error : null;
  const trimmed = url.trim();
  const invalid = touched && trimmed !== '' && !isValidHttpUrl(trimmed);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!isValidHttpUrl(trimmed)) {
      return;
    }

    capture(trimmed, { onSuccess: (result) => onResult(result) });
    onStart();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="space-y-2">
        <Label htmlFor="capture-url">Job posting URL</Label>
        <div className="relative">
          <LinkIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="capture-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://company.com/careers/job"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(invalid || apiError?.errors?.content)}
            disabled={isPending}
            className="pl-8 font-mono text-xs"
          />
        </div>
        {invalid && (
          <p role="alert" className="text-sm text-destructive">
            Enter a valid URL starting with http:// or https://.
          </p>
        )}
        <FieldError errors={apiError?.errors} field="content" />
        <p className="text-xs text-muted-foreground">
          Public postings only — private or login-walled pages cannot be read.
        </p>
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? <ButtonSpinner /> : <SparklesIcon />}
        {isPending ? 'Analyzing…' : 'Analyze with AI'}
      </Button>
    </form>
  );
}
