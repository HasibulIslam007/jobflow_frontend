import { ApiStatus } from "@/components/system/api-status";

/**
 * Phase 0 placeholder: this page reports foundation status only.
 * Product surfaces (marketing, auth, dashboard) arrive in later phases —
 * nothing here is a feature, and nothing here uses mock data.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Phase 0 · project foundation
        </p>
        <h1 className="font-heading text-3xl font-medium tracking-tight">JobFlow AI</h1>
        <p className="text-muted-foreground">
          Next.js 16 client wired to the Laravel 13 API. No product features are
          enabled yet — this page exists to verify the toolchain.
        </p>
      </header>

      <ApiStatus />

      <section className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Next up (Phase 1)</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Authentication (Sanctum session cookies) and the app shell</li>
          <li>Generated API types from the OpenAPI document</li>
          <li>Route protection and onboarding</li>
        </ul>
      </section>
    </main>
  );
}

