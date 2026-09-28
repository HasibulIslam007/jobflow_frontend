import Link from 'next/link';
import { BriefcaseIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Beautiful empty states — never fake data. The CTA links to the
 * live AI capture workspace (/jobs/create).
 */
export function JobEmpty({
  title = 'No jobs yet',
  description = 'Add your first opportunity and let AI organize it.',
  showSearchHint = false,
}: {
  title?: string;
  description?: string;
  showSearchHint?: boolean;
}) {
  return (
    <EmptyState
      icon={BriefcaseIcon}
      title={title}
      description={description}
      action={
        showSearchHint ? (
          <p className="text-caption text-muted-foreground">
            Try a different search term or filter.
          </p>
        ) : (
          <Button
            size="sm"
            variant="ai"
            render={<Link href="/jobs/create" />}
            nativeButton={false}
          >
            <PlusIcon />
            Add Job
          </Button>
        )
      }
    />
  );
}
