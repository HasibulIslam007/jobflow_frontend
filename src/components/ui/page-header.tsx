import { cn } from "cn"

/**
 * Consistent page header.
 *
 * One eyebrow → one title → one supporting line, with an optional action
 * cluster on the right. Every screen uses this so vertical rhythm and type
 * scale stay identical as you move between pages.
 */
function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  /** Small product/section label above the title. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons / controls, right-aligned and wrapping on small screens. */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-3",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="text-caption font-medium tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-page-title font-heading text-balance text-foreground">
          {title}
        </h1>

        {description ? (
          <p className="text-body text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export { PageHeader }
