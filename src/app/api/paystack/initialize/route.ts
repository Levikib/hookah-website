/**
 * POST /api/paystack/initialize
 *
 * Creates a pending booking record in Supabase and returns a Paystack
 * checkout URL. The front-end should redirect the user to authorization_url.
 *
 * Body:
 *   email       — customer email
 *   amount      — total in KES (whole number, NOT kobo) — we multiply × 100 here
 *   bookingData — shape: BookingPayload (see below)
 *
 * Returns:
 *   { authorization_url, reference }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingPayload {
  name: string;
  phone?: string;
  sessionId: string;
  sessionName: string;
  bookingDate: string; // ISO date string e.g. "2026-05-15"
  timeSlot: string;    // e.g. "19:00–21:00"
  flavours?: Array<{ flavourId: string; quantity: number }>;
  notes?: string;
}

interface RequestBody {
  email: string;
  /** Total in KES whole numbers — we convert to kobo internally */
  amount: number;
  bookingData: BookingPayload;
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

  const { email, amount, bookingData } = body;

  // --- Validate required fields ---
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 422 });
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number (KES)" }, { status: 422 });
  }
  if (!bookingData?.sessionId || !bookingData?.bookingDate || !bookingData?.timeSlot) {
    return NextResponse.json(
      { error: "bookingData must include sessionId, bookingDate, and timeSlot" },
      { status: 422 }
    );
  }

  // --- Generate unique reference ---
  const reference = `hkh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // --- Convert KES → kobo ---
  const amount_kobo = Math.round(amount * 100);

  const supabase = createServiceClient();

  // --- Upsert customer ---
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        email,
        name: bookingData.name ?? email.split("@")[0],
        phone: bookingData.phone ?? null,
      },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (customerError || !customerData) {
    console.error("[paystack/initialize] customer upsert failed:", customerError);
    return NextResponse.json(
      { error: "Failed to create customer record" },
      { status: 500 }
    );
  }

  // --- Create pending booking ---
  const { data: bookingRow, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      customer_id: customerData.id,
      session_id: bookingData.sessionId,
      session_name: bookingData.sessionName,
      booking_date: bookingData.bookingDate,
      time_slot: bookingData.timeSlot,
      status: "pending",
      total_kobo: amount_kobo,
      paystack_reference: reference,
      notes: bookingData.notes ?? null,
    })
    .select("id")
    .single();

  if (bookingError || !bookingRow) {
    console.error("[paystack/initialize] booking insert failed:", bookingError);
    return NextResponse.json(
      { error: "Failed to create booking record" },
      { status: 500 }
    );
  }

  // --- Insert booking flavours (if any) ---
  if (bookingData.flavours && bookingData.flavours.length > 0) {
    const flavourRows = bookingData.flavours.map((f) => ({
      booking_id: bookingRow.id,
      flavour_id: f.flavourId,
      quantity: f.quantity,
    }));

    const { error: flavourError } = await supabase
      .from("booking_flavours")
      .insert(flavourRows);

    if (flavourError) {
      // Non-fatal — log and continue; booking can still proceed
      console.error("[paystack/initialize] booking_flavours insert failed:", flavourError);
    }
  }

  // --- Initialize Paystack payment ---
  let paystackResult: { authorization_url: string; reference: string };
  try {
    paystackResult = await initializePayment({
      email,
      amount_kobo,
      reference,
      metadata: {
        bookingId: bookingRow.id,
        sessionName: bookingData.sessionName,
        bookingDate: bookingData.bookingDate,
      },
    });
  } catch (err) {
    console.error("[paystack/initialize] Paystack call failed:", err);

    // Roll back the booking to prevent orphaned pending records
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingRow.id);

    return NextResponse.json(
      { error: "Payment gateway unavailable. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    authorization_url: paystackResult.authorization_url,
    reference: paystackResult.reference,
    bookingId: bookingRow.id,
  });
}
