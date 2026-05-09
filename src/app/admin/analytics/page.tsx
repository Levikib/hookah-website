import { createServiceClient } from "@/lib/supabase";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

function pct(a: number, b: number) { return b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`; }

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)", confirmed: "var(--cyan-bright)",
  cancelled: "#ef4444", completed: "#22c55e",
  paid: "var(--cyan-bright)", processing: "#a78bfa",
  shipped: "var(--magenta)", delivered: "#22c55e",
};

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max === 0 ? 0 : Math.max(2, Math.round((value / max) * 100));
  return (
    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const sb = createServiceClient();

  const now = new Date();
  const months: { label: string; start: string; end: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({
      label: d.toLocaleString("en-KE", { month: "short", year: "2-digit" }),
      start: d.toISOString(),
      end: end.toISOString(),
    });
  }

  const [
    { data: allBookings },
    { data: allOrders },
    { data: sessionCounts },
    { data: inventoryData },
  ] = await Promise.all([
    sb.from("bookings").select("total_kobo,status,created_at,session_name"),
    sb.from("orders").select("total_kobo,status,created_at"),
    sb.from("bookings").select("session_name,total_kobo,status"),
    sb.from("inventory").select("flavour_id,stock_50g,stock_100g,stock_250g"),
  ]);

  const bookings = allBookings ?? [];
  const orders = allOrders ?? [];

  // Monthly revenue
  const monthlyData = months.map(m => {
    const bRevenue = bookings
      .filter((b: { created_at: string; status: string; total_kobo: number }) => b.created_at >= m.start && b.created_at < m.end && ["confirmed", "completed"].includes(b.status))
      .reduce((s: number, b: { total_kobo: number }) => s + b.total_kobo, 0) / 100;
    const oRevenue = orders
      .filter((o: { created_at: string; status: string; total_kobo: number }) => o.created_at >= m.start && o.created_at < m.end && ["paid", "delivered"].includes(o.status))
      .reduce((s: number, o: { total_kobo: number }) => s + o.total_kobo, 0) / 100;
    return { label: m.label, bookingRevenue: bRevenue, orderRevenue: oRevenue, total: bRevenue + oRevenue };
  });
  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);

  // Booking status breakdown
  const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"];
  const bookingStatusCounts = bookingStatuses.map(s => ({
    status: s,
    count: bookings.filter((b: { status: string }) => b.status === s).length,
  }));

  // Top sessions by revenue
  const sessionRevMap: Record<string, { count: number; revenue: number }> = {};
  bookings.forEach((b: { session_name: string; status: string; total_kobo: number }) => {
    if (!sessionRevMap[b.session_name]) sessionRevMap[b.session_name] = { count: 0, revenue: 0 };
    sessionRevMap[b.session_name].count++;
    if (["confirmed", "completed"].includes(b.status)) sessionRevMap[b.session_name].revenue += b.total_kobo / 100;
  });
  const topSessions = Object.entries(sessionRevMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6);
  const maxSessionRev = Math.max(...topSessions.map(s => s[1].revenue), 1);

  // Totals
  const totalBookingRevenue = bookings.filter((b: { status: string }) => ["confirmed", "completed"].includes(b.status)).reduce((s: number, b: { total_kobo: number }) => s + b.total_kobo, 0) / 100;
  const totalOrderRevenue = orders.filter((o: { status: string }) => ["paid", "delivered"].includes(o.status)).reduce((s: number, o: { total_kobo: number }) => s + o.total_kobo, 0) / 100;
  const conversionRate = bookings.length > 0 ? bookings.filter((b: { status: string }) => ["confirmed", "completed"].includes(b.status)).length / bookings.length : 0;
  const totalInventory = (inventoryData ?? []).reduce((s: number, i: { stock_50g: number; stock_100g: number; stock_250g: number }) => s + i.stock_50g + i.stock_100g + i.stock_250g, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 42, color: "var(--text-primary)", letterSpacing: "0.06em", lineHeight: 1 }}>ANALYTICS</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>Business performance overview</p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(160px,100%), 1fr))", gap: 14, marginBottom: 36 }}>
        {[
          { label: "Booking Revenue", value: kes(totalBookingRevenue), color: "var(--electric)" },
          { label: "Order Revenue", value: kes(totalOrderRevenue), color: "#22c55e" },
          { label: "Total Revenue", value: kes(totalBookingRevenue + totalOrderRevenue), color: "var(--cyan-bright)" },
          { label: "Conversion Rate", value: pct(Math.round(conversionRate * bookings.length), bookings.length), color: "var(--violet-bright)" },
          { label: "Total Bookings", value: String(bookings.length), color: "var(--gold)" },
          { label: "Stock Units", value: totalInventory.toLocaleString(), color: "var(--magenta)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--nebula)", border: `1px solid ${color}33`, borderRadius: 12, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 30, color, letterSpacing: "0.04em", lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(400px,100%), 1fr))", gap: 24, marginBottom: 24 }}>
        {/* Monthly Revenue */}
        <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em", marginBottom: 24 }}>MONTHLY REVENUE</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {monthlyData.map(m => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{m.label}</span>
                  <span style={{ fontSize: 13, color: "var(--electric)", fontWeight: 600 }}>{kes(m.total)}</span>
                </div>
                <Bar value={m.total} max={maxMonthly} color="var(--electric)" />
                <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--cyan-bright)" }}>Bookings: {kes(m.bookingRevenue)}</span>
                  <span style={{ fontSize: 11, color: "var(--gold)" }}>Orders: {kes(m.orderRevenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em", marginBottom: 24 }}>BOOKING STATUS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {bookingStatusCounts.map(({ status, count }) => (
              <div key={status}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: STATUS_COLORS[status] ?? "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{status}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{count} <span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: 12 }}>({pct(count, bookings.length)})</span></span>
                </div>
                <Bar value={count} max={Math.max(...bookingStatusCounts.map(b => b.count), 1)} color={STATUS_COLORS[status] ?? "var(--text-muted)"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Sessions */}
      <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em", marginBottom: 24 }}>TOP SESSIONS BY REVENUE</h2>
        {topSessions.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--text-dim)" }}>No booking data yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px,100%), 1fr))", gap: 16 }}>
            {topSessions.map(([name, data], i) => (
              <div key={name} style={{ padding: "16px", background: "rgba(124,58,237,0.06)", border: "1px solid var(--glass-border)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginBottom: 4 }}>#{i + 1}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, color: "var(--electric)", fontWeight: 700 }}>{kes(data.revenue)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{data.count} booking{data.count !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <Bar value={data.revenue} max={maxSessionRev} color="var(--violet-bright)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
