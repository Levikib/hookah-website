/**
 * Email helpers — powered by the Resend API (native fetch, no SDK).
 *
 * Sends from: bookings@hkh.co
 * Uses env var: RESEND_API_KEY
 *
 * All fetch calls have a 10-second timeout via AbortSignal.timeout().
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM = "HKH Hookah <bookings@hkh.co>";

function getApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing required environment variable: RESEND_API_KEY");
  return key;
}

// ---------------------------------------------------------------------------
// KES formatter (no decimal — KES uses whole numbers)
// ---------------------------------------------------------------------------
function kes(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

// ---------------------------------------------------------------------------
// Core send helper
// ---------------------------------------------------------------------------

interface ResendPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

interface ResendResponse {
  id: string;
}

async function sendEmail(payload: ResendPayload): Promise<ResendResponse> {
  const res = await fetch(RESEND_API, {
    method: "POST",
    signal: AbortSignal.timeout(10_000),
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`Resend API error [${res.status}]: ${text}`);
  }

  return res.json() as Promise<ResendResponse>;
}

// ---------------------------------------------------------------------------
// Shared HTML helpers
// ---------------------------------------------------------------------------

function htmlWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #05030a; font-family: Arial, Helvetica, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #0d0a1e; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 40px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 4px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; letter-spacing: 2px; }
    .body { padding: 32px; color: #e2e8f0; }
    .body h2 { color: #edff66; font-size: 18px; margin: 0 0 16px; letter-spacing: 1px; }
    .body p { color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 12px; }
    .detail-box { background: #1a1535; border: 1px solid #7c3aed33; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #7c3aed22; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; }
    .detail-value { color: #e2e8f0; font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0 0; font-size: 16px; font-weight: bold; }
    .total-label { color: #94a3b8; }
    .total-value { color: #edff66; }
    .cta { text-align: center; margin: 28px 0 12px; }
    .cta a { background: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; letter-spacing: 1px; }
    .footer { background: #07051a; padding: 24px 32px; text-align: center; }
    .footer p { color: #475569; font-size: 12px; margin: 4px 0; }
    .ref { font-family: monospace; color: #06b6d4; font-size: 13px; background: #06b6d411; padding: 2px 8px; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { text-align: left; color: #64748b; font-size: 12px; letter-spacing: 1px; padding: 8px 0; border-bottom: 1px solid #7c3aed33; }
    td { padding: 10px 0; color: #e2e8f0; font-size: 14px; border-bottom: 1px solid #7c3aed11; vertical-align: top; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HKH</h1>
      <p>HOOKAH · NAIROBI</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>HKH Hookah · Nairobi, Kenya</p>
      <p>Questions? Reply to this email or call us.</p>
      <p style="margin-top:8px;color:#334155;">This email was sent automatically. Do not reply if you did not make this booking.</p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Booking confirmation
// ---------------------------------------------------------------------------

export interface BookingConfirmationParams {
  to: string;
  name: string;
  /** e.g. "HKH-20260509-abc123" */
  bookingRef: string;
  sessionName: string;
  /** ISO date string or human-readable date */
  date: string;
  timeSlot: string;
  /** Total in KES (whole number) */
  total: number;
  items: Array<{ label: string; price: number }>;
}

export async function sendBookingConfirmation(
  params: BookingConfirmationParams
): Promise<ResendResponse> {
  const itemRows = params.items
    .map(
      (item) =>
        `<tr><td>${item.label}</td><td style="text-align:right;color:#06b6d4;">${kes(item.price)}</td></tr>`
    )
    .join("");

  const body = `
    <h2>YOUR BOOKING IS CONFIRMED</h2>
    <p>Hey ${params.name}, your HKH session is locked in. Get ready for an unforgettable experience.</p>

    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Booking Reference</span>
        <span class="detail-value ref">${params.bookingRef}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Session</span>
        <span class="detail-value">${params.sessionName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${params.date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">${params.timeSlot}</span>
      </div>
    </div>

    <h2>ORDER SUMMARY</h2>
    <table>
      <thead><tr><th>Item</th><th style="text-align:right;">Price</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="total-row">
      <span class="total-label">TOTAL</span>
      <span class="total-value">${kes(params.total)}</span>
    </div>

    <div class="cta">
      <a href="mailto:bookings@hkh.co">Contact Us</a>
    </div>

    <p style="margin-top:24px;font-size:13px;color:#475569;">
      Please arrive 10 minutes before your session. Bring this email as confirmation.
      Cancellations must be made at least 24 hours in advance.
    </p>
  `;

  return sendEmail({
    from: FROM,
    to: [params.to],
    subject: `Booking Confirmed — ${params.sessionName} · ${params.bookingRef}`,
    html: htmlWrapper("Booking Confirmed — HKH", body),
  });
}

// ---------------------------------------------------------------------------
// Order confirmation (flavour shop)
// ---------------------------------------------------------------------------

export interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderConfirmationParams {
  to: string;
  name: string;
  /** e.g. "ORD-20260509-xyz789" */
  orderRef: string;
  items: OrderItem[];
  /** Total in KES (whole number, delivery included) */
  total: number;
}

export async function sendOrderConfirmation(
  params: OrderConfirmationParams
): Promise<ResendResponse> {
  const itemRows = params.items
    .map(
      (item) =>
        `<tr>
          <td>${item.name}</td>
          <td style="color:#94a3b8;">${item.size} × ${item.quantity}</td>
          <td style="text-align:right;color:#06b6d4;">${kes(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const body = `
    <h2>ORDER RECEIVED</h2>
    <p>Thanks ${params.name}! We've received your order and are getting it ready. Delivery within Nairobi takes 1–3 business days.</p>

    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Order Reference</span>
        <span class="detail-value ref">${params.orderRef}</span>
      </div>
    </div>

    <h2>ITEMS</h2>
    <table>
      <thead>
        <tr>
          <th>Flavour</th>
          <th>Size × Qty</th>
          <th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="total-row">
      <span class="total-label">TOTAL (incl. delivery)</span>
      <span class="total-value">${kes(params.total)}</span>
    </div>

    <div class="cta">
      <a href="mailto:bookings@hkh.co">Track My Order</a>
    </div>

    <p style="margin-top:24px;font-size:13px;color:#475569;">
      We'll send you an update when your order ships. Delivery fee of ${kes(2_000)} is included in your total.
    </p>
  `;

  return sendEmail({
    from: FROM,
    to: [params.to],
    subject: `Order Received — ${params.orderRef} · HKH`,
    html: htmlWrapper("Order Confirmed — HKH", body),
  });
}
