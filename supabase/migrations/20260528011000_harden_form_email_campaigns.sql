create or replace function public.form_email_attachments_total_size_check(target_campaign_id uuid)
returns integer
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(size_bytes), 0)::integer
  from public.form_email_campaign_attachments
  where campaign_id = target_campaign_id;
$$;

drop policy if exists "Authenticated read form email templates"
  on public.form_email_templates;
drop policy if exists "Authenticated read form email campaigns"
  on public.form_email_campaigns;
drop policy if exists "Authenticated read form email campaign exclusions"
  on public.form_email_campaign_exclusions;
drop policy if exists "Authenticated read form email campaign attachments"
  on public.form_email_campaign_attachments;
drop policy if exists "Authenticated read form email delivery events"
  on public.form_email_delivery_events;

create index if not exists form_email_templates_created_by_idx
  on public.form_email_templates using btree (created_by);

create index if not exists form_email_campaigns_template_id_idx
  on public.form_email_campaigns using btree (template_id);

create index if not exists form_email_campaigns_created_by_idx
  on public.form_email_campaigns using btree (created_by);

create index if not exists form_email_campaigns_updated_by_idx
  on public.form_email_campaigns using btree (updated_by);

create index if not exists form_email_campaign_exclusions_created_by_idx
  on public.form_email_campaign_exclusions using btree (created_by);

create index if not exists form_email_campaign_attachments_created_by_idx
  on public.form_email_campaign_attachments using btree (created_by);

revoke all on table public.form_email_templates from anon;
revoke all on table public.form_email_templates from authenticated;
revoke all on table public.form_email_campaigns from anon;
revoke all on table public.form_email_campaigns from authenticated;
revoke all on table public.form_email_campaign_exclusions from anon;
revoke all on table public.form_email_campaign_exclusions from authenticated;
revoke all on table public.form_email_campaign_attachments from anon;
revoke all on table public.form_email_campaign_attachments from authenticated;
revoke all on table public.form_email_delivery_events from anon;
revoke all on table public.form_email_delivery_events from authenticated;

grant all on table public.form_email_templates to service_role;
grant all on table public.form_email_campaigns to service_role;
grant all on table public.form_email_campaign_exclusions to service_role;
grant all on table public.form_email_campaign_attachments to service_role;
grant all on table public.form_email_delivery_events to service_role;
