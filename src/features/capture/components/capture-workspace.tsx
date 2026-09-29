'use client';

import { useState, type FormEvent } from 'react';
import { InfoIcon, LinkIcon, SparklesIcon } from 'lucide-react';

import { FieldError } from '@/components/form-error';
import { ButtonSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AnimatePresence,
  motion,
} from '@/components/ui/motion';
import { Textarea } from '@/components/ui/textarea';
import { AiAnalysisPreview } from '@/features/capture/components/ai-analysis-preview';
import { CaptureError } from '@/features/capture/components/capture-error';
import { CaptureMethodSelector } from '@/features/capture/components/capture-method-selector';
import { CaptureSuccess } from '@/features/capture/components/capture-success';
import {
  FileDropzone,
  FileFieldError,
  validateCaptureFile,
  type FileState,
} from '@/features/capture/components/file-dropzone';
import {
  useCreateFileCapture,
  useCreateTextCapture,
  useCreateUrlCapture,
} from '@/features/capture/hooks';
import type { CaptureResult, CaptureType } from '@/features/capture/types';
import { useReducedMotion } from 'framer-motion';
import { ApiError } from '@/lib/api';
import { cn } from 'cn';

/** Matches the server's `min:20` rule for capture content. */
const MIN_LENGTH = 20;

/** Explicit tuple so the easing stays assignable to Framer's transition type. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());

    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** A single URL with no whitespace — the "you meant Import URL" case. */
function isLoneUrl(value: string): boolean {
  const trimmed = value.trim();

  return trimmed !== '' && !/\s/.test(trimmed) && isValidHttpUrl(trimmed);
}

function hostnameOf(value: string): string | null {
  try {
    return new URL(value.trim()).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Text input area.
 *
 * Fully controlled so the pasted text survives a failed run — losing a
 * 3,000-character job description because the model choked would be worse
 * than the failure itself. Paste detection is real: it reads the clipboard
 * payload, counts it, and offers the URL method when what was pasted is
 * plainly a link rather than a posting.
 */
function TextPanel({
  value,
  onChange,
  pending,
  error,
  onSubmit,
  onUseUrl,
}: {
  value: string;
  onChange: (next: string) => void;
  pending: boolean;
  error: unknown;
  onSubmit: () => void;
  onUseUrl: (url: string) => void;
}) {
  const [attempted, setAttempted] = useState(false);
  const [pastedChars, setPastedChars] = useState<number | null>(null);

  const apiError = error instanceof ApiError ? error : null;
  const trimmed = value.trim();
  const missing = Math.max(0, MIN_LENGTH - trimmed.length);
  const tooShort = missing > 0;
  const loneUrl = isLoneUrl(value);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    if (tooShort) {
      return;
    }

    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1.5">
        <div className="space-y-0.5">
          <Label htmlFor="capture-text">Job description</Label>
          <p className="text-caption text-muted-foreground">
            Paste the whole posting, requirements section included.
          </p>
        </div>

        {pastedChars !== null ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-ai/[0.06] px-2 py-0.5 text-micro text-ai">
            <SparklesIcon aria-hidden="true" className="size-3" />
            Pasted block detected ·{' '}
            <span data-tabular="true">{pastedChars.toLocaleString()}</span> chars
          </span>
        ) : null}
      </div>

      <Textarea
        id="capture-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={(event) => {
          const clipboard = event.clipboardData.getData('text');
          if (clipboard) {
            setPastedChars(clipboard.trim().length);
          }
        }}
        placeholder={
          'Senior Software Engineer at Google...\n\nPaste the full posting here — responsibilities, requirements, and how to apply.'
        }
        rows={12}
        disabled={pending}
        aria-invalid={Boolean((attempted && tooShort) || apiError?.errors?.content)}
        className="min-h-56 resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
        <span data-tabular="true">
          {trimmed.length.toLocaleString()} characters
        </span>
        <span
          className={attempted && tooShort ? 'text-warning' : undefined}
        >
          {tooShort ? `${missing} more needed` : `Minimum ${MIN_LENGTH}`}
        </span>
      </div>

      {loneUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ai/25 bg-ai/[0.04] px-3 py-2">
          <p className="text-caption text-muted-foreground">
            That looks like a link, not a job description.
          </p>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onUseUrl(trimmed)}
          >
            Import as URL
          </Button>
        </div>
      ) : null}

      {attempted && tooShort ? (
        <p role="alert" className="text-sm text-destructive">
          Paste at least {MIN_LENGTH} characters so AI has enough to work with.
        </p>
      ) : null}

      <FieldError errors={apiError?.errors} field="content" />

      <Button type="submit" variant="ai" disabled={pending}>
        {pending ? <ButtonSpinner /> : <SparklesIcon />}
        {pending ? 'Analyzing…' : 'Analyze with AI'}
      </Button>
    </form>
  );
}

/** File input area: dropzone + client pre-flight + submit. */
function FilePanel({
  type,
  file,
  state,
  progress,
  pending,
  error,
  localError,
  onPick,
  onClear,
  onSubmit,
}: {
  type: Extract<CaptureType, 'pdf' | 'image'>;
  file: File | null;
  state: FileState;
  progress: number | null;
  pending: boolean;
  error: unknown;
  localError: string | null;
  onPick: (next: File | null) => void;
  onClear: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3">
      <FileDropzone
        type={type}
        file={file}
        state={state}
        progress={progress}
        disabled={pending}
        onPick={onPick}
        onClear={onClear}
      />

      {localError ? (
        <p role="alert" className="text-sm text-destructive">
          {localError}
        </p>
      ) : null}

      <FileFieldError error={error} />

      <Button variant="ai" disabled={pending || !file} onClick={onSubmit}>
        {pending ? <ButtonSpinner /> : <SparklesIcon />}
        {pending ? 'Analyzing…' : 'Analyze with AI'}
      </Button>
    </div>
  );
}

/**
 * URL input area.
 *
 * The preview card only echoes what the user typed plus the parsed hostname —
 * no favicon or metadata is fetched, so nothing here depends on the remote
 * page being reachable before the real request is made.
 */
function UrlPanel({
  value,
  onChange,
  pending,
  error,
  onSubmit,
}: {
  value: string;
  onChange: (next: string) => void;
  pending: boolean;
  error: unknown;
  onSubmit: () => void;
}) {
  const [touched, setTouched] = useState(false);
  const apiError = error instanceof ApiError ? error : null;
  const trimmed = value.trim();
  const valid = isValidHttpUrl(trimmed);
  const host = hostnameOf(trimmed);
  const showInvalid = (touched || trimmed === '') && trimmed !== '' && !valid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!valid) {
      return;
    }

    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="space-y-2">
        <Label htmlFor="capture-url">Job posting URL</Label>

        <div className="relative">
          <LinkIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="capture-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://company.com/careers/job"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={() => setTouched(true)}
            disabled={pending}
            aria-invalid={Boolean(showInvalid || apiError?.errors?.content)}
            className="pl-8 font-mono text-caption"
          />
        </div>

        {showInvalid ? (
          <p role="alert" className="text-sm text-destructive">
            Enter a valid URL starting with http:// or https://
          </p>
        ) : null}

        <FieldError errors={apiError?.errors} field="content" />
      </div>

      {trimmed !== '' ? (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border p-3',
            valid
              ? 'border-border bg-surface/40'
              : 'border-destructive/30 bg-destructive/[0.04]',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg',
              valid ? 'bg-ai/10 text-ai' : 'bg-destructive/10 text-destructive',
            )}
          >
            <LinkIcon className="size-4" />
          </span>

          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-micro text-muted-foreground">
              {valid ? (host ?? 'Link') : 'Not a valid link'}
            </p>
            <p className="truncate text-body text-foreground">{trimmed}</p>
            <p className="text-micro text-muted-foreground">
              {valid
                ? 'Public page — AI fetches and reads it.'
                : 'Links must start with http:// or https://'}
            </p>
          </div>
        </div>
      ) : (
        <p className="flex items-start gap-2 text-caption text-muted-foreground">
          <InfoIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Public postings only — private or login-walled pages cannot be read.
        </p>
      )}

      <Button type="submit" variant="ai" disabled={pending}>
        {pending ? <ButtonSpinner /> : <SparklesIcon />}
        {pending ? 'Analyzing…' : 'Analyze URL'}
      </Button>
    </form>
  );
}

/**
 * AI Job Intake Studio.
 *
 * Owns the entire capture flow so there is exactly one: method, inputs, the
 * three existing mutations and the phase. The page above just stacks this
 * between the masthead and the history.
 *
 * The screen is a state machine over the REAL mutation lifecycle:
 *
 *   studio (idle | submitting) → settled:
 *     capture.status === 'completed' && meta.job → success panel
 *     transport error OR status === 'failed'     → error panel
 *
 * Both terminal panels replace the studio's two columns with a single
 * full-width column: once there is a result to read, a 22rem side rail is the
 * wrong shape for it. No polling — the API processes inline and returns the
 * job in `meta`, so the mutation resolving *is* the completion signal.
 *
 * Inputs are held here rather than inside the panels, so a failed run never
 * costs the user their pasted description or chosen file. That is what makes
 * "Try Again" a real retry instead of a reset.
 */
function CaptureWorkspace() {
  const [method, setMethod] = useState<CaptureType>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [failure, setFailure] = useState<{
    result: CaptureResult | null;
    error: unknown;
  } | null>(null);
  const reducedMotion = useReducedMotion();

  const textMutation = useCreateTextCapture();
  const urlMutation = useCreateUrlCapture();
  const fileMutation = useCreateFileCapture();

  const active =
    method === 'text'
      ? textMutation
      : method === 'url'
        ? urlMutation
        : fileMutation;

  const processing = startedAt !== null && !result && !failure;
  const pending = processing || active.isPending;
  const fileType: Extract<CaptureType, 'pdf' | 'image'> =
    method === 'image' ? 'image' : 'pdf';

  /**
   * The backend can return 201 with `status: 'failed'` when the pipeline ran
   * but the model rejected the input — that is a failure, not a success.
   */
  function handleResult(next: CaptureResult) {
    if (next.capture.status === 'completed' && next.job) {
      setResult(next);
    } else {
      setFailure({ result: next, error: null });
    }
    setStartedAt(null);
  }

  function begin() {
    setFailure(null);
    setStartedAt(Date.now());
  }

  /**
   * Transport-level failure (401/422/429/5xx/network).
   *
   * This path is essential: without it `startedAt` stays set and the studio
   * is stuck on "Analyzing…" forever, because `onSuccess` never runs on a
   * rejected request. The original screen only handled the 201-with-
   * `status: 'failed'` case, which made the error panel unreachable for every
   * real HTTP failure.
   */
  function handleFailure(nextError: unknown) {
    setFailure({ result: null, error: nextError });
    setStartedAt(null);
  }

  function resetMutations() {
    textMutation.reset();
    urlMutation.reset();
    fileMutation.reset();
  }

  function submitText() {
    begin();
    textMutation.mutate(text.trim(), {
      onSuccess: handleResult,
      onError: handleFailure,
    });
  }

  function submitUrl() {
    begin();
    urlMutation.mutate(url.trim(), {
      onSuccess: handleResult,
      onError: handleFailure,
    });
  }

  function submitFile() {
    if (!file) {
      return;
    }

    begin();
    fileMutation.mutate(
      { type: fileType, file },
      { onSuccess: handleResult, onError: handleFailure },
    );
  }

  function handleMethodChange(next: CaptureType) {
    setMethod(next);
    setFailure(null);
    setFileError(null);
    // A stale error from the previous method must not follow the user.
    resetMutations();
  }

  function handlePickFile(next: File | null) {
    setFileError(null);

    if (!next) {
      setFile(null);
      return;
    }

    const problem = validateCaptureFile(fileType, next);

    if (problem) {
      setFileError(problem);
      setFile(null);
      return;
    }

    setFile(next);
  }

  /** "That looks like a link" → carry the value across to the URL method. */
  function handleUseUrl(nextUrl: string) {
    setUrl(nextUrl);
    handleMethodChange('url');
  }

  /** Back to the studio with every input intact. */
  function returnToStudio() {
    setResult(null);
    setFailure(null);
    setStartedAt(null);
    resetMutations();
  }

  /** "Create Another" — a clean studio, keeping the chosen method. */
  function handleReset() {
    returnToStudio();
    setText('');
    setUrl('');
    setFile(null);
    setFileError(null);
  }

  /**
   * True retry: re-dispatch with the retained input. Falls back to the studio
   * when the input no longer validates, so the user is never left staring at
   * an unchanged error screen.
   */
  function handleRetry() {
    returnToStudio();

    if (method === 'text' && text.trim().length >= MIN_LENGTH) {
      submitText();
      return;
    }
    if (method === 'url' && isValidHttpUrl(url)) {
      submitUrl();
      return;
    }
    if (file && (method === 'pdf' || method === 'image')) {
      submitFile();
    }
  }

  /**
   * Five-state file surface. `uploading` and `analyzing` are the two the
   * studio really shows; `completed` and `failed` resolve in the same tick as
   * the panel swap, so they exist for completeness and would render correctly
   * if the studio were ever kept mounted.
   */
  function resolveFileState(): FileState {
    if (fileMutation.isPending) {
      return fileMutation.progress !== null && fileMutation.progress < 100
        ? 'uploading'
        : 'analyzing';
    }
    if (fileMutation.isError) {
      return 'failed';
    }
    if (fileMutation.isSuccess && !result) {
      return 'completed';
    }

    return 'idle';
  }

  const fileState = resolveFileState();

  const inputPanel =
    method === 'text' ? (
      <TextPanel
        value={text}
        onChange={setText}
        pending={pending}
        error={processing ? null : textMutation.error}
        onSubmit={submitText}
        onUseUrl={handleUseUrl}
      />
    ) : method === 'url' ? (
      <UrlPanel
        value={url}
        onChange={setUrl}
        pending={pending}
        error={processing ? null : urlMutation.error}
        onSubmit={submitUrl}
      />
    ) : (
      <FilePanel
        type={fileType}
        file={file}
        state={fileState}
        progress={fileMutation.progress}
        pending={pending}
        error={processing ? null : fileMutation.error}
        localError={fileError}
        onPick={handlePickFile}
        onClear={() => {
          setFile(null);
          setFileError(null);
        }}
        onSubmit={submitFile}
      />
    );

  /** Short, single-curve swap between studio, success and failure. */
  const panelMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: reducedMotion ? 0 : 0.22, ease: EASE },
  };

  return (
    <div className="flex flex-col gap-6">
      <CaptureMethodSelector
        value={method}
        onChange={handleMethodChange}
        disabled={pending}
      />

      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div key="success" {...panelMotion}>
            <CaptureSuccess result={result} onReset={handleReset} />
          </motion.div>
        ) : failure ? (
          <motion.div key="failure" {...panelMotion}>
            <CaptureError
              result={failure.result}
              error={failure.error}
              onRetry={handleRetry}
              onChangeMethod={returnToStudio}
            />
          </motion.div>
        ) : (
          <motion.div
            key="studio"
            {...panelMotion}
            className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
          >
            <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-card sm:p-5">
              {inputPanel}
            </div>

            {/* Sticks alongside a long pasted description so the pipeline
                stays visible while the user scrolls their own input. */}
            <div className="min-w-0 lg:sticky lg:top-6">
              <AiAnalysisPreview
                method={method}
                running={processing}
                startedAt={startedAt}
                uploadProgress={
                  fileMutation.isPending ? fileMutation.progress : null
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { CaptureWorkspace };





