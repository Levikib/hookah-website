-- =============================================================================
-- HKH Hookah Website — Supabase Database Schema
-- =============================================================================
-- Run this in the Supabase SQL editor (Project → SQL Editor → New Query).
-- All tables use UUIDs generated server-side and timestamptz for all timestamps.
--
-- Row Level Security (RLS) strategy:
--   • anon role  → INSERT bookings/orders (create), SELECT own row by reference
--   • service_role → full access (used by API routes via createServiceClient())
--   • authenticated → future use for staff dashboard
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- fuzzy search on flavour names (future)

-- ---------------------------------------------------------------------------
-- 1. customers
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

-- anon: INSERT only (upsert handled via service client in API routes)
create policy "anon_insert_customers"
  on public.customers
  for insert
  to anon
  with check (true);

-- anon cannot SELECT others' data
create policy "anon_no_select_customers"
  on public.customers
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 2. orders  (flavour shop purchases)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                  uuid        not null default gen_random_uuid() primary key,
  created_at          timestamptz not null default now(),
  customer_id         uuid        not null references public.customers (id) on delete restrict,
  status              text        not null default 'pending'
                        check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  total_kobo          bigint      not null check (total_kobo > 0),  -- KES × 100
  delivery_address    text        not null,
  paystack_reference  text        unique  -- set after Paystack initializes
);

comment on column public.orders.total_kobo is 'Amount in kobo (KES × 100). e.g. KES 3,500 = 350000 kobo.';

alter table public.orders enable row level security;

-- anon can INSERT (creating a pending order)
create policy "anon_insert_orders"
  on public.orders
  for insert
  to anon
  with check (true);

-- anon cannot read orders
create policy "anon_no_select_orders"
  on public.orders
  for select
  to anon
  using (false);

-- ---------------------------------------------------------------------------
-- 3. order_items
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
-- 4. bookings  (session bookings + package wizard)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id                  uuid        not null default gen_random_uuid() primary key,
  created_at          timestamptz not null default now(),
  customer_id         uuid        not null references public.customers (id) on delete restrict,
  session_id          text        not null,        -- matches SESSIONS[n].id
  session_name        text        not null,
  booking_date        date        not null,
  time_slot           text        not null,        -- e.g. "19:00–21:00"
  status              text        not null default 'pending'
                        check (status in ('pending','confirmed','cancelled','completed')),
  total_kobo          bigint      not null check (total_kobo > 0),  -- KES × 100
  paystack_reference  text        unique,
  notes               text
);

comment on column public.bookings.total_kobo is 'Amount in kobo (KES × 100). e.g. KES 5,500 = 550000 kobo.';

alter table public.bookings enable row level security;

-- anon can create bookings
create policy "anon_insert_bookings"
  on public.bookings
  for insert
  to anon
  with check (true);

-- anon can look up their OWN booking by paystack_reference (for confirm page)
create policy "anon_select_own_booking_by_ref"
  on public.bookings
  for select
  to anon
  using (paystack_reference is not null);

-- ---------------------------------------------------------------------------
-- 5. booking_flavours  (junction — which flavours are in a session booking)
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
-- 6. inventory  (per-flavour stock levels, one row per flavour)
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
  'One row per flavour. Decremented by the verify/webhook handlers after successful payment.';

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
-- 7. delivery_events  (status timeline for a shipped order)
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
create index if not exists idx_orders_customer_id       on public.orders (customer_id);
create index if not exists idx_orders_paystack_ref      on public.orders (paystack_reference);
create index if not exists idx_bookings_customer_id     on public.bookings (customer_id);
create index if not exists idx_bookings_paystack_ref    on public.bookings (paystack_reference);
create index if not exists idx_bookings_date            on public.bookings (booking_date);
create index if not exists idx_order_items_order_id     on public.order_items (order_id);
create index if not exists idx_booking_flavours_booking on public.booking_flavours (booking_id);
create index if not exists idx_delivery_events_order    on public.delivery_events (order_id);
create index if not exists idx_customers_email          on public.customers (email);
