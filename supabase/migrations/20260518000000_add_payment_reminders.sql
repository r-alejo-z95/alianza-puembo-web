alter table public.forms
  add column if not exists payment_reminder_interval_days integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'forms_payment_reminder_interval_days_check'
  ) then
    alter table public.forms
      add constraint forms_payment_reminder_interval_days_check
      check (
        payment_reminder_interval_days is null
        or payment_reminder_interval_days in (3, 7, 14, 30)
      );
  end if;
end $$;

comment on column public.forms.payment_reminder_interval_days is
  'Optional per-form payment reminder cadence in days. Null disables reminders.';

alter table public.form_submissions
  add column if not exists payment_reminder_last_sent_at timestamp with time zone;

comment on column public.form_submissions.payment_reminder_last_sent_at is
  'Last successful payment reminder email timestamp for this submission.';
