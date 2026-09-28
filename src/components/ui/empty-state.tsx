import type { LucideIcon } from "lucide-react"

import { cn } from "cn"

/**
 * Premium empty state.
 *
 * The rule these enforce: an empty state must be *useful*. It names what
 * is missing, explains the consequence, and offers exactly one next step.
 * It never shows placeholder or mock data to fill the gap.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "default",
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** One primary call to action. */
  action?: React.ReactNode;
  size?: "default" | "compact";
  className?: string;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-surface/40 text-center",
        size === "compact" ? "px-6 py-10" : "px-6 py-16",
        className
      )}
    >
      {Icon ? (
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-card"
        >
          <Icon className="size-5" />
        </span>
      ) : null}

      <div className="space-y-1.5">
        <p className="text-section-title font-heading text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-body text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

/**
 * Error variant. Kept separate so failure states can never be mistaken
 * for "nothing here yet" — a distinction that matters a lot on a
 * dashboard where an empty list can mean a failed query.
 */
function ErrorState({
  title = 'Something went wrong',
  description,
  action,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      data-slot="error-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.04] px-6 py-12 text-center",
        className
      )}
    >
      <div className="space-y-1.5">
        <p className="text-section-title font-heading text-foreground">
          {title}
        </p>
        {description ? (
          <p className="mx-auto max-w-sm text-body text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

export { EmptyState, ErrorState }
