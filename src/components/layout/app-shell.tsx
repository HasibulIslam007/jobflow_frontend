'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';

import { Sidebar, SidebarBody } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { cn } from 'cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Mobile navigation drawer, shown below `lg`. */
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();

  // Lock background scroll while the drawer owns the viewport.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="lg:hidden">
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-background/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] border-r border-sidebar-border shadow-pop"
            initial={reduced ? { opacity: 0 } : { x: '-100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '-100%' }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="absolute top-4 right-3 z-10"
            >
              <XIcon />
            </Button>

            <SidebarBody onNavigate={onClose} />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * The authenticated workspace frame.
 *
 * Desktop (≥lg) — a fixed 260px rail beside a scrolling content column.
 * Tablet       — the rail collapses into the topbar's drawer trigger.
 * Mobile       — one clean single column with a slide-in drawer.
 *
 * The shell owns the single <main> landmark, the scroll container and all
 * page padding, so route components stay pure content.
 */
function AppShell({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  /*
   * The drawer closes on navigation by *deriving* its state rather than
   * syncing it in an effect: we remember which route it was opened on and
   * only treat it as open while the user is still there. That also covers
   * browser back/forward, which an onClick handler alone would miss.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const drawerOpen = openedOn !== null && openedOn === pathname;

  const openMenu = useCallback(() => setOpenedOn(pathname), [pathname]);
  const closeMenu = useCallback(() => setOpenedOn(null), []);

  return (
    <div className={cn('flex h-dvh w-full overflow-hidden bg-background', className)}>
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={openMenu} />

        <main className="flex-1 overflow-y-auto">
          {/*
            Keyed on pathname so each route gets one short entrance. The
            wrapper remounts, but pages are cache-backed (TanStack Query
            staleTime), so navigation still reads instantly from cache.
          */}
          <motion.div
            key={pathname}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.22, ease: EASE }}
            className={cn(
              'mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8',
              contentClassName,
            )}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <MobileDrawer open={drawerOpen} onClose={closeMenu} />
    </div>
  );
}

export { AppShell, MobileDrawer };
