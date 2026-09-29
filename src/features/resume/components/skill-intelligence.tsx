'use client';

import { CheckCircle2Icon, TargetIcon, TriangleAlertIcon } from 'lucide-react';

import { AiCard } from '@/components/ui/ai-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Resume, ResumeMatch } from '@/features/resume/types';

type Side = {
  label: string;
  hint: string;
  icon: typeof CheckCircle2Icon;
  tone: string;
  skills: string[];
  empty: string;
};

/** Case-insensitive dedupe that preserves the AI's own ordering. */
function uniqueSkills(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const list of lists) {
    for (const raw of list) {
      const skill = raw.trim();
      const key = skill.toLowerCase();

      if (!key || seen.has(key)) continue;

      seen.add(key);
      out.push(skill);
    }
  }

  return out;
}

function SkillList({ side }: { side: Side }) {
  const Icon = side.icon;

  if (side.skills.length === 0) {
    return (
      <div className="space-y-2">
        <p className={`text-caption font-medium ${side.tone}`}>{side.label}</p>
        <p className="text-caption text-muted-foreground italic">{side.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className={`text-caption font-medium ${side.tone}`}>{side.label}</p>
      <ul className="space-y-1.5">
        {side.skills.map((skill) => (
          <li key={skill} className="flex items-start gap-2">
            <Icon
              aria-hidden="true"
              className={`mt-0.5 size-3.5 shrink-0 ${side.tone}`}
            />
            <span className="text-body text-foreground">{skill}</span>
          </li>
        ))}
      </ul>
      <p className="text-micro text-muted-foreground">{side.hint}</p>
    </div>
  );
}

/**
 * Skill intelligence: what the resume proves, versus what it is missing.
 *
 * A deliberate correction over the previous panel, which split
 * `analysis.skills` down the middle and labelled the halves "strong" and
 * "improving". The schema carries no per-skill strength, so that split was
 * fabrication — the same list, cut in half, presented as a judgement.
 *
 * Both lists here are quoted verbatim from the AI: every "strong" skill is
 * one the extractor actually found, and every gap is one the analysis (or a
 * job match) actually flagged. Nothing is inferred, ranked or invented.
 */
export function SkillIntelligence({
  resume,
  match,
}: {
  resume: Resume;
  match?: ResumeMatch | null;
}) {
  const analysis = resume.analysis;
  const jobGaps = match?.missing_skills ?? [];
  const gaps = uniqueSkills(analysis?.missing_information ?? [], jobGaps);

  const sides: Side[] = [
    {
      label: 'Strong Skills',
      hint: 'Found in your resume by the extractor.',
      icon: CheckCircle2Icon,
      tone: 'text-success',
      skills: uniqueSkills(analysis?.skills ?? []),
      empty: 'No skills were extracted from this resume.',
    },
    {
      label: 'Improvement Skills',
      hint:
        jobGaps.length > 0
          ? 'Flagged by the analysis, or required by a matched job.'
          : 'Gaps the analysis flagged — not skills it ranked as weak.',
      icon: TriangleAlertIcon,
      tone: 'text-warning',
      skills: gaps,
      empty: 'No gaps flagged. Nothing stood out as missing.',
    },
  ];

  return (
    <AiCard
      title="Skill Intelligence"
      description="What your resume proves — and what it is missing"
      icon={<TargetIcon className="size-4" />}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {sides.map((side) => (
          <div
            key={side.label}
            className="rounded-lg border border-ai/15 bg-card/40 px-3 py-3"
          >
            <SkillList side={side} />
          </div>
        ))}
      </div>
    </AiCard>
  );
}

export function SkillIntelligenceSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-ai/20 bg-ai/[0.03] p-4"
    >
      <Skeleton className="h-4 w-36" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
    </div>
  );
}
