import { NextRequest, NextResponse } from "next/server";
import { validateAdminCookie } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await validateAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as { status?: string };
  const { status } = body;

  if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
