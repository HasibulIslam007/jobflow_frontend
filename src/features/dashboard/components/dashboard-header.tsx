'use client';

import Link from 'next/link';
import {
  FileUpIcon,
  RefreshCwIcon,
  SparklesIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from 'cn';

/**
 * Time-aware greeting. The dashboard is the first screen a user opens all
 * day, so "Good morning" at 11pm is a small but real credibility cost.
 */
function greetingFor(date: Date): string {
  const hour = date.getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';

  return 'Good evening';
}

/**
 * Dashboard masthead. Owns the two primary entry points into the product
 * (capture + resume) and the manual refresh for the aggregate query.
 *
 * Sign-out and notifications deliberately live elsewhere now: the account
 * menu in the app shell owns session actions, and the topbar owns
 * notifications — this header must not duplicate either.
 */
function DashboardHeader({
  name,
  isRefreshing,
  onRefresh,
  disabled,
}: {
  name: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  disabled: boolean;
}) {
  const firstName = name?.trim().split(/\s+/)[0];
  const greeting = greetingFor(new Date());

  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 space-y-2">
        <p className="text-caption font-medium tracking-wide text-muted-foreground">
          AI Career Command Center
        </p>

        <h1 className="text-page-title font-heading text-balance text-foreground">
          {greeting}
          {firstName ? <>, {firstName}</> : '.'}
        </h1>

        <p className="text-body max-w-xl text-pretty text-muted-foreground">
          Track your opportunities and let AI manage your career workflow.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={disabled}
          aria-label="Refresh dashboard"
          className="text-muted-foreground"
        >
          <RefreshCwIcon className={cn(isRefreshing && 'animate-spin')} />
        </Button>

        <Button
          variant="outline"
          render={<Link href="/resume" />}
          nativeButton={false}
        >
          <FileUpIcon />
          Upload Resume
        </Button>

        <Button variant="ai" render={<Link href="/jobs/create" />} nativeButton={false}>
          <SparklesIcon />
          Capture Job
        </Button>
      </div>
    </header>
  );
}

export { DashboardHeader };
