/**
 * Client-safe environment access, validated once at module load.
 *
 * Only NEXT_PUBLIC_* values belong here: everything in this object ends up in
 * the browser bundle. Secrets (AI keys, R2 credentials, database URLs) live in
 * the API repository's .env and are never exposed to the client.
 */

const DEFAULT_DEV_API_URL = "http://localhost:8000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;

  if (configured && configured.trim() !== "") {
    return trimTrailingSlash(configured);
  }

  // Fail fast in production builds instead of silently calling the wrong host.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required in production (e.g. https://api.jobflow.ai).",
    );
  }

  return DEFAULT_DEV_API_URL;
}

function parseFeatures(raw: string | undefined): readonly string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

export const env = {
  /** Base URL of the Laravel API (without /api/v1). */
  apiUrl: resolveApiUrl(),
  /** Public URL of this application. */
  appUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  /** Laravel Reverb public key; empty string disables realtime (polling fallback). */
  reverbKey: process.env.NEXT_PUBLIC_REVERB_KEY ?? "",
  /** Explicit feature allow-list — an unfinished surface is hidden, never faked. */
  enabledFeatures: parseFeatures(process.env.NEXT_PUBLIC_FEATURES),
} as const;

export function isFeatureEnabled(feature: string): boolean {
  return env.enabledFeatures.includes(feature);
}
