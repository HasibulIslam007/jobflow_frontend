'use client';

import Link from 'next/link';
import { BriefcaseIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

type ApplicationHeaderProps = {
  /** Opens the "record an application" composer. */
  onAddApplication: () => void;
  /** True while the composer is open, so the button can reflect it. */
  isComposerOpen: boolean;
  /** Disabled when there is no job to attach an application to. */
  canAdd: boolean;
  /** Explains *why* adding is unavailable, shown as the button's tooltip. */
  addDisabledReason?: string;
};

/**
 * Page header for the Application Pipeline.
 *
 * Uses the shared `PageHeader` so the eyebrow → title → subtitle rhythm is
 * identical to /jobs, /resume and the dashboard. The two actions mirror the
 * two things a user actually wants here: record an application, or go find a
 * job to apply to.
 */
export function ApplicationHeader({
  onAddApplication,
  isComposerOpen,
  canAdd,
  addDisabledReason,
}: ApplicationHeaderProps) {
  return (
    <PageHeader
      eyebrow="Career Pipeline"
      title="My Applications"
      description="Track every opportunity from application to offer."
      actions={
        <>
          <Button
            onClick={onAddApplication}
            disabled={!canAdd}
            title={!canAdd ? addDisabledReason : undefined}
            aria-expanded={isComposerOpen}
          >
            <PlusIcon aria-hidden="true" />
            Add Application
          </Button>

          <Button
            variant="outline"
            render={<Link href="/jobs" />}
            nativeButton={false}
          >
            <BriefcaseIcon aria-hidden="true" />
            View Jobs
          </Button>
        </>
      }
    />
  );
}
