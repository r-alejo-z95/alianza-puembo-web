# Alianza Puembo Web Agent Notes

Los specs y planes de superpowers son locales, no se versionan en git

## Database Workflow

- The remote Supabase project is the source of truth as of May 14, 2026.
- Database schema changes must be made from this repo through tracked migrations in `supabase/migrations/`.
- Do not change tables, columns, indexes, constraints, enums, functions, triggers, RLS policies, grants, or realtime publication settings manually in Supabase Studio unless it is an emergency.
- If an emergency manual DB change happens, immediately capture it in a migration and regenerate types.
- The current baseline migration is `supabase/migrations/20260514000000_remote_schema_baseline.sql`.
- Old unreliable local migrations are kept only for reference in `supabase/migrations-legacy-untracked/`.
- Regenerate database types with `npm run db:types` after schema changes.
- Read `docs/database.md` before editing DB schema or DB-touching code.
