create table if not exists public.form_response_admins (
  form_id uuid not null references public.forms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  primary key (form_id, profile_id)
);

create index if not exists form_response_admins_profile_id_idx
  on public.form_response_admins using btree (profile_id);

alter table public.form_response_admins enable row level security;

create policy "Delegated admins can read own form response access"
  on public.form_response_admins
  for select
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_super_admin = true
    )
  );

create policy "Super admins can manage form response access"
  on public.form_response_admins
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_super_admin = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_super_admin = true
    )
  );

grant all on table public.form_response_admins to anon;
grant all on table public.form_response_admins to authenticated;
grant all on table public.form_response_admins to service_role;
