'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { ApplicationActions } from '@/features/applications/components/application-actions';
import { ApplicationActivity } from '@/features/applications/components/application-activity';
import {
  APPLICATION_STATUS_META,
  formatDate,
} from '@/features/applications/application-status-meta';
import type { Application, ApplicationStatus } from '@/features/applications/types';
import type { Job } from '@/features/jobs/types';
import { cn } from 'cn';

/**
 * DETAIL PANEL for the selected application.
 *
 * Layout: a sticky sidebar on wide screens; on narrow screens the page
 * stacks it above the board. The panel is a labelled region rather than a
 * modal so it stays in the document flow and remains reachable by keyboard
 * and screen readers without focus-trapping.
 */
export function ApplicationDetailPanel({
  application,
  job,
  isSaving,
  onStatusChange,
  onNotesChange,
  onClose,
}: {
  application: Application;
  job: Job;
  isSaving: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const meta = APPLICATION_STATUS_META[application.status];

  // Move focus to the panel heading when the selection changes, so keyboard
  // and screen-reader users are told that a new panel opened.
  useEffect(() => {
    headingRef.current?.focus();
  }, [application.id]);

  return (
    <motion.aside
      key={application.id}
      role="region"
      aria-label={`Application details for ${job.title} at ${job.company}`}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-card p-4',
        'lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto',
      )}
    >
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-caption text-muted-foreground">{job.company}</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-section-title font-heading text-balance text-foreground outline-none"
          >
            {job.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill label={meta.label} tone={meta.tone} size="lg" />
            <span className="text-micro text-muted-foreground">
              Applied {formatDate(application.applied_date)}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close application details"
        >
          <XIcon aria-hidden="true" />
        </Button>
      </header>

      <ApplicationActions
        application={application}
        jobTitle={job.title}
        isSaving={isSaving}
        onStatusChange={onStatusChange}
        onNotesChange={onNotesChange}
      />

      <div className="border-t border-border/60 pt-4">
        <ApplicationActivity application={application} />
      </div>
    </motion.aside>
  );
}
