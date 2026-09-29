# JobFlow AI — Web Client

Next.js 16 (App Router) frontend for JobFlow AI. Companion repository: **`jobflow-api`**
(the Laravel 13 API and the single source of truth for the product blueprint in
`docs/`).

## Stack (verified versions)

| Layer | Package |
|---|---|
| Framework | `next@16.3.6` (App Router, Turbopack) |
| UI runtime | `react@19.2.8` |
| Language | TypeScript 5 (`tsc --noEmit` in CI) |
| Styling | Tailwind CSS v4 + `shadcn` CLI 4 components (base-nova, neutral, CSS variables) |
| Server state | `@tanstack/react-query` v5 |
| Client state | `zustand` v5 |
| HTTP | `axios` (single instance in `src/services/http.ts`) |
| Icons / toasts / theme | `lucide-react`, `sonner`, `next-themes` |

## Getting started

```bash
npm install
cp .env.example .env.local     # already created for local development
npm run dev                    # http://localhost:3000
```

The API must be running for the connectivity check on the home page:
in the `jobflow-api` repository run `./scripts/db.sh start` then `php artisan serve`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run types:api` | Phase 1: generate API types from the OpenAPI document |

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Laravel API base URL (`http://localhost:8000` locally, `https://api.jobflow.ai` in production). Required in production builds. |
| `NEXT_PUBLIC_APP_URL` | Public URL of this app |
| `NEXT_PUBLIC_REVERB_KEY` | Reverb public key; empty disables websockets (polling fallback keeps working) |
| `NEXT_PUBLIC_FEATURES` | Comma-separated feature allow-list — unfinished surfaces stay hidden, never faked |

Only `NEXT_PUBLIC_*` values reach the browser. Secrets (AI keys, R2 credentials,
database URLs) live in the API repository and are never exposed here.

## Structure

```
src/
├── app/          # routes (App Router). Phase 0: a single status page
├── components/
│   ├── ui/       # shadcn primitives (generated — do not hand-edit)
│   └── system/   # infrastructure UI (API connectivity check)
├── features/     # vertical slices, one folder per product surface (see features/README.md)
├── hooks/        # shared data hooks (TanStack Query)
├── lib/          # env access, helpers
├── providers/    # React providers (Query)
├── services/     # API access layer (axios instance + one module per resource)
├── stores/       # Zustand stores (UI state only — never server data)
├── types/        # API + domain types (replaced by generated types in Phase 1)
└── utils/        # pure helpers (formatters etc.)
```

## Conventions

1. **Server state** lives in TanStack Query; **UI state** lives in Zustand; **list/filter state** lives in the URL.
2. **No hardcoded data.** Every screen reads from a real endpoint — mocks belong to tests only.
3. **One HTTP client.** All API access goes through `src/services/*`; components never call `axios` directly.
4. **Errors** are `ApiError` instances with a machine-readable `code`; components branch on `code`, never on message text.
5. **Auth-ready:** Sanctum personal access tokens are stored in browser `localStorage` and attached as `Authorization: Bearer <token>` by the shared Axios client.
6. **Correlation:** every request sends `X-Request-Id`, echoed by the API for support/observability.

## CI

`.github/workflows/web.yml` runs lint → typecheck → build on every push/PR to
`main` and `development`. Phase 1 adds the OpenAPI type-generation step so a
contract-breaking API change fails this build.
