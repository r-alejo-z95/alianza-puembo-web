create table if not exists public.payment_groups (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  expected_amount numeric(12,2),
  created_by_submission_id uuid references public.form_submissions(id) on delete set null,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payment_groups_expected_amount_check'
  ) then
    alter table public.payment_groups
      add constraint payment_groups_expected_amount_check
      check (expected_amount is null or expected_amount >= 0);
  end if;
end $$;

alter table public.form_submissions
  add column if not exists payment_group_id uuid references public.payment_groups(id) on delete set null;

alter table public.form_submission_payments
  add column if not exists payment_group_id uuid references public.payment_groups(id) on delete set null;

create index if not exists payment_groups_form_id_idx
  on public.payment_groups using btree (form_id);

create index if not exists form_submissions_payment_group_id_idx
  on public.form_submissions using btree (payment_group_id);

create index if not exists form_submission_payments_payment_group_id_idx
  on public.form_submission_payments using btree (payment_group_id);

alter table public.payment_groups enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_groups'
      and policyname = 'Authenticated read payment groups'
  ) then
    create policy "Authenticated read payment groups"
      on public.payment_groups
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_groups'
      and policyname = 'Authenticated insert payment groups'
  ) then
    create policy "Authenticated insert payment groups"
      on public.payment_groups
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_groups'
      and policyname = 'Authenticated update payment groups'
  ) then
    create policy "Authenticated update payment groups"
      on public.payment_groups
      for update
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

grant all on table public.payment_groups to anon;
grant all on table public.payment_groups to authenticated;
grant all on table public.payment_groups to service_role;
