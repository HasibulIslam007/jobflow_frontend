import { SparklesIcon } from "lucide-react"

import { cn } from "cn"

/**
 * Container for AI-generated content.
 *
 * Establishes a consistent visual contract: anything the model produced is
 * tinted with the AI accent and carries a subtle label, so a user can
 * always tell machine-generated output from data they entered themselves.
 * That distinction is the single most important trust signal in this app.
 */
function AiCard({
  className,
  children,
  title,
  description,
  icon,
  action,
  showBadge = true,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Overrides the default sparkle icon. */
  icon?: React.ReactNode;
  /** Trailing element, e.g. a score or a small button. */
  action?: React.ReactNode;
  showBadge?: boolean;
}) {
  return (
    <div
      data-slot="ai-card"
      className={cn(
        "relative overflow-hidden rounded-xl border border-ai/25 bg-ai/[0.04] shadow-card",
        className
      )}
      {...props}
    >
      {/* Ambient violet wash — one per card, never stacked. */}
      <div aria-hidden="true" className="ai-wash pointer-events-none absolute inset-0" />

      <div className="relative flex flex-col gap-3 p-4">
        {(title || showBadge) && (
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-ai/15 text-ai"
              >
                {icon ?? <SparklesIcon className="size-4" />}
              </span>
              <div className="min-w-0">
                {title ? (
                  <p className="text-card-title text-foreground">{title}</p>
                ) : null}
                {description ? (
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

/**
 * Inline "AI generated" attribution chip. Use when the AI content sits
 * outside an <AiCard>.
 */
function AiBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="ai-badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-ai/25 bg-ai/10 px-2 py-0.5 text-micro font-medium text-ai",
        className
      )}
      {...props}
    >
      <SparklesIcon aria-hidden="true" className="size-3" />
      AI
    </span>
  )
}

export { AiCard, AiBadge }
