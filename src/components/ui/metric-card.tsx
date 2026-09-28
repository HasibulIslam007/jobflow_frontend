import type { LucideIcon } from "lucide-react"

import { cn } from "cn"

type Tone = "primary" | "ai" | "success" | "warning" | "danger" | "neutral"

const TONE_ICON: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  ai: "bg-ai/12 text-ai",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-destructive/12 text-destructive",
  neutral: "bg-muted text-muted-foreground",
}

/**
 * Dashboard statistic tile.
 *
 * A large tabular figure, a short label and an optional delta/trend line.
 * The value uses `tabular-nums` so tiles never reflow as numbers change.
 */
function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
  trend,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  /** Secondary context, e.g. "Jobs missing a deadline". */
  hint?: string;
  /** Small trailing change indicator, e.g. "+3 this week". */
  trend?: string;
  className?: string;
}) {
  return (
    <div
      data-slot="metric-card"
      className={cn(
        "group/metric relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-[box-shadow,border-color] duration-200 ease-out hover:border-foreground/15 hover:shadow-raised",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-caption font-medium text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/metric:scale-105",
              TONE_ICON[tone]
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-2">
        <p
          data-tabular="true"
          className="font-heading text-2xl leading-none font-semibold tracking-tight text-foreground"
        >
          {value}
        </p>
        {trend ? (
          <span className="text-caption text-muted-foreground">{trend}</span>
        ) : null}
      </div>

      {hint ? <p className="text-micro text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export { MetricCard }
export type { Tone as MetricTone }
