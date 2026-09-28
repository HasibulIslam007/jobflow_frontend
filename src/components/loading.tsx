import { Loader2Icon } from 'lucide-react';

import { cn } from 'cn';

/**
 * Shared loading primitives: inline button spinner + full-page fallback
 * used by route gates and suspense boundaries.
 */

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      aria-hidden="true"
      className={cn('size-4 animate-spin', className)}
    />
  );
}

export function ButtonSpinner() {
  return <Spinner className="size-4" />;
}

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
      <Spinner className="size-6 text-muted-foreground" />
      <p role="status" className="text-sm text-muted-foreground">
        {label}
      </p>
    </main>
  );
}
