create table if not exists public.form_email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text not null,
  body_json jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  is_archived boolean not null default false,
  constraint form_email_templates_name_not_blank check (length(btrim(name)) > 0),
  constraint form_email_templates_subject_not_blank check (length(btrim(subject)) > 0),
  constraint form_email_templates_body_not_blank check (length(btrim(body_html)) > 0)
);

create table if not exists public.form_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  template_id uuid references public.form_email_templates(id) on delete set null,
  name text not null,
  subject text not null,
  body_html text not null,
  body_json jsonb,
  status text not null default 'draft',
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint form_email_campaigns_name_not_blank check (length(btrim(name)) > 0),
  constraint form_email_campaigns_subject_not_blank check (length(btrim(subject)) > 0),
  constraint form_email_campaigns_body_not_blank check (length(btrim(body_html)) > 0),
  constraint form_email_campaigns_status_check check (
    status in ('draft', 'scheduled', 'sending', 'sent', 'partial', 'failed', 'cancelled')
  ),
  constraint form_email_campaigns_schedule_check check (
    (status = 'scheduled' and scheduled_at is not null)
    or status <> 'scheduled'
  )
);

create table if not exists public.form_email_campaign_exclusions (
  campaign_id uuid not null references public.form_email_campaigns(id) on delete cascade,
  submission_id uuid not null references public.form_submissions(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  primary key (campaign_id, submission_id)
);

create table if not exists public.form_email_campaign_attachments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.form_email_campaigns(id) on delete cascade,
  template_id uuid references public.form_email_templates(id) on delete cascade,
  bucket text not null default 'form_email_attachments',
  path text not null,
  filename text not null,
  content_type text not null,
  size_bytes integer not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  constraint form_email_campaign_attachments_owner_check check (
    (campaign_id is not null and template_id is null)
    or (campaign_id is null and template_id is not null)
  ),
  constraint form_email_campaign_attachments_size_check check (
    size_bytes > 0 and size_bytes <= 10485760
  ),
  constraint form_email_campaign_attachments_path_not_blank check (length(btrim(path)) > 0),
  constraint form_email_campaign_attachments_filename_not_blank check (length(btrim(filename)) > 0)
);

create table if not exists public.form_email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.form_email_campaigns(id) on delete cascade,
  submission_id uuid references public.form_submissions(id) on delete set null,
  email text not null,
  status text not null,
  provider_message_id text,
  error_message text,
  attempted_at timestamp with time zone not null default now(),
  sent_at timestamp with time zone,
  constraint form_email_delivery_events_status_check check (
    status in ('queued', 'sent', 'failed', 'skipped')
  ),
  constraint form_email_delivery_events_email_not_blank check (length(btrim(email)) > 0)
);

create index if not exists form_email_templates_created_by_idx
  on public.form_email_templates using btree (created_by);

create index if not exists form_email_campaigns_form_created_at_idx
  on public.form_email_campaigns using btree (form_id, created_at desc);

create index if not exists form_email_campaigns_status_scheduled_at_idx
  on public.form_email_campaigns using btree (status, scheduled_at);

create index if not exists form_email_campaign_exclusions_submission_idx
  on public.form_email_campaign_exclusions using btree (submission_id);

create index if not exists form_email_campaign_attachments_campaign_idx
  on public.form_email_campaign_attachments using btree (campaign_id);

create index if not exists form_email_campaign_attachments_template_idx
  on public.form_email_campaign_attachments using btree (template_id);

create index if not exists form_email_delivery_events_campaign_attempted_idx
  on public.form_email_delivery_events using btree (campaign_id, attempted_at desc);

create index if not exists form_email_delivery_events_campaign_submission_attempted_idx
  on public.form_email_delivery_events using btree (campaign_id, submission_id, attempted_at desc);

create index if not exists form_email_delivery_events_submission_attempted_idx
  on public.form_email_delivery_events using btree (submission_id, attempted_at desc);

create or replace trigger trg_form_email_templates_updated_at
  before update on public.form_email_templates
  for each row execute function public.set_updated_at();

create or replace trigger trg_form_email_campaigns_updated_at
  before update on public.form_email_campaigns
  for each row execute function public.set_updated_at();

alter table public.form_email_templates enable row level security;
alter table public.form_email_campaigns enable row level security;
alter table public.form_email_campaign_exclusions enable row level security;
alter table public.form_email_campaign_attachments enable row level security;
alter table public.form_email_delivery_events enable row level security;

create policy "Authenticated read form email templates"
  on public.form_email_templates
  for select
  to authenticated
  using (true);

create policy "Authenticated manage form email templates"
  on public.form_email_templates
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and (profiles.perm_forms = true or profiles.is_super_admin = true)
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and (profiles.perm_forms = true or profiles.is_super_admin = true)
    )
  );

create policy "Authenticated read form email campaigns"
  on public.form_email_campaigns
  for select
  to authenticated
  using (true);

create policy "Authenticated manage form email campaigns"
  on public.form_email_campaigns
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.forms
      join public.profiles on profiles.id = auth.uid()
      where forms.id = form_email_campaigns.form_id
        and (profiles.is_super_admin = true or forms.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.forms
      join public.profiles on profiles.id = auth.uid()
      where forms.id = form_email_campaigns.form_id
        and (profiles.is_super_admin = true or forms.user_id = auth.uid())
    )
  );

create policy "Authenticated read form email campaign exclusions"
  on public.form_email_campaign_exclusions
  for select
  to authenticated
  using (true);

create policy "Authenticated manage form email campaign exclusions"
  on public.form_email_campaign_exclusions
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.form_email_campaigns campaigns
      join public.forms on forms.id = campaigns.form_id
      join public.profiles on profiles.id = auth.uid()
      where campaigns.id = form_email_campaign_exclusions.campaign_id
        and (profiles.is_super_admin = true or forms.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.form_email_campaigns campaigns
      join public.forms on forms.id = campaigns.form_id
      join public.profiles on profiles.id = auth.uid()
      where campaigns.id = form_email_campaign_exclusions.campaign_id
        and (profiles.is_super_admin = true or forms.user_id = auth.uid())
    )
  );

create policy "Authenticated read form email campaign attachments"
  on public.form_email_campaign_attachments
  for select
  to authenticated
  using (true);

create policy "Authenticated manage form email campaign attachments"
  on public.form_email_campaign_attachments
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.form_email_campaigns campaigns
      join public.forms on forms.id = campaigns.form_id
      join public.profiles on profiles.id = auth.uid()
      where campaigns.id = form_email_campaign_attachments.campaign_id
        and (profiles.is_super_admin = true or forms.user_id = auth.uid())
    )
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.perm_forms = true or profiles.is_super_admin = true)
    )
  )
  with check (
    exists (
      select 1
      from public.form_email_campaigns campaigns
      join public.forms on forms.id = campaigns.form_id
      join public.profiles on profiles.id = auth.uid()
      where campaigns.id = form_email_campaign_attachments.campaign_id
        and (profiles.is_super_admin = true or forms.user_id = auth.uid())
    )
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.perm_forms = true or profiles.is_super_admin = true)
    )
  );

create policy "Authenticated read form email delivery events"
  on public.form_email_delivery_events
  for select
  to authenticated
  using (true);

create policy "Service role inserts form email delivery events"
  on public.form_email_delivery_events
  for insert
  to service_role
  with check (true);

grant all on table public.form_email_templates to anon;
grant all on table public.form_email_templates to authenticated;
grant all on table public.form_email_templates to service_role;
grant all on table public.form_email_campaigns to anon;
grant all on table public.form_email_campaigns to authenticated;
grant all on table public.form_email_campaigns to service_role;
grant all on table public.form_email_campaign_exclusions to anon;
grant all on table public.form_email_campaign_exclusions to authenticated;
grant all on table public.form_email_campaign_exclusions to service_role;
grant all on table public.form_email_campaign_attachments to anon;
grant all on table public.form_email_campaign_attachments to authenticated;
grant all on table public.form_email_campaign_attachments to service_role;
grant all on table public.form_email_delivery_events to anon;
grant all on table public.form_email_delivery_events to authenticated;
grant all on table public.form_email_delivery_events to service_role;

create or replace function public.form_email_attachments_total_size_check(target_campaign_id uuid)
returns integer
language sql
stable
as $$
  select coalesce(sum(size_bytes), 0)::integer
  from public.form_email_campaign_attachments
  where campaign_id = target_campaign_id;
$$;
