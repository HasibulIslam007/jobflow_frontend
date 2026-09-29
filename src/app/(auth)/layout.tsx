import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Shared SaaS shell for /login and /register: brand panel on desktop,
 * focused card slot on all viewports. Route group `(auth)` keeps the
 * URLs flat (/login, /register) while sharing this layout.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh w-full lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 text-foreground lg:flex">
        {/* Restrained ambient wash — one, and only behind the brand panel. */}
        <div aria-hidden="true" className="ai-wash pointer-events-none absolute inset-0" />
        <Link
          href="/"
          className="relative font-heading text-lg font-semibold tracking-tight"
        >
          JobFlow AI
        </Link>
        <div className="relative space-y-4">
          <p className="text-caption font-medium text-ai">
            AI Career Operating System
          </p>
          <h1 className="max-w-md text-page-title font-heading text-balance">
            Capture any job post. Track every deadline. Never miss an
            opportunity.
          </h1>
          <ul className="space-y-2 text-body text-muted-foreground">
            <li>· Paste a post, upload a PDF, or drop a link</li>
            <li>· AI extracts title, company, salary &amp; deadline</li>
            <li>· Kanban pipeline with reminders built in</li>
          </ul>
        </div>
        <p className="relative text-micro text-muted-foreground">
          Sanctum bearer tokens · Laravel 13 API · SOC2-ready pipeline
        </p>
      </section>

      <section className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-block font-heading text-lg font-semibold tracking-tight lg:hidden"
          >
            JobFlow AI
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
