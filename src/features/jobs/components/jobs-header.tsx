'use client';

import Link from 'next/link';
import { FileUpIcon, SparklesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * /jobs masthead. Mirrors the dashboard header so moving between the two
 * workspaces feels like the same product rather than two apps.
 */
function JobsHeader({ total }: { total: number }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 space-y-2">
        <p className="text-caption font-medium tracking-wide text-muted-foreground">
          AI Opportunity Workspace
        </p>

        <h1 className="text-page-title font-heading text-balance text-foreground">
          My Opportunities
        </h1>

        <p className="text-body max-w-xl text-pretty text-muted-foreground">
          Track, analyze, and manage your AI-powered job pipeline.
          {total > 0 ? (
            <span className="tabular-nums"> · {total} tracked</span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" render={<Link href="/resume" />} nativeButton={false}>
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

export { JobsHeader };
