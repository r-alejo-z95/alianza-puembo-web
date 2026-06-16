alter table public.forms
  add column if not exists pricing_mode text not null default 'fixed',
  add column if not exists pricing_packages jsonb not null default '[]'::jsonb,
  add column if not exists pricing_field_id uuid references public.form_fields(id) on delete set null,
  add column if not exists collect_participant_details boolean not null default false,
  add column if not exists participant_template jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'forms_pricing_mode_check'
  ) then
    alter table public.forms
      add constraint forms_pricing_mode_check
      check (pricing_mode in ('fixed', 'packages'));
  end if;
end $$;

alter table public.form_submissions
  add column if not exists expected_amount numeric(12,2),
  add column if not exists pricing_snapshot jsonb,
  add column if not exists participant_details jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'form_submissions_expected_amount_check'
  ) then
    alter table public.form_submissions
      add constraint form_submissions_expected_amount_check
      check (expected_amount is null or expected_amount >= 0);
  end if;
end $$;

alter table public.payment_groups
  add column if not exists calculated_expected_amount numeric(12,2),
  add column if not exists expected_amount_source text not null default 'manual';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payment_groups_calculated_expected_amount_check'
  ) then
    alter table public.payment_groups
      add constraint payment_groups_calculated_expected_amount_check
      check (calculated_expected_amount is null or calculated_expected_amount >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_groups_expected_amount_source_check'
  ) then
    alter table public.payment_groups
      add constraint payment_groups_expected_amount_source_check
      check (expected_amount_source in ('calculated', 'manual'));
  end if;
end $$;

create index if not exists forms_pricing_mode_idx
  on public.forms using btree (pricing_mode);

create index if not exists forms_pricing_field_id_idx
  on public.forms using btree (pricing_field_id);

create index if not exists form_submissions_expected_amount_idx
  on public.form_submissions using btree (expected_amount);

comment on column public.forms.pricing_mode is 'Financial pricing mode: fixed or packages';
comment on column public.forms.pricing_packages is 'Ordered pricing package configuration for package-priced financial forms';
comment on column public.forms.pricing_field_id is 'Automatic form field that stores the selected pricing package';
comment on column public.forms.collect_participant_details is 'Whether package participant_count drives repeated participant fields';
comment on column public.forms.participant_template is 'Template fields repeated for each package participant';
comment on column public.form_submissions.expected_amount is 'Immutable expected amount snapshot for this submission';
comment on column public.form_submissions.pricing_snapshot is 'Immutable pricing package snapshot captured at submission time';
comment on column public.form_submissions.participant_details is 'Structured repeated participant answers captured at submission time';
comment on column public.payment_groups.calculated_expected_amount is 'Calculated expected total from linked active submissions';
comment on column public.payment_groups.expected_amount_source is 'Whether expected_amount is calculated by the system or manually overridden by finance';
