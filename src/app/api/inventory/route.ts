/**
 * GET /api/inventory
 *
 * Returns current stock levels for all flavours from the Supabase inventory table.
 * Public endpoint — no authentication required.
 * Cached for 60 seconds via Next.js route segment config.
 *
 * Response shape:
 *   {
 *     inventory: Array<{
 *       flavourId: string,
 *       stock50g: number,
 *       stock100g: number,
 *       stock250g: number,
 *       updatedAt: string
 *     }>
 *   }
 */

export const runtime = "nodejs";

// Cache this GET route for 60 seconds
export const revalidate = 60;

import { NextResponse } from "next/server";
import { createServiceClient, type Database } from "@/lib/supabase";

type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];

export async function GET(): Promise<NextResponse> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("inventory")
    .select("flavour_id, stock_50g, stock_100g, stock_250g, updated_at")
    .order("flavour_id");

  if (error) {
    console.error("[inventory] Supabase query failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }

  const inventory = ((data ?? []) as InventoryRow[]).map((row) => ({
    flavourId: row.flavour_id,
    stock50g: row.stock_50g,
    stock100g: row.stock_100g,
    stock250g: row.stock_250g,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json(
    { inventory },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
