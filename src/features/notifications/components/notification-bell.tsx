'use client';

import { useEffect, useRef, useState } from 'react';

import { BellIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown';
import { useNotifications } from '@/features/notifications/hooks';

/**
 * Header bell with unread badge. Opens the notification dropdown on click;
 * closes on outside click or Escape (focus stays keyboard-friendly).
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isPending } = useNotifications();

  const unread = data?.unread_count ?? 0;

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
        aria-label={
          unread > 0
            ? `Notifications (${unread} unread)`
            : 'Notifications'
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className="relative"
      >
        <BellIcon />
        {!isPending && unread > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold tabular-nums text-destructive-foreground"
            aria-hidden="true"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}