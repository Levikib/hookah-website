-- Migration: staff, staff_availability, staff_bookings
-- Safe to run multiple times (all DDL uses IF NOT EXISTS / IF NOT EXISTS guards).

-- ── staff table ───────────────────────────────────────────────────────────────
create table if not exists public.staff (
  id           uuid        not null default gen_random_uuid() primary key,
  created_at   timestamptz not null default now(),
  name         text        not null,
  phone        text,
  email        text        unique,
  area         text,                    -- coverage area e.g. "Westlands, Kilimani"
  active       boolean     not null default true,
  avatar_emoji text        not null default '👤'
);

-- ── staff_availability (which days/slots they work) ───────────────────────────
create table if not exists public.staff_availability (
  id         uuid        not null default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  staff_id   uuid        not null references public.staff(id) on delete cascade,
  day_of_week int        not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time  time       not null,
  end_time    time       not null
);

-- ── staff_bookings (assignment junction) ──────────────────────────────────────
create table if not exists public.staff_bookings (
  id         uuid        not null default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  staff_id   uuid        not null references public.staff(id) on delete restrict,
  booking_id uuid        not null references public.bookings(id) on delete cascade,
  notes      text,
  unique(staff_id, booking_id)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.staff enable row level security;
alter table public.staff_availability enable row level security;
alter table public.staff_bookings enable row level security;

-- anon: read active staff only (for booking UI if needed)
create policy "anon_read_active_staff" on public.staff for select to anon using (active = true);
create policy "anon_no_write_staff" on public.staff for insert to anon with check (false);
create policy "anon_read_staff_availability" on public.staff_availability for select to anon using (true);
create policy "anon_no_write_staff_availability" on public.staff_availability for insert to anon with check (false);
create policy "anon_no_access_staff_bookings" on public.staff_bookings for all to anon using (false) with check (false);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_staff_bookings_booking on public.staff_bookings(booking_id);
create index if not exists idx_staff_bookings_staff on public.staff_bookings(staff_id);
create index if not exists idx_staff_availability_staff on public.staff_availability(staff_id);
