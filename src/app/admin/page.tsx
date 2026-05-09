import { createServiceClient } from "@/lib/supabase";

function kes(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div style={{
      background: "var(--nebula)",
      border: `1px solid ${color}33`,
      borderRadius: 12,
      padding: "24px 28px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: color,
        borderRadius: "12px 12px 0 0",
      }} />
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--text-muted)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-bebas), sans-serif",
        fontSize: 36,
        color: color,
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  );
}

interface BookingRow {
  id: string;
  created_at: string;
  session_name: string;
  booking_date: string;
  time_slot: string;
  status: string;
  total_kobo: number;
  customers?: { name: string; email: string } | null;
}

interface OrderRow {
  id: string;
  created_at: string;
  status: string;
  total_kobo: number;
  paystack_reference: string | null;
  customers?: { name: string; email: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)",
  confirmed: "var(--cyan-bright)",
  cancelled: "#ef4444",
  completed: "#22c55e",
  paid: "var(--cyan-bright)",
  processing: "var(--violet)",
  shipped: "var(--magenta)",
  delivered: "#22c55e",
};

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  const [
    { count: totalBookings },
    { count: confirmedBookings },
    { count: totalOrders },
    { data: recentBookings },
    { data: recentOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("id, created_at, session_name, booking_date, time_slot, status, total_kobo, customers(name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("id, created_at, status, total_kobo, paystack_reference, customers(name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("total_kobo")
      .eq("status", "confirmed"),
  ]);

  const revenue = (revenueData ?? []).reduce((sum: number, b: { total_kobo: number }) => sum + (b.total_kobo || 0), 0) / 100;

  const bookings = (recentBookings ?? []) as BookingRow[];
  const orders = (recentOrders ?? []) as OrderRow[];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "var(--font-bebas), sans-serif",
          fontSize: 40,
          color: "var(--text-primary)",
          letterSpacing: "0.06em",
          lineHeight: 1,
        }}>
          DASHBOARD
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
        gap: 16,
        marginBottom: 40,
      }}>
        <StatCard label="Total Bookings" value={String(totalBookings ?? 0)} color="var(--violet-bright)" />
        <StatCard label="Confirmed" value={String(confirmedBookings ?? 0)} color="var(--cyan-bright)" />
        <StatCard label="Total Orders" value={String(totalOrders ?? 0)} color="var(--gold)" />
        <StatCard label="Revenue" value={kes(revenue)} color="var(--electric)" />
      </div>

      {/* Recent Bookings */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 22,
            color: "var(--text-primary)",
            letterSpacing: "0.06em",
          }}>
            RECENT BOOKINGS
          </h2>
          <a href="/admin/bookings" style={{ color: "var(--cyan-bright)", fontSize: 13, textDecoration: "none", fontFamily: "var(--font-mono)" }}>
            View all →
          </a>
        </div>
        <div style={{
          background: "var(--nebula)",
          border: "1px solid var(--glass-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  {["Reference", "Customer", "Session", "Date", "Status", "Total"].map((h) => (
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
                    <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                      No bookings yet.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                      {b.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)" }}>
                      {b.customers?.name ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                      {b.session_name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {b.booking_date} {b.time_slot}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
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
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>
                      {kes(b.total_kobo / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 22,
            color: "var(--text-primary)",
            letterSpacing: "0.06em",
          }}>
            RECENT ORDERS
          </h2>
          <a href="/admin/orders" style={{ color: "var(--cyan-bright)", fontSize: 13, textDecoration: "none", fontFamily: "var(--font-mono)" }}>
            View all →
          </a>
        </div>
        <div style={{
          background: "var(--nebula)",
          border: "1px solid var(--glass-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  {["Reference", "Customer", "Status", "Total"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                      No orders yet.
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                      {o.paystack_reference ?? o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)" }}>
                      {o.customers?.name ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: STATUS_COLORS[o.status] ?? "var(--text-muted)",
                        background: `${STATUS_COLORS[o.status] ?? "var(--text-muted)"}18`,
                        border: `1px solid ${STATUS_COLORS[o.status] ?? "var(--text-muted)"}44`,
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>
                      {kes(o.total_kobo / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
