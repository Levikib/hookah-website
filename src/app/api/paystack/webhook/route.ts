/**
 * POST /api/paystack/webhook
 *
 * Receives event notifications from Paystack servers.
 * MUST return HTTP 200 quickly — Paystack retries if it doesn't get 200 within 5s.
 * All processing errors are logged but NEVER cause a non-200 response.
 *
 * Handles:
 *   charge.success — same logic as /api/paystack/verify (idempotent)
 *
 * Security:
 *   Validates the HMAC-SHA512 signature in x-paystack-signature header.
 */

export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyPayment } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase";
import { sendBookingConfirmation } from "@/lib/email";

// ---------------------------------------------------------------------------
// Signature validation
// ---------------------------------------------------------------------------

function validateSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("[webhook] PAYSTACK_SECRET_KEY is not set — cannot validate signature");
    return false;
  }

  const expected = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    // Buffer lengths differ → invalid signature
    return false;
  }
}

// ---------------------------------------------------------------------------
// Paystack event types (partial — only what we handle)
// ---------------------------------------------------------------------------

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: { email: string };
    metadata?: Record<string, unknown> | null;
  };
}

// ---------------------------------------------------------------------------
// Core processing logic (shared with /verify, idempotent)
// ---------------------------------------------------------------------------

async function processChargeSuccess(reference: string): Promise<void> {
  const supabase = createServiceClient();

  // Look up the booking
  const { data: booking, error: lookupError } = await supabase
    .from("bookings")
    .select("id, status, session_name, booking_date, time_slot, total_kobo, customer_id")
    .eq("paystack_reference", reference)
    .single();

  if (lookupError || !booking) {
    // Could be an order payment rather than a booking — log and skip
    console.warn("[webhook] No booking found for reference:", reference);
    return;
  }

  // Idempotency — already confirmed
  if (booking.status === "confirmed") {
    return;
  }

  // Verify with Paystack to be sure
  const txData = await verifyPayment(reference);
  if (txData.status !== "success") {
    console.warn("[webhook] Transaction status is not success:", txData.status);
    return;
  }

  // Confirm the booking
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", booking.id);

  if (updateError) {
    throw new Error(`Failed to confirm booking ${booking.id}: ${updateError.message}`);
  }

  // Fetch customer for email
  const { data: customer } = await supabase
    .from("customers")
    .select("email, name")
    .eq("id", booking.customer_id)
    .single();

  if (customer) {
    const totalKes = Math.round(booking.total_kobo / 100);
    await sendBookingConfirmation({
      to: customer.email,
      name: customer.name,
      bookingRef: reference,
      sessionName: booking.session_name,
      date: booking.booking_date,
      timeSlot: booking.time_slot,
      total: totalKes,
      items: [{ label: booking.session_name, price: totalKes }],
    });
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read raw body as text (required for HMAC verification)
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  // --- Validate signature ---
  if (!validateSignature(rawBody, signature)) {
    // Return 200 even for invalid signatures (don't let Paystack keep retrying
    // with obviously forged requests, but also don't expose failure reasons)
    console.warn("[webhook] Invalid signature — request rejected silently");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // --- Parse event ---
  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch (err) {
    console.error("[webhook] Failed to parse JSON:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // --- Dispatch on event type ---
  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    if (reference) {
      // Process asynchronously — do NOT await (keeps response fast)
      processChargeSuccess(reference).catch((err: unknown) => {
        console.error("[webhook] processChargeSuccess error:", err);
      });
    }
  } else {
    // Unhandled event type — log for future implementation
    console.log("[webhook] Unhandled event type:", event.event);
  }

  // Always return 200 immediately
  return NextResponse.json({ received: true }, { status: 200 });
}
