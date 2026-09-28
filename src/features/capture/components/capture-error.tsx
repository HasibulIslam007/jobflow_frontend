import { TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { CaptureResult } from '@/features/capture/types';
import { ApiError } from '@/lib/api';

/**
 * Failure states: backend `failed` capture (error_message from the AI
 * pipeline) and transport errors (401/422/500 via ApiError). Copy stays
 * friendly and actionable — never a stack trace.
 */
export function CaptureError({
  result,
  error,
  onRetry,
}: {
  result: CaptureResult | null;
  error: unknown;
  onRetry: () => void;
}) {
  const pipelineMessage = result?.capture.error_message?.trim();

  let message =
    pipelineMessage ||
    'AI could not understand this job post. Try adding more details.';

  if (error instanceof ApiError) {
    if (error.status === 401) {
      message = 'Your session expired. Please sign in and try again.';
    } else if (error.status === 422 && !error.errors) {
      message = error.message;
    } else if (!pipelineMessage) {
      message = error.message || message;
    }
  } else if (error instanceof Error && !pipelineMessage) {
    message = error.message;
  }

  return (
    <Card className="border-destructive/30 shadow-sm">
      <CardHeader className="items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <TriangleAlertIcon className="size-5" aria-hidden="true" />
        </span>
        <CardTitle>Capture failed</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p role="alert" className="max-w-md text-center text-sm text-muted-foreground">
          {message}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
