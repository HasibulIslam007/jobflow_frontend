import {
  FileWarningIcon,
  ImageOffIcon,
  RotateCcwIcon,
  SearchXIcon,
  ServerCrashIcon,
  ShieldAlertIcon,
  TimerIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CaptureResult } from '@/features/capture/types';
import { ApiError } from '@/lib/api';
import { cn } from 'cn';

type ReasonKey = 'file' | 'image' | 'missing' | 'provider' | 'session' | 'rate';

const REASONS: Record<
  ReasonKey,
  { label: string; guidance: string; icon: LucideIcon }
> = {
  file: {
    label: 'Invalid or unreadable file',
    guidance:
      'Confirm the file is a real PDF or image under 10MB and is not password-protected.',
    icon: FileWarningIcon,
  },
  image: {
    label: 'Unreadable image',
    guidance:
      'The AI could not read any job details from this image. Screenshots need sharp, legible text — re-upload at full size and crop out browser chrome.',
    icon: ImageOffIcon,
  },
  missing: {
    label: 'Missing information',
    guidance:
      'Include the job title, company and requirements. Short snippets rarely carry enough signal.',
    icon: SearchXIcon,
  },
  provider: {
    label: 'AI provider issue',
    guidance:
      'The model did not respond in time. This is usually temporary — try again in a moment.',
    icon: ServerCrashIcon,
  },
  session: {
    label: 'Session expired',
    guidance: 'Sign in again, then re-run the capture.',
    icon: ShieldAlertIcon,
  },
  rate: {
    label: 'Too many captures',
    guidance: 'You have hit the capture limit. Wait a moment before retrying.',
    icon: TimerIcon,
  },
};

/** The four causes worth listing as guidance, in the spec's order. */
const COMMON: ReasonKey[] = ['file', 'image', 'missing', 'provider'];

/**
 * Maps the failure to a cause using only real signals: the HTTP status, the
 * pipeline's own `error_message`, or the transport message. When nothing
 * matches, it says so instead of picking a cause at random.
 */
function detectReason(
  result: CaptureResult | null,
  error: unknown,
): { key: ReasonKey; detail: string | null } {
  const pipeline = result?.capture.error_message?.trim() ?? '';
  const text = pipeline.toLowerCase();

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return { key: 'session', detail: error.message };
    }
    if (error.status === 429) {
      return { key: 'rate', detail: error.message };
    }
    if (error.status === 413) {
      return { key: 'file', detail: 'The file was rejected as too large.' };
    }
    if (error.status >= 500) {
      return { key: 'provider', detail: pipeline || error.message };
    }
    if (error.status === 422) {
      return { key: 'missing', detail: pipeline || error.message };
    }
  }

  if (text) {
    // Checked BEFORE the provider bucket, and deliberately so. The pipeline
    // wraps a "model returned empty fields" failure in "Invalid response from
    // AI provider [gemini]: …", which matches /provider/ and was therefore
    // reported as a timeout — sending users into a retry loop that could never
    // succeed, because the real cause was an input the model could not read.
    if (/missing required fields|must not be empty|no readable text|empty response/.test(text)) {
      // For an image capture the actionable advice is about the picture; for
      // text it is about the pasted content.
      return {
        key: result?.capture.type === 'image' ? 'image' : 'missing',
        detail: pipeline,
      };
    }

    if (/image|ocr|vision|screenshot|pixel|blurry/.test(text)) {
      return { key: 'image', detail: pipeline };
    }
    if (/pdf|file|format|corrupt|password|encrypt|size/.test(text)) {
      return { key: 'file', detail: pipeline };
    }
    if (
      /provider|timeout|timed out|unavailable|quota|rate limit|service|model/.test(
        text,
      )
    ) {
      return { key: 'provider', detail: pipeline };
    }

    return { key: 'missing', detail: pipeline };
  }

  if (error instanceof Error) {
    return { key: 'provider', detail: error.message };
  }

  return { key: 'missing', detail: null };
}

/**
 * Premium failure state.
 *
 * Names the most likely cause from real evidence, shows the scanner's own
 * message verbatim (never hidden behind friendlier copy), and keeps the four
 * common causes visible so the user has a next move whichever one applies.
 */
export function CaptureError({
  result,
  error,
  onRetry,
  onChangeMethod,
}: {
  result: CaptureResult | null;
  error: unknown;
  onRetry: () => void;
  /** Optional escape hatch back to the method picker. */
  onChangeMethod?: () => void;
}) {
  const { key, detail } = detectReason(result, error);
  const reason = REASONS[key];
  const ReasonIcon = reason.icon;
  const fieldErrors = error instanceof ApiError ? error.errors : undefined;
  const fieldMessages = fieldErrors
    ? Object.entries(fieldErrors).flatMap(([field, messages]) =>
        messages.map((message) => ({ field, message })),
      )
    : [];

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/12 text-destructive"
          >
            <TriangleAlertIcon className="size-5" />
          </span>
          <div className="space-y-0.5">
            <CardTitle>AI could not analyze this job</CardTitle>
            <p className="text-body text-muted-foreground">
              Nothing was saved. Your existing jobs are untouched.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          role="alert"
          className="space-y-2.5 rounded-xl border border-destructive/25 bg-destructive/[0.04] p-4"
        >
          <div className="flex items-center gap-2">
            <ReasonIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-destructive"
            />
            <p className="text-body font-medium text-foreground">
              {reason.label}
            </p>
          </div>

          <p className="text-body text-muted-foreground">{reason.guidance}</p>

          {detail ? (
            <p className="border-t border-destructive/15 pt-2.5 text-caption text-muted-foreground">
              <span className="text-foreground">Scanner said:</span> {detail}
            </p>
          ) : null}

          {fieldMessages.length > 0 && (
            <ul className="space-y-1 border-t border-destructive/15 pt-2.5">
              {fieldMessages.map((entry) => (
                <li
                  key={`${entry.field}-${entry.message}`}
                  className="text-caption text-destructive"
                >
                  {entry.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-micro text-muted-foreground">
            Other common causes
          </p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {COMMON.map((commonKey) => {
              const common = REASONS[commonKey];
              const CommonIcon = common.icon;
              const matched = commonKey === key;

              return (
                <li
                  key={commonKey}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-2.5 py-2',
                    matched
                      ? 'border-destructive/25 bg-destructive/[0.04]'
                      : 'border-border/70 bg-surface/40',
                  )}
                >
                  <CommonIcon
                    aria-hidden="true"
                    className={cn(
                      'size-3.5 shrink-0',
                      matched ? 'text-destructive' : 'text-muted-foreground',
                    )}
                  />
                  <span
                    className={cn(
                      'text-caption',
                      matched ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {common.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onRetry}>
            <RotateCcwIcon />
            Try Again
          </Button>
          {onChangeMethod ? (
            <Button variant="outline" onClick={onChangeMethod}>
              Use a different method
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

