'use client';

import {
  LogOutIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/features/auth/hooks';
import { ButtonSpinner } from '@/components/loading';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from 'cn';

/** First letters of up to two words, upper-cased. */
export function initialsFor(name: string | null | undefined): string {
  if (!name) {
    return '';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Deterministic brand gradient per user, so avatars stay recognisable. */
function avatarGradient(seed: string): string {
  const gradients = [
    'from-ai to-primary',
    'from-primary to-success',
    'from-warning to-destructive',
    'from-success to-ai',
  ];
  const index =
    [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % gradients.length;

  return gradients[index];
}

function UserAvatar({
  name,
  fallbackInitials = 'JF',
  size = 'default',
  className,
}: {
  name: string | null | undefined;
  fallbackInitials?: string;
  size?: 'default' | 'lg';
  className?: string;
}) {
  const initials = initialsFor(name) || fallbackInitials;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-card select-none',
        avatarGradient(name ?? fallbackInitials),
        size === 'lg' ? 'size-9 text-sm' : 'size-8 text-xs',
        className,
      )}
    >
      {initials}
    </span>
  );
}

/**
 * Name + email block. Accepts values as props so the sidebar can read them
 * straight from the auth store without this component knowing about it.
 */
function UserIdentity({
  name,
  email,
  fallbackInitials = 'JF',
}: {
  name: string | null;
  email: string | null;
  fallbackInitials?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar name={name} fallbackInitials={fallbackInitials} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {name ?? 'Signed in'}
        </p>
        <p className="truncate text-micro text-muted-foreground">
          {email ?? '—'}
        </p>
      </div>
    </div>
  );
}

/**
 * Logout control. Delegates entirely to the existing `useLogout()`
 * mutation — no auth logic is duplicated here.
 */
function UserSignOutButton({
  className,
  onClick,
  label = 'Sign out',
}: {
  className?: string;
  onClick?: () => void;
  label?: string;
}) {
  const { mutate: signOut, isPending } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('gap-2', className)}
      disabled={isPending}
      onClick={() => {
        onClick?.();
        signOut();
      }}
    >
      {isPending ? <ButtonSpinner /> : <LogOutIcon className="size-4" />}
      {label}
    </Button>
  );
}

type MenuAction = {
  label: string;
  icon: LucideIcon;
  /** Undefined while the route does not exist yet. */
  href?: string;
  badge?: string;
  destructive?: boolean;
};

/**
 * Account dropdown in the topbar.
 *
 * AI Settings is a live route (Phase 7 BYOK). Profile and the remaining
 * Settings surface are still inert — they render as disabled rows with a
 * "Soon" chip rather than dead links.
 */
function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const { mutate: signOut, isPending } = useLogout();

  const actions: MenuAction[] = [
    { label: 'AI Settings', icon: SparklesIcon, href: '/settings/ai' },
    { label: 'Profile', icon: UserIcon, href: undefined, badge: 'Soon' },
    { label: 'Settings', icon: SettingsIcon, href: undefined, badge: 'Soon' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="flex items-center gap-2 rounded-xl p-0.5 transition-colors duration-200 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <UserAvatar name={user?.name} />
          </button>
        }
      />

      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        {/*
          DropdownMenuLabel maps to Base UI's Menu.GroupLabel, which throws
          `MenuGroupRootContext is missing` (and takes the page down with it)
          unless it sits inside a Group. Wrapping is mandatory, not stylistic.
        */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
            <UserAvatar name={user?.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {user?.name ?? 'Signed in'}
              </span>
              <span className="block truncate text-micro font-normal text-muted-foreground">
                {user?.email ?? '—'}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {actions.map((action) => (
          <DropdownMenuItem key={action.label} disabled>
            <action.icon className="size-4" />
            <span className="flex-1">{action.label}</span>
            {action.badge ? (
              <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-micro text-muted-foreground">
                {action.badge}
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={() => signOut()}
        >
          {isPending ? <ButtonSpinner /> : <LogOutIcon className="size-4" />}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserAvatar, UserIdentity, UserMenu, UserSignOutButton };
