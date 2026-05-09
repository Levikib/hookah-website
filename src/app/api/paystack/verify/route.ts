/**
 * POST /api/paystack/verify
 *
 * Called by the front-end after Paystack redirects the user back to the site.
 * Idempotent — safe to call multiple times for the same reference.
 *
 * Body:
 *   { reference: string }
 *
 * Returns:
 *   { success: boolean, booking: { id, sessionName, bookingDate, timeSlot, status } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase";
import { sendBookingConfirmation } from "@/lib/email";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { reference?: unknown };
  try {
    body = (await request.json()) as { reference?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { reference } = body;

  if (!reference || typeof reference !== "string") {
    return NextResponse.json({ error: "reference is required" }, { status: 422 });
  }

  const supabase = createServiceClient();

  // --- Check if already confirmed (idempotency guard) ---
  const { data: existingBooking, error: lookupError } = await supabase
    .from("bookings")
    .select("id, status, session_name, booking_date, time_slot, total_kobo, customer_id")
    .eq("paystack_reference", reference)
    .single();

  if (lookupError || !existingBooking) {
    return NextResponse.json(
      { error: "Booking not found for this reference" },
      { status: 404 }
    );
  }

  if (existingBooking.status === "confirmed") {
    // Already processed — return success without re-running side effects
    return NextResponse.json({
      success: true,
      booking: {
        id: existingBooking.id,
        sessionName: existingBooking.session_name,
        bookingDate: existingBooking.booking_date,
        timeSlot: existingBooking.time_slot,
        status: existingBooking.status,
      },
    });
  }

  // --- Verify with Paystack ---
  let txData: Awaited<ReturnType<typeof verifyPayment>>;
  try {
    txData = await verifyPayment(reference);
  } catch (err) {
    console.error("[paystack/verify] Paystack verification failed:", err);
    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 502 }
    );
  }

  if (txData.status !== "success") {
    // Payment wasn't successful — don't confirm
    return NextResponse.json(
      {
        success: false,
        message: `Payment status is "${txData.status}". Not confirmed.`,
      },
      { status: 402 }
    );
  }

  // --- Confirm the booking ---
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", existingBooking.id);

  if (updateError) {
    console.error("[paystack/verify] Failed to confirm booking:", updateError);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }

  // --- Fetch customer for email ---
  const { data: customer } = await supabase
    .from("customers")
    .select("email, name")
    .eq("id", existingBooking.customer_id)
    .single();

  // --- Send confirmation email (non-fatal if it fails) ---
  if (customer) {
    const totalKes = Math.round(existingBooking.total_kobo / 100);
    sendBookingConfirmation({
      to: customer.email,
      name: customer.name,
      bookingRef: reference,
      sessionName: existingBooking.session_name,
      date: existingBooking.booking_date,
      timeSlot: existingBooking.time_slot,
      total: totalKes,
      items: [{ label: existingBooking.session_name, price: totalKes }],
    }).catch((err: unknown) => {
      console.error("[paystack/verify] Email send failed:", err);
    });
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: existingBooking.id,
      sessionName: existingBooking.session_name,
      bookingDate: existingBooking.booking_date,
      timeSlot: existingBooking.time_slot,
      status: "confirmed",
    },
  });
}
