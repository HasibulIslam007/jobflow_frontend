# Features

Vertical slices live here, one folder per product surface. A feature owns its
components, hooks and types so the codebase never turns into a pile of
cross-referencing folders.

```
src/features/
└── <feature-name>/
    ├── components/     # feature-only UI (built from src/components/ui primitives)
    ├── hooks/          # feature-only hooks (query/mutation hooks)
    └── types.ts        # feature-only types (API types stay in src/types)
```

Planned features (built in later phases — do not scaffold them ahead of time):

| Feature | Phase | Scope |
|---|---|---|
| `jobs` | 2 | job list, board, detail, edit form |
| `capture` | 3 | paste/PDF/image/URL capture + extraction review |
| `reminders` | 2–4 | reminder list, calendar, snooze |
| `dashboard` | 2–4 | pipeline overview, deadline focus |
| `career` | 5 | CV upload, match results, cover letters |

Rules:

1. Cross-feature UI belongs in `src/components` — a feature never imports from another feature.
2. Shared data access belongs in `src/services` + `src/hooks`; features consume them.
3. A feature folder is created when its first screen is built, never as an empty placeholder.
