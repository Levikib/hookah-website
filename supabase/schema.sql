-- =============================================================================
-- Smokers Vine — Supabase Database Schema
-- =============================================================================
-- Run this in the Supabase SQL editor (Project → SQL Editor → New Query).
-- All tables use UUIDs generated server-side and timestamptz for all timestamps.
--
-- Row Level Security (RLS) strategy:
--   • anon role     → INSERT leads/orders/bookings (create), no SELECT
--   • service_role  → full access (used by API routes via createServiceClient())
--   • authenticated → future use for staff dashboard
--
-- NOTE: checkout is a WhatsApp handoff (no in-site payment gateway). The
-- `leads` table is the single funnel-capture table every public form writes
-- to before opening a wa.me link — it's the source of truth for the admin
-- dashboard's lead/marketing data. `bookings` and `orders` remain for
-- structured event/order records once the client confirms via WhatsApp.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- fuzzy search on flavour names (future)

-- ---------------------------------------------------------------------------
-- 1. leads  (central funnel-capture table — every public form writes here)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id               uuid        not null default gen_random_uuid() primary key,
  created_at       timestamptz not null default now(),
  name             text        not null,
  phone            text        not null,
  email            text,
  type             text        not null check (type in ('booking','order','enquiry')),
  payload          jsonb       not null default '{}'::jsonb,
  status           text        not null default 'new'
                     check (status in ('new','contacted','confirmed','completed','cancelled')),
  whatsapp_sent_at timestamptz
);

comment on table public.leads is
  'Every booking/order/enquiry form submits here before the WhatsApp handoff. Primary source for the admin lead/marketing dashboard.';

alter table public.leads enable row level security;

create policy "anon_insert_leads"
  on public.leads
  for insert
  to anon
  with check (true);

create policy "anon_no_select_leads"
  on public.leads
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 2. customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id         uuid        not null default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  email      text        not null,
  name       text        not null,
  phone      text
);

comment on table public.customers is 'One row per unique customer. Email is the de-duplication key.';

alter table public.customers enable row level security;

create policy "anon_insert_customers"
  on public.customers
  for insert
  to anon
  with check (true);

create policy "anon_no_select_customers"
  on public.customers
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 3. orders  (flavour/pot shop orders — linked back to the originating lead)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id               uuid        not null default gen_random_uuid() primary key,
  created_at       timestamptz not null default now(),
  customer_id      uuid        not null references public.customers (id) on delete restrict,
  status           text        not null default 'new'
                     check (status in ('new','contacted','confirmed','processing','shipped','delivered','cancelled')),
  total_kobo       bigint      not null check (total_kobo > 0),  -- KES × 100
  delivery_address text        not null,
  lead_id          uuid        references public.leads (id) on delete set null
);

comment on column public.orders.total_kobo is 'Amount in kobo (KES × 100). e.g. KES 3,500 = 350000 kobo.';

alter table public.orders enable row level security;

create policy "anon_insert_orders"
  on public.orders
  for insert
  to anon
  with check (true);

create policy "anon_no_select_orders"
  on public.orders
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 4. order_items
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id              uuid        not null default gen_random_uuid() primary key,
  created_at      timestamptz not null default now(),
  order_id        uuid        not null references public.orders (id) on delete cascade,
  flavour_id      text        not null,  -- matches FLAVOURS[n].id from src/data/flavours.ts
  size            text        not null check (size in ('50g','100g','250g')),
  quantity        int         not null check (quantity > 0),
  unit_price_kobo bigint      not null check (unit_price_kobo > 0)  -- KES × 100
);

alter table public.order_items enable row level security;

create policy "anon_insert_order_items"
  on public.order_items
  for insert
  to anon
  with check (true);

create policy "anon_no_select_order_items"
  on public.order_items
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 5. bookings  (event/service bookings — linked back to the originating lead)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id               uuid        not null default gen_random_uuid() primary key,
  created_at       timestamptz not null default now(),
  customer_id      uuid        not null references public.customers (id) on delete restrict,
  service_id       text        not null,        -- matches SERVICES[n].id
  service_name     text        not null,
  booking_date     date        not null,
  time_slot        text        not null,        -- e.g. "6:00 PM"
  status           text        not null default 'new'
                     check (status in ('new','contacted','confirmed','cancelled','completed')),
  total_kobo       bigint      not null check (total_kobo > 0),  -- KES × 100, estimate only
  lead_id          uuid        references public.leads (id) on delete set null,
  notes            text
);

comment on column public.bookings.total_kobo is 'Estimated amount in kobo (KES × 100) — final price confirmed via WhatsApp.';

alter table public.bookings enable row level security;

create policy "anon_insert_bookings"
  on public.bookings
  for insert
  to anon
  with check (true);

create policy "anon_no_select_bookings"
  on public.bookings
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 6. booking_flavours  (junction — which flavours are attached to a booking)
-- ---------------------------------------------------------------------------
create table if not exists public.booking_flavours (
  id         uuid        not null default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  booking_id uuid        not null references public.bookings (id) on delete cascade,
  flavour_id text        not null,
  quantity   int         not null default 1 check (quantity > 0)
);

alter table public.booking_flavours enable row level security;

create policy "anon_insert_booking_flavours"
  on public.booking_flavours
  for insert
  to anon
  with check (true);

create policy "anon_no_select_booking_flavours"
  on public.booking_flavours
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 7. inventory  (per-flavour stock levels, one row per flavour)
-- ---------------------------------------------------------------------------
create table if not exists public.inventory (
  id          uuid        not null default gen_random_uuid() primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  flavour_id  text        not null unique,  -- matches FLAVOURS[n].id
  stock_50g   int         not null default 0 check (stock_50g >= 0),
  stock_100g  int         not null default 0 check (stock_100g >= 0),
  stock_250g  int         not null default 0 check (stock_250g >= 0)
);

comment on table public.inventory is
  'One row per flavour. Updated manually by admin staff (no automated payment webhook anymore).';

-- Trigger to auto-update updated_at on every row update
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger inventory_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

alter table public.inventory enable row level security;

-- Public read — used by /api/inventory GET (stock levels are public info)
create policy "public_read_inventory"
  on public.inventory
  for select
  to anon
  using (true);

-- anon cannot write inventory (only service_role can)
create policy "anon_no_write_inventory"
  on public.inventory
  for insert
  to anon
  with check (false);

-- ---------------------------------------------------------------------------
-- 8. delivery_events  (status timeline for a dispatched order)
-- ---------------------------------------------------------------------------
create table if not exists public.delivery_events (
  id          uuid        not null default gen_random_uuid() primary key,
  created_at  timestamptz not null default now(),
  order_id    uuid        not null references public.orders (id) on delete cascade,
  status      text        not null,   -- e.g. "picked_up", "in_transit", "delivered"
  description text        not null,
  location    text                    -- e.g. "Westlands, Nairobi"
);

alter table public.delivery_events enable row level security;

create policy "anon_no_access_delivery_events"
  on public.delivery_events
  for all
  to anon
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- Useful indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_leads_status              on public.leads (status);
create index if not exists idx_leads_type                on public.leads (type);
create index if not exists idx_orders_customer_id         on public.orders (customer_id);
create index if not exists idx_orders_lead_id             on public.orders (lead_id);
create index if not exists idx_bookings_customer_id       on public.bookings (customer_id);
create index if not exists idx_bookings_lead_id           on public.bookings (lead_id);
create index if not exists idx_bookings_date              on public.bookings (booking_date);
create index if not exists idx_order_items_order_id       on public.order_items (order_id);
create index if not exists idx_booking_flavours_booking   on public.booking_flavours (booking_id);
create index if not exists idx_delivery_events_order      on public.delivery_events (order_id);
create index if not exists idx_customers_email            on public.customers (email);
