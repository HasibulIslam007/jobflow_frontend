import type { LucideIcon } from "lucide-react"

import { cn } from "cn"

export type StatusTone =
  | "neutral"
  | "primary"
  | "ai"
  | "success"
  | "warning"
  | "danger"

/**
 * Single source of truth for status colour.
 *
 * Each status is expressed as a tinted surface plus a strong foreground,
 * so pills stay legible on both the canvas and inside cards. Dot markers
 * give a non-colour signal for users who cannot rely on hue alone.
 */
const TONE: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground ring-foreground/10",
  primary: "bg-primary/12 text-primary ring-primary/25",
  ai: "bg-ai/12 text-ai ring-ai/25",
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/12 text-warning ring-warning/25",
  danger: "bg-destructive/12 text-destructive ring-destructive/25",
};

const DOT: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  ai: "bg-ai",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

/**
 * Compact status marker for jobs, applications, captures and resumes.
 * Optionally shows a leading dot; pass `size="lg"` for emphasis.
 */
function StatusPill({
  label,
  tone = "neutral",
  icon: Icon,
  leading,
  showDot = true,
  size = "default",
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  label: React.ReactNode;
  tone?: StatusTone;
  icon?: LucideIcon;
  /** Custom leading element (e.g. a spinner). Takes precedence over `icon`/`showDot`. */
  leading?: React.ReactNode;
  showDot?: boolean;
  size?: "default" | "lg";
  children?: React.ReactNode;
}) {
  return (
    <span
      data-slot="status-pill"
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap ring-1 ring-inset",
        size === "lg" ? "h-6 px-2.5 text-caption" : "h-5 px-2 text-micro",
        TONE[tone],
        className
      )}
      {...props}
    >
      {leading ??
        (Icon ? (
          <Icon aria-hidden="true" className="size-3" />
        ) : showDot ? (
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", DOT[tone])}
          />
        ) : null)}
      {label}
      {children}
    </span>
  );
}

export { StatusPill }
