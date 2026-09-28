import * as React from "react"
import { cn } from "cn"

/**
 * Multi-line control. Matches Input's surface, border and focus ring so
 * long-form entry (job descriptions, notes) looks part of the same system.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 rounded-xl border border-input bg-card/40 px-3 py-2.5 text-base leading-relaxed shadow-card transition-[background-color,border-color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
