import type { ApplicationStatus } from '@/features/applications/types';
import type { StatusTone } from '@/components/ui/status-pill';

/**
 * Single source of truth for application-stage colour and copy.
 *
 * Mirrors the structure already used for job stages (`STATUS_META` in
 * job-card.tsx) but is keyed on `ApplicationStatus`, which is a separate
 * type from `JobStatus` even though both hold the same six literals. The
 * duplication is deliberate: the pipeline must keep rendering correctly if
 * one of the two enums diverges.
 */
export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; tone: StatusTone; dot: string }
> = {
  saved: { label: 'Saved', tone: 'neutral', dot: 'bg-muted-foreground' },
  preparing: { label: 'Preparing', tone: 'warning', dot: 'bg-warning' },
  applied: { label: 'Applied', tone: 'primary', dot: 'bg-primary' },
  interview: { label: 'Interview', tone: 'ai', dot: 'bg-ai' },
  offer: { label: 'Offer', tone: 'success', dot: 'bg-success' },
  rejected: { label: 'Rejected', tone: 'danger', dot: 'bg-destructive' },
};

/** Human label for a status, falling back to the raw value. */
export function statusLabel(status: ApplicationStatus): string {
  return APPLICATION_STATUS_META[status]?.label ?? status;
}

/** `2026-03-04` → `Mar 4, 2026`. Returns an em dash for missing/invalid input. */
export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** `2026-03-04` → `Mar 4`. Compact variant for dense card surfaces. */
export function formatShortDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Today as `YYYY-MM-DD`, the value shape `<input type="date">` expects. */
export function todayAsInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
