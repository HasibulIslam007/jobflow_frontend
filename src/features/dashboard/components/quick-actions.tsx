import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Entry point to the AI capture workspace (/jobs/create).
 * Phase 5.4 wires every input method: paste, PDF, screenshot, URL.
 */
export function QuickActions() {
  return (
    <Card className="border-ai/20 bg-ai/[0.03]">
      <CardHeader>
        <CardTitle>Add a job</CardTitle>
        <CardDescription>
          Capture from any source — AI extracts the details.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button size="sm" variant="ai" render={<Link href="/jobs/create" />} nativeButton={false}>
          Capture with AI
          <ArrowRightIcon />
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/jobs" />} nativeButton={false}>
          Browse jobs
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/resume" />} nativeButton={false}>
          My resume
        </Button>
      </CardContent>
    </Card>
  );
}
