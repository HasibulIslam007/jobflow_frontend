'use client';

import { usePathname } from 'next/navigation';
import { MenuIcon } from 'lucide-react';

import { NotificationBell } from '@/components/layout/notification-button';
import { pageTitleFor } from '@/components/layout/sidebar';
import { UserMenu } from '@/components/layout/user-menu';
import { GlobalSearch } from '@/components/search/global-search';
import { Button } from '@/components/ui/button';
import { cn } from 'cn';

/**
 * Workspace top bar.
 *
 * Sticky, translucent and minimal — it frames the page without competing
 * with it. On mobile the left slot becomes the drawer trigger, so the app
 * never needs a cramped always-visible sidebar on a phone.
 */
function Topbar({
  onOpenMenu,
  className,
}: {
  onOpenMenu?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const title = pageTitleFor(pathname);

  return (
    <header
      data-slot="topbar"
      className={cn(
        'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        className="lg:hidden"
      >
        <MenuIcon />
      </Button>

      {/* Page context. The mobile brand mark fills the gap on the rail layout. */}
      <span className="truncate font-heading text-sm font-semibold tracking-tight text-foreground">
        {title}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

export { Topbar };

