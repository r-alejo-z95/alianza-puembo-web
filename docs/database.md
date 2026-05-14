# Database Workflow

The remote Supabase project is the source of truth as of May 14, 2026. The old local migration files were not an accurate representation of production, so they were moved to `supabase/migrations-legacy-untracked/` for reference only.

## Source of Truth

- Project: `Alianza Puembo`
- Project ref: `gxziassnnbwnbzfrzcnx`
- Versioned migrations live in `supabase/migrations/`.
- Do not make manual schema changes in Supabase Studio without creating a migration in this repo.
- If an emergency manual change is made, immediately capture it with a migration before doing app work that depends on it.

## Baseline

The first tracked migration should be a schema-only dump from the current remote database:

```bash
npx supabase db dump --linked --schema public --file supabase/migrations/20260514000000_remote_schema_baseline.sql
```

This baseline was generated from the remote database on May 14, 2026 and the remote migration history was repaired so `20260514000000` is marked as applied. `supabase migration list --linked` should show local and remote aligned on this version.

Supabase CLI may require Docker Desktop for `db dump`. If Docker is unavailable, install `libpq` and execute the script emitted by `supabase db dump --dry-run` with `/opt/homebrew/opt/libpq/bin` in `PATH`.

## Local Development

Start Supabase locally:

```bash
npm run db:start
```

Reset the local database from tracked migrations:

```bash
npm run db:reset
```

Create a new migration after changing the local database:

```bash
npx supabase db diff --schema public --file descriptive_change_name
```

Review the generated SQL before committing it.

## Applying Remote Changes

Apply pending migrations to the linked remote project:

```bash
npm run db:push
```

Before pushing, confirm that:

- the migration is committed or staged for review;
- the SQL is idempotent where appropriate;
- RLS policies, grants, triggers, functions, indexes, and realtime publication changes are included;
- app code that depends on the schema change is deployed in a compatible order.

## Type Generation

Regenerate TypeScript database types after schema changes:

```bash
npm run db:types
```

The generated file is `lib/database.types.ts`. Treat it as generated output from the remote schema.

## Agent Rules

When DB-related code is changed, agents should inspect:

- `docs/database.md`
- `supabase/migrations/`
- `lib/database.types.ts`
- relevant Supabase data access files under `lib/data/`, `lib/actions/`, and `lib/supabase/`

Agents should not assume columns, policies, or relationships. If the schema is unclear, regenerate types or inspect the remote/local database before editing DB-touching code.
