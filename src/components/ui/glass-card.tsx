import * as React from "react"
import { cn } from "cn"

/**
 * Premium card surface.
 *
 * A restrained "glass" treatment: the page background is a fixed, very dark
 * canvas, so a single translucent surface plus a hairline border reads as
 * depth without a real backdrop-filter cost. Deliberately *not* a heavy
 * blur — that is the fastest way to make a dense dashboard feel sluggish.
 *
 * Use `GlassCard` for hero/AI surfaces; use the base `Card` for everything
 * else. Do not nest them.
 */
function GlassCard({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** Adds a small elevation lift on hover. */
  interactive?: boolean;
}) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-card backdrop-blur-xl transition-[box-shadow,border-color,transform] duration-200 ease-out",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-hover focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * Subtle top-edge highlight. Gives large surfaces a sense of a light
 * source above them without a gradient wash across the whole card.
 */
function GlassCardSheen({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { GlassCard, GlassCardSheen }
