import { NextRequest, NextResponse } from "next/server";
import { validateAdminCookie } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  if (!(await validateAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("id, flavour_id, stock_50g, stock_100g, stock_250g, updated_at")
    .order("flavour_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inventory: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  if (!(await validateAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    flavour_id?: string;
    stock_50g?: number;
    stock_100g?: number;
    stock_250g?: number;
  };

  if (!body.flavour_id) {
    return NextResponse.json({ error: "flavour_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Upsert the inventory row
  const { data, error } = await supabase
    .from("inventory")
    .upsert(
      {
        flavour_id: body.flavour_id,
        stock_50g: body.stock_50g ?? 0,
        stock_100g: body.stock_100g ?? 0,
        stock_250g: body.stock_250g ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "flavour_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inventory: data });
}
