import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { validateAdminCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await validateAdminCookie()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: booking_id } = await params;
  const { staff_id } = await req.json() as { staff_id: string };

  const sb = createServiceClient();
  const { error } = await sb.from("staff_bookings").insert({ staff_id, booking_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await validateAdminCookie()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: booking_id } = await params;
  const { staff_id } = await req.json() as { staff_id: string };

  const sb = createServiceClient();
  const { error } = await sb.from("staff_bookings").delete().eq("staff_id", staff_id).eq("booking_id", booking_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
