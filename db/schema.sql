create table if not exists master_data (
  id                    smallint primary key default 1 check (id = 1),
  name                  text not null default '',
  status_label          text not null default '',
  activity              text not null default '',
  street                text not null default '',
  zip_city              text not null default '',
  country               text not null default '',
  phone                 text not null default '',
  email                 text not null default '',
  website               text not null default '',
  tax_number            text not null default '',
  vat_id                text not null default '',
  tax_office            text not null default '',
  default_vat_rate      numeric(4,1) not null default 19,
  payment_terms_days    integer not null default 14,
  account_holder        text not null default '',
  iban                  text not null default '',
  bank_name             text not null default '',
  bic                   text not null default '',
  business_id           text not null default '',
  personal_tax_id       text not null default '',
  social_security_no    text not null default '',
  birth_date            text not null default '',
  activity_start        text not null default '',
  vat_scheme            text not null default '',
  taxation_type         text not null default '',
  profit_determination  text not null default '',
  updated_at            timestamptz not null default now()
)
-- @@
insert into master_data (id) values (1) on conflict (id) do nothing
-- @@
create table if not exists invoices (
  id                uuid primary key default gen_random_uuid(),
  status            text not null default 'draft' check (status in ('draft','issued')),
  invoice_number    text unique,
  proposed_number   text not null default '',
  invoice_date      date not null,
  service_date      text not null default '',
  customer_number   text not null default '',
  customer_name     text not null default '',
  customer_street   text not null default '',
  customer_zip_city text not null default '',
  customer_country  text not null default '',
  customer_vat_id   text not null default '',
  payment_terms     text not null default '',
  net_total         numeric(12,2) not null default 0,
  vat_total         numeric(12,2) not null default 0,
  gross_total       numeric(12,2) not null default 0,
  vat_breakdown     jsonb not null default '[]',
  sender_snapshot   jsonb,
  issued_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
)
-- @@
create table if not exists invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  line_no     integer not null,
  description text not null default '',
  quantity    numeric(12,3) not null default 1,
  unit        text not null default '',
  unit_price  numeric(12,2) not null default 0,
  vat_rate    numeric(4,1) not null default 19,
  net_amount  numeric(12,2) not null default 0,
  unique (invoice_id, line_no)
)
-- @@
create table if not exists login_attempts (
  id           bigserial primary key,
  ip           text not null,
  success      boolean not null default false,
  attempted_at timestamptz not null default now()
)
-- @@
create index if not exists login_attempts_ip_time_idx
  on login_attempts (ip, attempted_at desc)
-- @@
create or replace function forbid_issued_invoice_changes() returns trigger as $$
begin
  if old.status = 'issued' then
    raise exception 'invoice % is issued and immutable', old.id;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$ language plpgsql
-- @@
drop trigger if exists invoices_immutable_when_issued on invoices
-- @@
-- Note: row-level triggers do not fire for TRUNCATE. That is not reachable
-- through the application's SQL, but a manual TRUNCATE would bypass both
-- guards.
create trigger invoices_immutable_when_issued
  before update or delete on invoices
  for each row execute function forbid_issued_invoice_changes()
-- @@
-- The invoices trigger alone is not enough: without this, an issued invoice's
-- line items could still be edited, deleted or added to, leaving a row that
-- says 'issued' above contents that changed.
create or replace function forbid_issued_invoice_item_changes() returns trigger as $$
declare
  parent_status text;
begin
  if tg_op in ('UPDATE','DELETE') then
    select status into parent_status from invoices where id = old.invoice_id;
    if parent_status = 'issued' then
      raise exception 'invoice % is issued; its line items are immutable', old.invoice_id;
    end if;
  end if;
  if tg_op in ('INSERT','UPDATE') then
    select status into parent_status from invoices where id = new.invoice_id;
    if parent_status = 'issued' then
      raise exception 'invoice % is issued; its line items are immutable', new.invoice_id;
    end if;
  end if;
  -- A missing parent means the invoice is being deleted in this same
  -- transaction (a draft's cascade), which is legitimate and falls through.
  return case when tg_op = 'DELETE' then old else new end;
end;
$$ language plpgsql
-- @@
drop trigger if exists invoice_items_immutable_when_issued on invoice_items
-- @@
create trigger invoice_items_immutable_when_issued
  before insert or update or delete on invoice_items
  for each row execute function forbid_issued_invoice_item_changes()
-- @@
-- An issued invoice must be complete, or the trigger above would freeze a row
-- that is missing its own number, timestamp or sender snapshot — unfixable
-- afterwards without DDL.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'invoices_issued_complete') then
    alter table invoices add constraint invoices_issued_complete check (
      status = 'draft'
      or (invoice_number is not null and issued_at is not null and sender_snapshot is not null)
    );
  end if;
end $$
