'use client';

import Link from 'next/link';
import { BriefcaseIcon, SearchXIcon, SparklesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Empty states for the jobs workspace.
 *
 * Two genuinely different situations, two different messages. "Nothing
 * matched" is not the same as "nothing exists" — conflating them sends a
 * user who mistyped a search term off to create a duplicate job. Neither
 * state ever shows placeholder rows to fill the gap (the shared
 * `EmptyState` contract), so an empty pipeline can never be mistaken for
 * a failed query.
 */
export function JobEmpty() {
  return (
    <EmptyState
      icon={BriefcaseIcon}
      title="Your AI job tracker is empty."
      description="Capture a job posting and AI will extract the role, company, skills and deadlines for you — then score how well it matches."
      action={
        <Button
          size="sm"
          variant="ai"
          render={<Link href="/jobs/create" />}
          nativeButton={false}
        >
          <SparklesIcon />
          Capture your first job
        </Button>
      }
    />
  );
}

/**
 * No results for the current search/filter. Kept separate so the copy can
 * point at the filter controls instead of the capture flow.
 */
export function JobNoResults({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="No matching jobs"
      description="No opportunities match your current search and filters."
      action={
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      }
    />
  );
}
