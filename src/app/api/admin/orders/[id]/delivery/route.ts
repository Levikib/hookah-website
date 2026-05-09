import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { validateAdminCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await validateAdminCookie()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: order_id } = await params;
  const { note, status } = await req.json() as { note: string; status: string };

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("delivery_events")
    .insert({ order_id, note, status })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}
