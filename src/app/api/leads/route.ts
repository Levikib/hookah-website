/**
 * POST /api/leads
 *
 * Central lead-capture endpoint for the WhatsApp-handoff funnel. Every
 * booking, order, and enquiry form on the site submits here first so
 * Smokers Vine has a real database of leads/marketing data, before the
 * browser opens a pre-filled WhatsApp chat to close the conversation.
 *
 * Body:
 *   name    — customer name
 *   phone   — customer phone
 *   email   — optional
 *   type    — "booking" | "order" | "enquiry"
 *   payload — arbitrary structured details (service/flavours/date/etc.)
 *
 * Returns:
 *   { id }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

interface RequestBody {
  name: string;
  phone: string;
  email?: string;
  type: "booking" | "order" | "enquiry";
  payload: Record<string, unknown>;
}

function isValidType(t: unknown): t is RequestBody["type"] {
  return t === "booking" || t === "order" || t === "enquiry";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, phone, email, type, payload } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 422 });
  }
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "phone is required" }, { status: 422 });
  }
  if (!isValidType(type)) {
    return NextResponse.json({ error: "type must be one of booking, order, enquiry" }, { status: 422 });
  }
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "payload is required" }, { status: 422 });
  }

  const supabase = createServiceClient();

  const { data: leadRow, error: leadError } = await supabase
    .from("leads")
    .insert({
      name,
      phone,
      email: email ?? null,
      type,
      payload,
      status: "new",
      whatsapp_sent_at: null,
    })
    .select("id")
    .single();

  if (leadError || !leadRow) {
    console.error("[leads] insert failed:", leadError);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  return NextResponse.json({ id: leadRow.id });
}
