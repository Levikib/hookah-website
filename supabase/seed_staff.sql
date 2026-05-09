-- Seed staff table with 3 sample Nairobi-based staff members.
-- Idempotent: uses ON CONFLICT (email) to avoid duplicate rows.
-- Also seeds staff_availability for Mon–Sun (all 7 days, 10:00–22:00).

-- ── Staff rows ────────────────────────────────────────────────────────────────

INSERT INTO public.staff (name, phone, email, area, active, avatar_emoji)
VALUES
  ('Amara Osei',   '+254 712 345 678', 'amara.osei@hkh.ke',   'Westlands, Kilimani, Lavington', true, '👩🏾'),
  ('Jabari Mwangi','+254 723 456 789', 'jabari.mwangi@hkh.ke','Nairobi CBD, Pangani, Parklands',  true, '👨🏿'),
  ('Zuri Kamau',   '+254 734 567 890', 'zuri.kamau@hkh.ke',   'Karen, Langata, Rongai',           true, '👩🏽')
ON CONFLICT (email)
DO UPDATE SET
  name         = EXCLUDED.name,
  phone        = EXCLUDED.phone,
  area         = EXCLUDED.area,
  active       = EXCLUDED.active,
  avatar_emoji = EXCLUDED.avatar_emoji;

-- ── Availability rows (Mon–Sun, 10:00–22:00) ─────────────────────────────────
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

-- Amara Osei
INSERT INTO public.staff_availability (staff_id, day_of_week, start_time, end_time)
SELECT s.id, d.dow, '10:00'::time, '22:00'::time
FROM public.staff s
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(dow)
WHERE s.email = 'amara.osei@hkh.ke'
ON CONFLICT DO NOTHING;

-- Jabari Mwangi
INSERT INTO public.staff_availability (staff_id, day_of_week, start_time, end_time)
SELECT s.id, d.dow, '10:00'::time, '22:00'::time
FROM public.staff s
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(dow)
WHERE s.email = 'jabari.mwangi@hkh.ke'
ON CONFLICT DO NOTHING;

-- Zuri Kamau
INSERT INTO public.staff_availability (staff_id, day_of_week, start_time, end_time)
SELECT s.id, d.dow, '10:00'::time, '22:00'::time
FROM public.staff s
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(dow)
WHERE s.email = 'zuri.kamau@hkh.ke'
ON CONFLICT DO NOTHING;
