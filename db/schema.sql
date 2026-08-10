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
    -- `for share` is load-bearing: without it this read does not serialise
    -- against a concurrent `update invoices set status = 'issued'`, so an item
    -- change could commit against an invoice that has just been issued.
    select status into parent_status from invoices where id = old.invoice_id for share;
    if parent_status = 'issued' then
      raise exception 'invoice % is issued; its line items are immutable', old.invoice_id;
    end if;
  end if;
  if tg_op in ('INSERT','UPDATE') then
    select status into parent_status from invoices where id = new.invoice_id for share;
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
-- @@
-- A permanent journal of every number ever issued, separate from the invoices
-- table. § 14 Abs. 4 Nr. 4 UStG requires each number to be assigned EINMALIG —
-- once, ever. The invoices table alone cannot guarantee that: deleting a row
-- would free its number for reuse. This table is append-only, so a number stays
-- burned regardless of what happens to the invoice.
--
-- UStAE 14.5 Abs. 10 says the opposite about gaps: "Eine lückenlose Abfolge der
-- ausgestellten Rechnungsnummern ist nicht zwingend." So gaps are legal and are
-- never backfilled. Because unexplained gaps have prompted Schätzungen, a
-- number burned WITHOUT an invoice carries a reason.
--
-- invoice_id is deliberately NOT a foreign key. `on delete cascade` would
-- destroy the permanent record, and `on delete set null` would UPDATE this row —
-- which the trigger below forbids, so it would instead block the invoice
-- deletion with a confusing error. A dangling id is the correct outcome here:
-- the journal outlives the invoice by design.
create table if not exists issued_numbers (
  number     text primary key,
  prefix     text,
  year       integer,
  seq        integer,
  invoice_id uuid,
  reason     text not null default '',
  created_at timestamptz not null default now(),
  -- Only numbers in a managed range carry a parsed prefix/year/seq. A
  -- hand-typed number that does not match the format is still recorded (and
  -- still unique, via the primary key) with all three left null.
  unique (prefix, year, seq)
)
-- @@
create or replace function forbid_issued_number_changes() returns trigger as $$
begin
  raise exception
    'invoice number % is a permanent record and cannot be changed or deleted',
    old.number;
end;
$$ language plpgsql
-- @@
drop trigger if exists issued_numbers_immutable on issued_numbers
-- @@
create trigger issued_numbers_immutable
  before update or delete on issued_numbers
  for each row execute function forbid_issued_number_changes()
-- @@
-- A Storno/Gutschrift never reuses or edits the number it corrects: it gets its
-- own number from the GS- range and points at the original. Stored as a field,
-- not only as display text, so the link survives independently of the layout.
alter table invoices add column if not exists storno_for text not null default ''
-- @@
-- The referenced invoice's date, frozen at the moment the Storno is written.
-- Same principle as sender_snapshot: an issued document must print what it was
-- issued with, never a value re-derived later.
alter table invoices add column if not exists storno_for_date text not null default ''
-- @@
-- Intra-EU B2B services: the recipient owes the VAT in their own country, so the
-- invoice carries 0 % and a note saying so. Stored per invoice, because it is a
-- property of the transaction and must stay frozen on an issued document — the
-- same reason sender_snapshot exists.
--
-- Deliberately NOT inferred from a 0 % rate. A domestic 0 % line means "not
-- taxable here"; reverse charge means "the recipient owes the tax". Conflating
-- them is the ambiguity this column exists to remove.
alter table invoices add column if not exists reverse_charge boolean not null default false
