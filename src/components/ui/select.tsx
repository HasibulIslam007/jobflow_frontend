import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Native select with a custom chevron. Kept native (rather than a custom
 * listbox) so keyboard behaviour, mobile pickers and form semantics are
 * preserved for free.
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-xl border border-input bg-card/40 py-1.5 pr-9 pl-3 text-sm shadow-card transition-[background-color,border-color,box-shadow] duration-200 outline-none hover:border-foreground/20 focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { Select }
