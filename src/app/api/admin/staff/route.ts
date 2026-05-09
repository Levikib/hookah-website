import { NextRequest, NextResponse } from "next/server";
import { validateAdminCookie } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

interface StaffRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  active: boolean;
  avatar_emoji: string;
  created_at: string;
}

interface AssignedBookingRow {
  id: string;
  session_name: string;
  booking_date: string;
  time_slot: string;
  status: string;
}

export async function GET(req: NextRequest) {
  if (!(await validateAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("id");
  const wantsBookings = searchParams.get("bookings") === "1";

  if (staffId && wantsBookings) {
    // Return assigned bookings for a staff member
    const { data, error } = await supabase
      .from("staff_bookings")
      .select("bookings(id, session_name, booking_date, time_slot, status)")
      .eq("staff_id", staffId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type StaffBookingJoinRow = {
      bookings: AssignedBookingRow | null;
    };

    const bookings = ((data ?? []) as unknown as StaffBookingJoinRow[])
      .map((row) => row.bookings)
      .filter((b): b is AssignedBookingRow => b !== null);

    return NextResponse.json({ bookings });
  }

  // Return all staff with booking counts
  const { data: staffData, error: staffError } = await supabase
    .from("staff")
    .select("id, name, phone, email, area, active, avatar_emoji, created_at")
    .order("created_at", { ascending: false });

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 });
  }

  // Get booking counts per staff
  const { data: countData } = await supabase
    .from("staff_bookings")
    .select("staff_id");

  type CountRow = { staff_id: string };
  const countMap: Record<string, number> = {};
  ((countData ?? []) as CountRow[]).forEach((row) => {
    countMap[row.staff_id] = (countMap[row.staff_id] ?? 0) + 1;
  });

  const staff = ((staffData ?? []) as StaffRow[]).map((s) => ({
    ...s,
    booking_count: countMap[s.id] ?? 0,
  }));

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  if (!(await validateAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    name?: string;
    phone?: string;
    email?: string;
    area?: string;
    avatar_emoji?: string;
  };

  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("staff")
    .insert({
      name: body.name,
      phone: body.phone ?? "",
      email: body.email ?? "",
      area: body.area ?? "",
      avatar_emoji: body.avatar_emoji ?? "🧑",
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ staff: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await validateAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { id?: string; active?: boolean };
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("staff")
    .update({ active: body.active })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ staff: data });
}
