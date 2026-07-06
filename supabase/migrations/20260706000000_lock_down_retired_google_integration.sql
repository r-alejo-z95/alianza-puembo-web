begin;

drop policy if exists "Enable read access for all users"
  on public.google_integration;

revoke all privileges on table public.google_integration
  from public, anon, authenticated;

delete from public.google_integration;

commit;
