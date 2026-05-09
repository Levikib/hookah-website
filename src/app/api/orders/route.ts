/**
 * POST /api/orders
 *
 * Creates a flavour shop order (order + order_items) in Supabase,
 * sends an order confirmation email, and initializes a Paystack payment.
 *
 * Body:
 *   email           — customer email
 *   name            — customer name
 *   phone           — customer phone (optional)
 *   items           — array of { flavourId, size, price (KES), qty }
 *   deliveryAddress — string
 *
 * Returns:
 *   { orderId, paymentUrl, reference }
 *
 * Delivery fee (KES 2,000) is added server-side.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DELIVERY_FEE_KES = 2_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItemInput {
  flavourId: string;
  size: "50g" | "100g" | "250g";
  /** Unit price in KES (whole number) */
  price: number;
  qty: number;
}

interface RequestBody {
  email: string;
  name: string;
  phone?: string;
  items: OrderItemInput[];
  deliveryAddress: string;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidSize(s: unknown): s is "50g" | "100g" | "250g" {
  return s === "50g" || s === "100g" || s === "250g";
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, name, phone, items, deliveryAddress } = body;

  // --- Validate ---
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 422 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 422 });
  }
  if (!deliveryAddress || typeof deliveryAddress !== "string") {
    return NextResponse.json({ error: "deliveryAddress is required" }, { status: 422 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items must be a non-empty array" }, { status: 422 });
  }

  for (const [i, item] of items.entries()) {
    if (!item.flavourId || typeof item.flavourId !== "string") {
      return NextResponse.json({ error: `items[${i}].flavourId is required` }, { status: 422 });
    }
    if (!isValidSize(item.size)) {
      return NextResponse.json(
        { error: `items[${i}].size must be one of 50g, 100g, 250g` },
        { status: 422 }
      );
    }
    if (typeof item.price !== "number" || item.price <= 0) {
      return NextResponse.json(
        { error: `items[${i}].price must be a positive number (KES)` },
        { status: 422 }
      );
    }
    if (typeof item.qty !== "number" || item.qty < 1) {
      return NextResponse.json(
        { error: `items[${i}].qty must be at least 1` },
        { status: 422 }
      );
    }
  }

  // --- Compute totals ---
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalKes = itemsTotal + DELIVERY_FEE_KES;
  const totalKobo = Math.round(totalKes * 100);

  // --- Generate reference ---
  const reference = `hkh_ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const supabase = createServiceClient();

  // --- Upsert customer ---
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .upsert(
      { email, name, phone: phone ?? null },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (customerError || !customerData) {
    console.error("[orders] customer upsert failed:", customerError);
    return NextResponse.json(
      { error: "Failed to create customer record" },
      { status: 500 }
    );
  }

  // --- Create order ---
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerData.id,
      status: "pending",
      total_kobo: totalKobo,
      delivery_address: deliveryAddress,
      paystack_reference: reference,
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    console.error("[orders] order insert failed:", orderError);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }

  // --- Insert order items ---
  const orderItemRows = items.map((item) => ({
    order_id: orderRow.id,
    flavour_id: item.flavourId,
    size: item.size,
    quantity: item.qty,
    unit_price_kobo: Math.round(item.price * 100),
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemRows);

  if (itemsError) {
    console.error("[orders] order_items insert failed:", itemsError);
    // Cascade delete won't help here since order exists — mark cancelled
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderRow.id);
    return NextResponse.json(
      { error: "Failed to save order items" },
      { status: 500 }
    );
  }

  // --- Send order confirmation email (non-fatal) ---
  sendOrderConfirmation({
    to: email,
    name,
    orderRef: reference,
    items: items.map((item) => ({
      name: item.flavourId, // front-end can pass readable name in flavourId if desired
      size: item.size,
      quantity: item.qty,
      unitPrice: item.price,
    })),
    total: totalKes,
  }).catch((err: unknown) => {
    console.error("[orders] email send failed:", err);
  });

  // --- Initialize Paystack payment ---
  let paystackResult: { authorization_url: string; reference: string };
  try {
    paystackResult = await initializePayment({
      email,
      amount_kobo: totalKobo,
      reference,
      metadata: {
        orderId: orderRow.id,
        itemCount: items.length,
        deliveryAddress,
      },
    });
  } catch (err) {
    console.error("[orders] Paystack init failed:", err);
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderRow.id);
    return NextResponse.json(
      { error: "Payment gateway unavailable. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    orderId: orderRow.id,
    paymentUrl: paystackResult.authorization_url,
    reference: paystackResult.reference,
    totalKes,
  });
}
