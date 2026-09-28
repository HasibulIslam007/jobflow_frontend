'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2Icon,
  Loader2Icon,
  SparklesIcon,
  TargetIcon,
  XCircleIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  primaryResume,
  useMatchResume,
  useResumeMatch,
  useResumes,
} from '@/features/resume/hooks';
import type { ResumeMatch } from '@/features/resume/types';

/**
 * Resume Match card for /jobs/[id] — pick a completed resume, generate
 * the AI match and show score, strong matches, missing skills and advice.
 * The generated match is cached per (job, resume) by useMatchResume.
 */
export function SkillMatch({ jobId }: { jobId: number }) {
  const { data: resumes, isPending: isLoadingResumes } = useResumes();
  const matchMutation = useMatchResume(jobId);

  const completed = useMemo(
    () => (resumes ?? []).filter((resume) => resume.status === 'completed'),
    [resumes],
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const resumeId = selectedId ?? primaryResume(completed)?.id ?? null;

  const { data: cachedMatch } = useResumeMatch(jobId, resumeId ?? 0);

  const match: ResumeMatch | undefined =
    cachedMatch ??
    (matchMutation.data?.resume_id === resumeId
      ? matchMutation.data
      : undefined);

  const canGenerate = resumeId !== null && !matchMutation.isPending;

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/[0.04] shadow-sm dark:border-indigo-400/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TargetIcon className="size-4 text-indigo-500" aria-hidden="true" />
          Resume Match
        </CardTitle>
        <CardDescription>
          Compare your resume against this role with AI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoadingResumes ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            Loading your resumes…
          </div>
        ) : completed.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload and analyze a resume first — then match it against any
              job.
            </p>
            <Button size="sm" render={<Link href="/resume" />} nativeButton={false}>
              Go to My Resume
            </Button>
          </div>
        ) : (
          <>
            {completed.length > 1 && (
              <select
                value={resumeId ?? ''}
                onChange={(event) => setSelectedId(Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                aria-label="Resume to match"
              >
                {completed.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            )}
            {match ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-semibold tracking-tight text-indigo-500">
                    {match.match_score}%
                  </span>
                  <span className="text-xs text-muted-foreground">match</span>
                </div>

                {match.matched_skills.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Strong Matches:
                    </p>
                    <ul className="space-y-1">
                      {match.matched_skills.map((skill) => (
                        <li key={skill} className="flex items-center gap-1.5 text-sm">
                          <CheckCircle2Icon
                            className="size-3.5 text-emerald-500"
                            aria-hidden="true"
                          />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {match.missing_skills.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      Missing:
                    </p>
                    <ul className="space-y-1">
                      {match.missing_skills.map((skill) => (
                        <li key={skill} className="flex items-center gap-1.5 text-sm">
                          <XCircleIcon
                            className="size-3.5 text-amber-500"
                            aria-hidden="true"
                          />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {match.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      AI Advice:
                    </p>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {match.recommendations.map((recommendation) => (
                        <li key={recommendation}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canGenerate}
                    onClick={() => resumeId !== null && matchMutation.mutate(resumeId)}
                  >
                    {matchMutation.isPending ? (
                      <Loader2Icon className="animate-spin" aria-hidden="true" />
                    ) : (
                      <SparklesIcon aria-hidden="true" />
                    )}
                    Re-run match
                  </Button>
                  <Button size="sm" render={<Link href="/resume" />} nativeButton={false}>
                    Improve Resume
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Generate an AI fit score with matched skills, gaps and
                  tailored advice.
                </p>
                <Button
                  size="sm"
                  disabled={!canGenerate}
                  onClick={() => resumeId !== null && matchMutation.mutate(resumeId)}
                >
                  {matchMutation.isPending ? (
                    <Loader2Icon className="animate-spin" aria-hidden="true" />
                  ) : (
                    <SparklesIcon aria-hidden="true" />
                  )}
                  Analyze match
                </Button>
              </div>
            )}
          </>
        )}

        {matchMutation.isError && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {matchMutation.error instanceof Error && matchMutation.error.message
              ? matchMutation.error.message
              : 'Could not generate the match.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

