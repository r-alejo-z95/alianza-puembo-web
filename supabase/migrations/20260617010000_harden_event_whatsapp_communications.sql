create index if not exists communication_audience_subscriptions_source_event_id_idx
  on public.communication_audience_subscriptions using btree (source_event_id);

create index if not exists communication_audiences_created_by_idx
  on public.communication_audiences using btree (created_by);

create index if not exists communication_audiences_updated_by_idx
  on public.communication_audiences using btree (updated_by);

create index if not exists event_communication_audiences_audience_id_idx
  on public.event_communication_audiences using btree (audience_id);

create index if not exists event_communication_audiences_created_by_idx
  on public.event_communication_audiences using btree (created_by);

create index if not exists event_communication_settings_created_by_idx
  on public.event_communication_settings using btree (created_by);

create index if not exists event_communication_settings_updated_by_idx
  on public.event_communication_settings using btree (updated_by);

create index if not exists event_reminder_interests_contact_id_idx
  on public.event_reminder_interests using btree (contact_id);

create index if not exists event_whatsapp_delivery_events_contact_id_idx
  on public.event_whatsapp_delivery_events using btree (contact_id);

create index if not exists event_whatsapp_delivery_events_event_id_idx
  on public.event_whatsapp_delivery_events using btree (event_id);

create index if not exists event_whatsapp_messages_approved_by_idx
  on public.event_whatsapp_messages using btree (approved_by);

create index if not exists event_whatsapp_messages_created_by_idx
  on public.event_whatsapp_messages using btree (created_by);

create index if not exists event_whatsapp_messages_event_id_idx
  on public.event_whatsapp_messages using btree (event_id);

create index if not exists event_whatsapp_messages_updated_by_idx
  on public.event_whatsapp_messages using btree (updated_by);

revoke all on table public.communication_audiences from anon;
revoke all on table public.communication_audiences from authenticated;
revoke all on table public.communication_contacts from anon;
revoke all on table public.communication_contacts from authenticated;
revoke all on table public.communication_audience_subscriptions from anon;
revoke all on table public.communication_audience_subscriptions from authenticated;
revoke all on table public.event_communication_settings from anon;
revoke all on table public.event_communication_settings from authenticated;
revoke all on table public.event_communication_audiences from anon;
revoke all on table public.event_communication_audiences from authenticated;
revoke all on table public.event_reminder_interests from anon;
revoke all on table public.event_reminder_interests from authenticated;
revoke all on table public.event_whatsapp_messages from anon;
revoke all on table public.event_whatsapp_messages from authenticated;
revoke all on table public.event_whatsapp_delivery_events from anon;
revoke all on table public.event_whatsapp_delivery_events from authenticated;

grant all on table public.communication_audiences to service_role;
grant all on table public.communication_contacts to service_role;
grant all on table public.communication_audience_subscriptions to service_role;
grant all on table public.event_communication_settings to service_role;
grant all on table public.event_communication_audiences to service_role;
grant all on table public.event_reminder_interests to service_role;
grant all on table public.event_whatsapp_messages to service_role;
grant all on table public.event_whatsapp_delivery_events to service_role;
