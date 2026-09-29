'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3Icon,
  BellIcon,
  BriefcaseIcon,
  FileTextIcon,
  KanbanSquareIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  type LucideIcon,
} from 'lucide-react';

import {
  UserIdentity,
  UserSignOutButton,
} from '@/components/layout/user-menu';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from 'cn';

export type NavItem = {
  label: string;
  /** Undefined for items that are not routable yet (coming soon). */
  href?: string;
  icon: LucideIcon;
  /** Highlight when the pathname starts with this prefix. */
  match?: 'exact' | 'prefix';
  /** Rendered as a small trailing chip, e.g. "Soon". */
  badge?: string;
};

/**
 * Single source of truth for product navigation. The topbar derives its
 * page title from this list too, so adding a route is a one-line change.
 *
 * Items without an `href` are intentionally inert: they render disabled
 * with a "Soon" badge rather than linking to a route that does not exist.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon, match: 'exact' },
  { label: 'My Jobs', href: '/jobs', icon: BriefcaseIcon, match: 'prefix' },
  { label: 'Add Job', href: '/jobs/create', icon: PlusIcon, match: 'exact' },
  { label: 'Applications', href: '/applications', icon: KanbanSquareIcon, match: 'exact' },
  { label: 'Notifications', href: '/notifications', icon: BellIcon, match: 'exact' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3Icon, match: 'exact' },
  { label: 'Resume', href: '/resume', icon: FileTextIcon, match: 'prefix' },
];

export const UPCOMING_NAV_ITEMS: NavItem[] = [
  { label: 'Settings', icon: SettingsIcon, badge: 'Soon' },
];

/**
 * Secondary destinations that are real routes but do not belong in the main
 * rail. Rendered by the user menu so the sidebar keeps its shape.
 *
 * AI Settings is listed here rather than promoted into NAV_ITEMS: it is a
 * setting, not a destination people visit daily, and the rail is already
 * carrying the primary workflow.
 */
export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { label: 'AI Settings', href: '/settings/ai', icon: SparklesIcon, match: 'exact' },
];

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (!item.href) {
    return false;
  }
  if (item.match === 'prefix') {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return pathname === item.href;
}

/** Human title for a pathname, falling back to the segment itself. */
export function pageTitleFor(pathname: string): string {
  const match = NAV_ITEMS.find((item) => isNavItemActive(pathname, item));

  if (match) {
    return match.label;
  }
  if (pathname.startsWith('/jobs/')) {
    return 'Job details';
  }

  return 'JobFlow AI';
}

const ITEM_BASE =
  'group/nav relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-[color,background-color,box-shadow] duration-200 ease-out';

/**
 * The active item carries a restrained AI gradient plus a soft glow — the
 * only place in the product where a gradient is used for chrome. Every
 * other gradient is reserved for AI-generated content.
 */
function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item);

        // Inert items are still announced, but not actionable.
        if (!item.href) {
          return (
            <li key={item.label}>
              <div
                aria-disabled="true"
                className={cn(
                  ITEM_BASE,
                  'cursor-not-allowed text-muted-foreground/50 select-none',
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-micro text-muted-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </li>
          );
        }

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                ITEM_BASE,
                active
                  ? 'bg-gradient-to-r from-ai/[0.16] to-primary/[0.10] text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--ai)_22%,transparent),0_4px_16px_-6px_color-mix(in_oklab,var(--ai)_45%,transparent)]'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  'size-4 shrink-0 transition-colors duration-200',
                  active ? 'text-ai' : 'text-muted-foreground',
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Shared by the fixed desktop rail and the mobile drawer so both stay
 * pixel-identical — only the frame around them differs.
 */
function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ai to-primary text-ai-foreground shadow-card"
        >
          <SparklesMark />
        </span>
        <span className="min-w-0">
          <span className="block font-heading text-sm font-semibold tracking-tight text-sidebar-foreground">
            JobFlow AI
          </span>
          <span className="block truncate text-micro text-muted-foreground">
            AI Career Operating System
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Main">
        <SidebarNav
          items={NAV_ITEMS}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        <div className="space-y-0.5">
          <p className="px-3 pb-1.5 text-micro font-medium tracking-wide text-muted-foreground/70 uppercase">
            Workspace
          </p>
          <SidebarNav
            items={UPCOMING_NAV_ITEMS}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="rounded-xl border border-sidebar-border bg-card/60 p-3">
          <UserIdentity
            name={user?.name ?? null}
            email={user?.email ?? null}
            fallbackInitials="JF"
          />
          <UserSignOutButton className="mt-2.5 w-full justify-start text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function SparklesMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z" />
    </svg>
  );
}

/** Fixed rail, shown at `lg` and above. */
function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        'hidden w-[260px] shrink-0 border-r border-sidebar-border lg:block',
        className,
      )}
    >
      <div className="sticky top-0 h-dvh">
        <SidebarBody />
      </div>
    </aside>
  );
}

export { Sidebar, SidebarBody };
