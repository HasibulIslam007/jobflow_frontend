'use client';

import { LightbulbIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * AI Advice list — renders the recommendations array from a resume↔job
 * match (used inside the SkillMatch card flow and the resume page).
 */
export function RecommendationCard({
  recommendations,
  title = 'AI Advice',
  description = 'Concrete steps to improve your resume for this job.',
}: {
  recommendations: string[];
  title?: string;
  description?: string;
}) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="size-4 text-indigo-500" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
