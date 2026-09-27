"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealth } from "@/hooks/use-health";
import { env } from "@/lib/env";

/**
 * Foundation-phase connectivity check: proves browser → Axios → Laravel API
 * wiring end to end using the real /api/v1/health endpoint (no mock data).
 * Removed once the dashboard lands in Phase 2.
 */
export function ApiStatus() {
  const { data, isPending, isError, error } = useHealth();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API connection</CardTitle>
        <CardDescription className="font-mono text-xs">
          {env.apiUrl}/api/v1/health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isPending && <p className="text-muted-foreground">Checking…</p>}

        {isError && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="destructive">unreachable</Badge>
            <span className="text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </span>
          </div>
        )}

        {data && (
          <dl className="grid grid-cols-[8rem_1fr] items-center gap-y-2">
            <dt className="text-muted-foreground">status</dt>
            <dd>
              <Badge variant={data.status === "ok" ? "secondary" : "destructive"}>
                {data.status}
              </Badge>
            </dd>

            <dt className="text-muted-foreground">database</dt>
            <dd>
              <Badge variant={data.checks.database ? "secondary" : "destructive"}>
                {data.checks.database ? "up" : "down"}
              </Badge>
            </dd>

            <dt className="text-muted-foreground">cache</dt>
            <dd>
              <Badge variant={data.checks.cache ? "secondary" : "destructive"}>
                {data.checks.cache ? "up" : "down"}
              </Badge>
            </dd>

            <dt className="text-muted-foreground">environment</dt>
            <dd className="font-mono text-xs">{data.environment}</dd>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
