'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangleIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  FolderKanbanIcon,
  GraduationCapIcon,
  ScanSearchIcon,
  SparklesIcon,
  TargetIcon,
  type LucideIcon,
} from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Resume } from '@/features/resume/types';
import { cn } from 'cn';

const EASE = [0.16, 1, 0.3, 1] as const;

type SectionId =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'missing';

/** Every section renders, even when empty — "AI found nothing here" is
 *  information, and silently hiding a section would read as a bug. */
function Empty({ children }: { children: string }) {
  return <p className="text-caption text-muted-foreground italic">{children}</p>;
}

function PanelChrome({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2">{children}</ul>;
}

/**
 * One collapsible analysis section.
 *
 * Built as a disclosure rather than native `<details>` so the open/close
 * height animates through the shared motion system, and as a button rather
 * than `role="tab"` because there is no tabpanel set to own — these
 * sections are independent, not mutually exclusive.
 */
function Disclosure({
  id,
  title,
  icon: Icon,
  count,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  icon: LucideIcon;
  count?: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const panelId = `analysis-${id}`;

  return (
    <div className="py-0.5 first:pt-0 last:pb-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-ai/[0.06] focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ai/12 text-ai"
        >
          <Icon className="size-3.5" />
        </span>

        <span className="flex-1 text-card-title text-foreground">{title}</span>

        {typeof count === 'number' ? (
          <span className="text-micro tabular-nums text-muted-foreground">
            {count}
          </span>
        ) : null}

        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-1 pt-1 pb-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * AI analysis dashboard — everything `ResumeAnalysisPrompt` extracted, in
 * six collapsible sections. Summary starts open because it is the one
 * section worth reading at a glance; the rest are reference material the
 * user opens on demand.
 */
export function ResumeAnalysisDashboard({ resume }: { resume: Resume }) {
  const [openIds, setOpenIds] = useState<SectionId[]>(['summary']);
  const analysis = resume.analysis;

  function toggle(id: SectionId) {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  }

  function isOpen(id: SectionId) {
    return openIds.includes(id);
  }

  if (!analysis) {
    return (
      <AiCard
        title="AI Resume Analysis"
        description={`Extracted from “${resume.title}”`}
        icon={<ScanSearchIcon className="size-4" />}
      >
        <div className="rounded-lg border border-dashed border-ai/20 px-4 py-8 text-center">
          <p className="text-body text-pretty text-muted-foreground">
            {resume.status === 'failed'
              ? 'AI analysis failed for this resume. Uploading it again re-runs the pipeline.'
              : resume.status === 'processing'
                ? 'Analysis is in progress — the extracted sections appear here when it completes.'
                : 'No AI analysis available for this resume yet.'}
          </p>
        </div>
      </AiCard>
    );
  }

  return (
    <AiCard
      title="AI Resume Analysis"
      description={`Extracted from “${resume.title}”`}
      icon={<ScanSearchIcon className="size-4" />}
    >
      <div className="divide-y divide-ai/12">
        <Disclosure
          id="summary"
          title="Summary"
          icon={SparklesIcon}
          open={isOpen('summary')}
          onToggle={() => toggle('summary')}
        >
          {analysis.summary ? (
            <p className="text-body text-pretty text-muted-foreground">
              {analysis.summary}
            </p>
          ) : (
            <Empty>No summary was extracted from this resume.</Empty>
          )}
        </Disclosure>

        <Disclosure
          id="skills"
          title="Skills"
          icon={TargetIcon}
          count={analysis.skills.length}
          open={isOpen('skills')}
          onToggle={() => toggle('skills')}
        >
          {analysis.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {analysis.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <Empty>No skills were extracted from this resume.</Empty>
          )}
        </Disclosure>

        <Disclosure
          id="experience"
          title="Experience"
          icon={BriefcaseIcon}
          count={analysis.experience.length}
          open={isOpen('experience')}
          onToggle={() => toggle('experience')}
        >
          {analysis.experience.length > 0 ? (
            <PanelChrome>
              {analysis.experience.map((item, index) => (
                <li
                  key={`${item.company ?? 'role'}-${index}`}
                  className="rounded-lg border border-ai/15 bg-card/40 px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="text-body font-medium text-foreground">
                      {item.title || 'Role'}
                      {item.company ? (
                        <span className="font-normal text-muted-foreground">
                          {' · '}
                          {item.company}
                        </span>
                      ) : null}
                    </span>
                    {item.period ? (
                      <span className="text-micro text-muted-foreground">
                        {item.period}
                      </span>
                    ) : null}
                  </div>

                  {item.highlights && item.highlights.length > 0 ? (
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-caption text-muted-foreground">
                      {item.highlights.map((highlight, hIndex) => (
                        <li key={`${highlight}-${hIndex}`}>{highlight}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </PanelChrome>
          ) : (
            <Empty>No roles were extracted from this resume.</Empty>
          )}
        </Disclosure>

        <Disclosure
          id="education"
          title="Education"
          icon={GraduationCapIcon}
          count={analysis.education.length}
          open={isOpen('education')}
          onToggle={() => toggle('education')}
        >
          {analysis.education.length > 0 ? (
            <PanelChrome>
              {analysis.education.map((item, index) => (
                <li
                  key={`${item.institution ?? 'education'}-${index}`}
                  className="text-body text-muted-foreground"
                >
                  <span className="font-medium text-foreground">
                    {item.degree || 'Degree'}
                  </span>
                  {item.institution ? <> · {item.institution}</> : null}
                  {item.year ? <> ({item.year})</> : null}
                </li>
              ))}
            </PanelChrome>
          ) : (
            <Empty>No education entries were extracted from this resume.</Empty>
          )}
        </Disclosure>

        <Disclosure
          id="projects"
          title="Projects"
          icon={FolderKanbanIcon}
          count={analysis.projects.length}
          open={isOpen('projects')}
          onToggle={() => toggle('projects')}
        >
          {analysis.projects.length > 0 ? (
            <PanelChrome>
              {analysis.projects.map((item, index) => (
                <li
                  key={`${item.name ?? 'project'}-${index}`}
                  className="rounded-lg border border-ai/15 bg-card/40 px-3 py-2"
                >
                  <span className="text-body font-medium text-foreground">
                    {item.name || 'Project'}
                  </span>
                  {item.description ? (
                    <p className="mt-0.5 text-caption text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </PanelChrome>
          ) : (
            <Empty>No projects were extracted from this resume.</Empty>
          )}
        </Disclosure>

        <Disclosure
          id="missing"
          title="Missing Information"
          icon={AlertTriangleIcon}
          count={analysis.missing_information.length}
          open={isOpen('missing')}
          onToggle={() => toggle('missing')}
        >
          {analysis.missing_information.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {analysis.missing_information.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="border-warning/40 bg-warning/5 font-normal text-warning"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <Empty>Nothing was flagged as missing — a good sign.</Empty>
          )}
        </Disclosure>
      </div>
    </AiCard>
  );
}

export function ResumeAnalysisDashboardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-ai/20 bg-ai/[0.03] p-4"
    >
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-2 h-3 w-52" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
