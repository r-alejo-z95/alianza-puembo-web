alter table public.forms
  add column if not exists allow_shared_receipts boolean not null default false,
  add column if not exists shared_receipt_max_submissions integer not null default 1;

alter table public.forms
  add constraint forms_shared_receipt_max_submissions_check
  check (shared_receipt_max_submissions >= 1);
