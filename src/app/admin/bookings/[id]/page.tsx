import { createServiceClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookingDetailClient from "./BookingDetailClient";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceClient();

  const { data: booking } = await sb
    .from("bookings")
    .select("*, customers(id,name,email,phone), booking_flavours(flavour_id,size,quantity)")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const { data: staffList } = await sb.from("staff").select("id,name,avatar_emoji,area").eq("active", true);
  const { data: assignedStaff } = await sb
    .from("staff_bookings")
    .select("staff_id, staff(id,name,avatar_emoji)")
    .eq("booking_id", id);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/bookings" style={{ color: "var(--cyan-bright)", fontSize: 13, textDecoration: "none", fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          ← Bookings
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 36, color: "var(--text-primary)", letterSpacing: "0.06em", lineHeight: 1 }}>
              BOOKING DETAIL
            </h1>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              {booking.paystack_reference ?? booking.id}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px,100%), 1fr))", gap: 20 }}>
        {/* Booking Info */}
        <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--electric)", letterSpacing: "0.08em", marginBottom: 20 }}>SESSION INFO</h2>
          {[
            { label: "Session", value: booking.session_name },
            { label: "Date", value: new Date(booking.booking_date).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
            { label: "Time Slot", value: booking.time_slot },
            { label: "Total", value: kes(booking.total_kobo / 100) },
            { label: "Delivery Fee", value: booking.delivery_fee_kobo ? kes(booking.delivery_fee_kobo / 100) : "—" },
            { label: "Reference", value: booking.paystack_reference ?? "—" },
            { label: "Created", value: new Date(booking.created_at).toLocaleString("en-KE") },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
            </div>
          ))}
          {booking.notes && (
            <div style={{ marginTop: 16, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
              {booking.notes}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--cyan-bright)", letterSpacing: "0.08em", marginBottom: 20 }}>CUSTOMER</h2>
          {booking.customers ? (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{booking.customers.name}</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 2 }}>{booking.customers.email}</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{booking.customers.phone ?? "—"}</div>
            </div>
          ) : (
            <div style={{ color: "var(--text-dim)", fontSize: 14 }}>No customer data.</div>
          )}

          {booking.booking_flavours && booking.booking_flavours.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 16, color: "var(--magenta)", letterSpacing: "0.08em", marginBottom: 12 }}>FLAVOURS</div>
              {booking.booking_flavours.map((f: { flavour_id: string; size: string; quantity: number }) => (
                <div key={`${f.flavour_id}-${f.size}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(232,121,249,0.06)", border: "1px solid rgba(232,121,249,0.15)", borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Flavour #{f.flavour_id} · {f.size}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--magenta)" }}>×{f.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status + Staff Assignment (client) */}
        <BookingDetailClient
          booking={{ id: booking.id, status: booking.status }}
          staffList={staffList ?? []}
          assignedStaff={(assignedStaff ?? []).map((a: { staff_id: string; staff: { id: string; name: string; avatar_emoji: string } | null }) => a.staff).filter(Boolean)}
        />
      </div>
    </div>
  );
}
