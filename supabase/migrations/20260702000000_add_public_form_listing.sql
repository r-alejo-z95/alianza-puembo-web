alter table public.forms
  add column if not exists is_publicly_listed boolean not null default false;
