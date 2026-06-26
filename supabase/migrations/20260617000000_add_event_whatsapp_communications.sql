alter table public.profiles
  add column if not exists perm_comunicaciones boolean not null default false;

create table if not exists public.communication_audiences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  public_name text not null,
  description text,
  is_archived boolean not null default false,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.communication_contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_e164 text not null,
  phone_display text,
  status text not null default 'active',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communication_contacts_phone_e164_key unique (phone_e164),
  constraint communication_contacts_status_check
    check (status in ('active', 'unsubscribed', 'blocked'))
);

create table if not exists public.communication_audience_subscriptions (
  id uuid primary key default gen_random_uuid(),
  audience_id uuid not null references public.communication_audiences(id) on delete cascade,
  contact_id uuid not null references public.communication_contacts(id) on delete cascade,
  status text not null default 'subscribed',
  consented_at timestamptz,
  unsubscribed_at timestamptz,
  consent_source text,
  source_event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communication_audience_subscriptions_audience_id_contact_id_key
    unique (audience_id, contact_id),
  constraint communication_audience_subscriptions_status_check
    check (status in ('subscribed', 'unsubscribed', 'blocked'))
);

create table if not exists public.event_communication_settings (
  event_id uuid primary key references public.events(id) on delete cascade,
  whatsapp_reminders_enabled boolean not null default false,
  attendee_count_enabled boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_communication_audiences (
  event_id uuid not null references public.events(id) on delete cascade,
  audience_id uuid not null references public.communication_audiences(id) on delete cascade,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (event_id, audience_id)
);

create table if not exists public.event_reminder_interests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  contact_id uuid not null references public.communication_contacts(id) on delete cascade,
  attendee_count integer,
  event_consent_at timestamptz not null default now(),
  audience_opt_in boolean not null default false,
  source text not null default 'event_page',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_reminder_interests_event_id_contact_id_key
    unique (event_id, contact_id),
  constraint event_reminder_interests_status_check
    check (status in ('active', 'cancelled', 'unsubscribed', 'blocked')),
  constraint event_reminder_interests_attendee_count_check
    check (attendee_count is null or attendee_count between 1 and 50)
);

create table if not exists public.event_whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  message_type text not null,
  status text not null default 'draft',
  body text not null default '',
  scheduled_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  provider_template_name text,
  provider_template_language text,
  provider_payload jsonb,
  ai_generated boolean not null default false,
  ai_prompt_snapshot jsonb,
  ai_warnings jsonb,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_whatsapp_messages_type_check
    check (message_type in ('confirmation', 'three_days_before', 'one_day_before', 'same_day', 'custom')),
  constraint event_whatsapp_messages_status_check
    check (status in ('draft', 'generated_by_ai', 'edited', 'approved', 'scheduled', 'sending', 'sent', 'partial', 'failed', 'cancelled'))
);

create table if not exists public.event_whatsapp_delivery_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.event_whatsapp_messages(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  contact_id uuid references public.communication_contacts(id) on delete set null,
  phone_e164 text not null,
  status text not null,
  provider text,
  provider_message_id text,
  error_message text,
  attempted_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint event_whatsapp_delivery_events_status_check
    check (status in ('queued', 'sent', 'failed', 'skipped'))
);

create index if not exists communication_audiences_is_archived_name_idx
  on public.communication_audiences using btree (is_archived, name);

create index if not exists communication_audience_subscriptions_contact_id_idx
  on public.communication_audience_subscriptions using btree (contact_id);

create index if not exists event_reminder_interests_event_id_status_idx
  on public.event_reminder_interests using btree (event_id, status);

create index if not exists event_whatsapp_messages_status_scheduled_at_idx
  on public.event_whatsapp_messages using btree (status, scheduled_at);

create index if not exists event_whatsapp_delivery_events_message_id_attempted_at_idx
  on public.event_whatsapp_delivery_events using btree (message_id, attempted_at desc);

alter table public.communication_audiences enable row level security;
alter table public.communication_contacts enable row level security;
alter table public.communication_audience_subscriptions enable row level security;
alter table public.event_communication_settings enable row level security;
alter table public.event_communication_audiences enable row level security;
alter table public.event_reminder_interests enable row level security;
alter table public.event_whatsapp_messages enable row level security;
alter table public.event_whatsapp_delivery_events enable row level security;

create policy "Communications admins manage audiences"
  on public.communication_audiences
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

create policy "Communications admins manage contacts"
  on public.communication_contacts
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

create policy "Communications admins manage subscriptions"
  on public.communication_audience_subscriptions
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

create policy "Communications admins manage event settings"
  on public.event_communication_settings
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

create policy "Communications admins manage event audiences"
  on public.event_communication_audiences
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

create policy "Communications admins read event reminder interests"
  on public.event_reminder_interests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

create policy "Communications admins manage event WhatsApp messages"
  on public.event_whatsapp_messages
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

create policy "Communications admins read delivery events"
  on public.event_whatsapp_delivery_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and (profiles.is_super_admin = true or profiles.perm_comunicaciones = true)
    )
  );

grant all on table public.communication_audiences to authenticated;
grant all on table public.communication_contacts to authenticated;
grant all on table public.communication_audience_subscriptions to authenticated;
grant all on table public.event_communication_settings to authenticated;
grant all on table public.event_communication_audiences to authenticated;
grant select on table public.event_reminder_interests to authenticated;
grant all on table public.event_whatsapp_messages to authenticated;
grant select on table public.event_whatsapp_delivery_events to authenticated;

grant all on table public.communication_audiences to service_role;
grant all on table public.communication_contacts to service_role;
grant all on table public.communication_audience_subscriptions to service_role;
grant all on table public.event_communication_settings to service_role;
grant all on table public.event_communication_audiences to service_role;
grant all on table public.event_reminder_interests to service_role;
grant all on table public.event_whatsapp_messages to service_role;
grant all on table public.event_whatsapp_delivery_events to service_role;

revoke all on table public.communication_audiences from anon;
revoke all on table public.communication_contacts from anon;
revoke all on table public.communication_audience_subscriptions from anon;
revoke all on table public.event_communication_settings from anon;
revoke all on table public.event_communication_audiences from anon;
revoke all on table public.event_reminder_interests from anon;
revoke all on table public.event_whatsapp_messages from anon;
revoke all on table public.event_whatsapp_delivery_events from anon;
