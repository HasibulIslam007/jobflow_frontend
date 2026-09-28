'use client';

import {
  AlertTriangleIcon,
  BriefcaseIcon,
  FolderKanbanIcon,
  GraduationCapIcon,
  SparklesIcon,
  TargetIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Resume, ResumeAnalysis } from '@/features/resume/types';

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * AI Resume Insights — summary, skills, experience, education, projects
 * and missing information extracted by ResumeAnalysisPrompt.
 */
export function ResumeAnalysisView({ resume }: { resume: Resume }) {
  const analysis: ResumeAnalysis | null = resume.analysis;

  if (!analysis) {
    return (
      <Card className="border-dashed shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {resume.status === 'failed'
            ? 'AI analysis failed for this resume. Upload it again to retry.'
            : resume.status === 'processing'
              ? 'Analysis in progress — check back in a moment.'
              : 'No AI analysis available for this resume yet.'}
        </CardContent>
      </Card>
    );
  }

  const strong = analysis.skills.slice(0, Math.ceil(analysis.skills.length / 2));
  const improving = analysis.skills.slice(strong.length);

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/[0.03] shadow-sm dark:border-indigo-400/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-indigo-500" aria-hidden="true" />
          AI Resume Insights
        </CardTitle>
        <CardDescription>
          Extracted from “{resume.title}”
          {resume.ai_score !== null && <> · AI score {resume.ai_score}/100</>}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {analysis.summary && (
          <Section
            icon={<SparklesIcon className="size-4 text-indigo-500" aria-hidden="true" />}
            title="Summary"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {analysis.summary}
            </p>
          </Section>
        )}

        <Section
          icon={<TargetIcon className="size-4 text-indigo-500" aria-hidden="true" />}
          title="Skills"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Strong:
              </p>
              <ul className="space-y-1">
                {strong.map((skill) => (
                  <li key={skill} className="flex items-center gap-1.5 text-sm">
                    <span
                      className="text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {skill}
                  </li>
                ))}
                {strong.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    No skills extracted.
                  </li>
                )}
              </ul>
            </div>

            {improving.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Improve:
                </p>
                <ul className="space-y-1">
                  {improving.map((skill) => (
                    <li key={skill} className="flex items-center gap-1.5 text-sm">
                      <span
                        className="text-amber-600 dark:text-amber-400"
                        aria-hidden="true"
                      >
                        ⚠
                      </span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
        {analysis.experience.length > 0 && (
          <Section
            icon={<BriefcaseIcon className="size-4 text-indigo-500" aria-hidden="true" />}
            title="Experience"
          >
            <ul className="space-y-3">
              {analysis.experience.map((item, index) => (
                <li
                  key={`${item.company ?? 'exp'}-${index}`}
                  className="rounded-lg border border-border/70 px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">
                      {item.title || 'Role'}
                      {item.company && (
                        <span className="font-normal text-muted-foreground">
                          {' · '}
                          {item.company}
                        </span>
                      )}
                    </span>
                    {item.period && (
                      <span className="text-xs text-muted-foreground">
                        {item.period}
                      </span>
                    )}
                  </div>
                  {item.highlights && item.highlights.length > 0 && (
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {analysis.education.length > 0 && (
          <Section
            icon={<GraduationCapIcon className="size-4 text-indigo-500" aria-hidden="true" />}
            title="Education"
          >
            <ul className="space-y-1.5 text-sm">
              {analysis.education.map((item, index) => (
                <li
                  key={`${item.institution ?? 'edu'}-${index}`}
                  className="text-muted-foreground"
                >
                  <span className="font-medium text-foreground">
                    {item.degree || 'Degree'}
                  </span>
                  {item.institution && <> · {item.institution}</>}
                  {item.year && <> ({item.year})</>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {analysis.projects.length > 0 && (
          <Section
            icon={<FolderKanbanIcon className="size-4 text-indigo-500" aria-hidden="true" />}
            title="Projects"
          >
            <ul className="space-y-2">
              {analysis.projects.map((item, index) => (
                <li
                  key={`${item.name ?? 'project'}-${index}`}
                  className="rounded-lg border border-border/70 px-3 py-2"
                >
                  <span className="text-sm font-medium">
                    {item.name || 'Project'}
                  </span>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {analysis.missing_information.length > 0 && (
          <Section
            icon={<AlertTriangleIcon className="size-4 text-amber-500" aria-hidden="true" />}
            title="Missing Information"
          >
            <div className="flex flex-wrap gap-1.5">
              {analysis.missing_information.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </Section>
        )}
      </CardContent>
    </Card>
  );
}

