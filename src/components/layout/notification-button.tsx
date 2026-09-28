'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BellIcon, CalendarClockIcon, SparklesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Shell-level notification affordance — UI only.
 *
 * This is intentionally NOT wired to the API in this phase. The dashboard
 * already renders the live `NotificationBell` (features/notifications),
 * which owns the real data; duplicating that query here would mean two
 * independent sources of truth for unread state. The plan is to promote
 * this button to the real feed and retire the dashboard one, rather than
 * ship two competing bells.
 *
 * The panel previews the two categories the product will surface:
 * upcoming deadlines and AI reminders.
 */
function NotificationButton() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="icon"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <BellIcon />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-pop"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-caption text-muted-foreground">
                Deadlines and AI reminders
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground"
              >
                <BellIcon className="size-4" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No new notifications
                </p>
                <p className="text-caption text-muted-foreground">
                  You&rsquo;ll be alerted here when a deadline is close or AI
                  finishes a run.
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border px-4 py-3">
              <p className="text-micro font-medium tracking-wide text-muted-foreground uppercase">
                Coming here next
              </p>
              <ul className="space-y-1.5">
                {[
                  { icon: CalendarClockIcon, label: 'Upcoming deadlines' },
                  { icon: SparklesIcon, label: 'AI extraction reminders' },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center gap-2 text-caption text-muted-foreground"
                  >
                    <row.icon aria-hidden="true" className="size-3.5 shrink-0" />
                    {row.label}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export { NotificationButton };
