import { cn } from 'cn';

/**
 * Field + form-level error display. Reads the `errors` map of an ApiError
 * (validation_failed) — components branch on `code`, never message text.
 */

type FormErrorsProps = {
  errors?: Record<string, string[]> | null;
  field?: string;
  className?: string;
};

export function FieldError({
  errors,
  field,
  className,
}: FormErrorsProps & { field: string }) {
  const messages = errors?.[field];

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p role="alert" className={cn('text-sm text-destructive', className)}>
      {messages[0]}
    </p>
  );
}

export function FormError({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className={cn(
        'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
        className,
      )}
    >
      {message}
    </p>
  );
}
