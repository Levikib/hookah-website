import { createServiceClient } from "@/lib/supabase";
import BookingStatusAction from "./BookingStatusAction";

function kes(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)",
  confirmed: "var(--cyan-bright)",
  cancelled: "#ef4444",
  completed: "#22c55e",
};

const ALL_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
type BookingStatus = typeof ALL_STATUSES[number];

interface BookingRow {
  id: string;
  created_at: string;
  session_name: string;
  booking_date: string;
  time_slot: string;
  status: BookingStatus;
  total_kobo: number;
  paystack_reference: string | null;
  notes: string | null;
  customers?: { name: string; email: string; phone: string | null } | null;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("bookings")
    .select("id, created_at, session_name, booking_date, time_slot, status, total_kobo, paystack_reference, notes, customers(name, email, phone)")
    .order("created_at", { ascending: false });

  if (filterStatus && ALL_STATUSES.includes(filterStatus as BookingStatus)) {
    query = query.eq("status", filterStatus);
  }

  const { data, error } = await query;
  const bookings = (data ?? []) as BookingRow[];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "var(--font-bebas), sans-serif",
          fontSize: 40,
          color: "var(--text-primary)",
          letterSpacing: "0.06em",
          lineHeight: 1,
        }}>
          BOOKINGS
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} {filterStatus ? `with status "${filterStatus}"` : "total"}
        </p>
        {error && (
          <div style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
            Error loading bookings: {String(error)}
          </div>
        )}
      </div>

      {/* Status Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <a
          href="/admin/bookings"
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textDecoration: "none",
            background: !filterStatus ? "var(--violet)" : "transparent",
            color: !filterStatus ? "#fff" : "var(--text-muted)",
            border: `1px solid ${!filterStatus ? "var(--violet)" : "var(--glass-border)"}`,
            minHeight: 36,
            display: "flex",
            alignItems: "center",
          }}
        >
          All
        </a>
        {ALL_STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin/bookings?status=${s}`}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              background: filterStatus === s ? STATUS_COLORS[s] : "transparent",
              color: filterStatus === s ? "#05030a" : STATUS_COLORS[s],
              border: `1px solid ${STATUS_COLORS[s]}`,
              minHeight: 36,
              display: "flex",
              alignItems: "center",
            }}
          >
            {s}
          </a>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "var(--nebula)",
        border: "1px solid var(--glass-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["Reference", "Customer", "Session", "Date & Time", "Status", "Total", "Actions"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    No bookings found.
                  </td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
                  <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {b.paystack_reference ?? b.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
                      {b.customers?.name ?? "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {b.customers?.email ?? ""}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                    {b.session_name}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {b.booking_date}<br />
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{b.time_slot}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: STATUS_COLORS[b.status] ?? "var(--text-muted)",
                      background: `${STATUS_COLORS[b.status] ?? "var(--text-muted)"}18`,
                      border: `1px solid ${STATUS_COLORS[b.status] ?? "var(--text-muted)"}44`,
                      whiteSpace: "nowrap",
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gold)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {kes(b.total_kobo / 100)}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <BookingStatusAction bookingId={b.id} currentStatus={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card stack */}
      <div className="booking-cards-mobile" style={{ display: "none" }}>
        {bookings.map((b) => (
          <div key={`m-${b.id}`} style={{
            background: "var(--nebula)",
            border: "1px solid var(--glass-border)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{b.customers?.name ?? "—"}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                  {b.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <span style={{
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: STATUS_COLORS[b.status],
                background: `${STATUS_COLORS[b.status]}18`,
                border: `1px solid ${STATUS_COLORS[b.status]}44`,
              }}>
                {b.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{b.session_name}</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>{b.booking_date} · {b.time_slot}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--gold)", fontWeight: 600 }}>{kes(b.total_kobo / 100)}</span>
              <BookingStatusAction bookingId={b.id} currentStatus={b.status} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .booking-cards-mobile { display: block !important; }
          table { display: none; }
        }
      `}</style>
    </div>
  );
}
