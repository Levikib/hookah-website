import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

function StatCard({ label, value, sub, color, href }: { label: string; value: string; sub?: string; color: string; href?: string }) {
  const content = (
    <div style={{
      background: "var(--nebula)", border: `1px solid ${color}33`,
      borderRadius: 14, padding: "24px 28px", position: "relative",
      overflow: "hidden", transition: "border-color 0.2s",
      cursor: href ? "pointer" : "default",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "14px 14px 0 0" }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 38, color, letterSpacing: "0.04em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{content}</Link> : content;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)", confirmed: "var(--cyan-bright)",
  cancelled: "#ef4444", completed: "#22c55e",
  paid: "var(--cyan-bright)", processing: "#a78bfa",
  shipped: "var(--magenta)", delivered: "#22c55e",
};

function Badge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? "var(--text-muted)";
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 10,
      fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase",
      color: c, background: `${c}18`, border: `1px solid ${c}44`, whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

export default async function AdminDashboard() {
  const sb = createServiceClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalBookings },
    { count: pendingBookings },
    { count: totalOrders },
    { count: pendingOrders },
    { data: revenueData },
    { data: monthRevenueData },
    { data: recentBookings },
    { data: recentOrders },
    { data: lowStock },
    { count: totalStaff },
  ] = await Promise.all([
    sb.from("bookings").select("*", { count: "exact", head: true }),
    sb.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("orders").select("*", { count: "exact", head: true }),
    sb.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("bookings").select("total_kobo").in("status", ["confirmed", "completed"]),
    sb.from("bookings").select("total_kobo").in("status", ["confirmed", "completed"]).gte("created_at", startOfMonth),
    sb.from("bookings").select("id,created_at,session_name,booking_date,time_slot,status,total_kobo,customers(name,email)").order("created_at", { ascending: false }).limit(6),
    sb.from("orders").select("id,created_at,status,total_kobo,paystack_reference,customers(name,email)").order("created_at", { ascending: false }).limit(6),
    sb.from("inventory").select("flavour_id,stock_50g,stock_100g,stock_250g").or("stock_50g.lte.20,stock_100g.lte.20,stock_250g.lte.20"),
    sb.from("staff").select("*", { count: "exact", head: true }).eq("active", true),
  ]);

  const revenue = (revenueData ?? []).reduce((s: number, b: { total_kobo: number }) => s + (b.total_kobo || 0), 0) / 100;
  const monthRevenue = (monthRevenueData ?? []).reduce((s: number, b: { total_kobo: number }) => s + (b.total_kobo || 0), 0) / 100;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 42, color: "var(--text-primary)", letterSpacing: "0.06em", lineHeight: 1 }}>DASHBOARD</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
          {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Alert bar */}
      {((pendingBookings ?? 0) > 0 || (pendingOrders ?? 0) > 0 || (lowStock ?? []).length > 0) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {(pendingBookings ?? 0) > 0 && (
            <Link href="/admin/bookings?status=pending" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 8, fontSize: 13, color: "var(--gold)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              ⚡ {pendingBookings} pending booking{(pendingBookings ?? 0) !== 1 ? "s" : ""}
            </Link>
          )}
          {(pendingOrders ?? 0) > 0 && (
            <Link href="/admin/orders?status=pending" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 8, fontSize: 13, color: "var(--gold)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              📦 {pendingOrders} pending order{(pendingOrders ?? 0) !== 1 ? "s" : ""}
            </Link>
          )}
          {(lowStock ?? []).length > 0 && (
            <Link href="/admin/inventory?filter=low" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 8, fontSize: 13, color: "#ef4444", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              ⚠ {lowStock?.length} low-stock flavour{(lowStock ?? []).length !== 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px,100%), 1fr))", gap: 14, marginBottom: 36 }}>
        <StatCard label="Total Revenue" value={kes(revenue)} sub="all confirmed" color="var(--electric)" />
        <StatCard label="This Month" value={kes(monthRevenue)} sub={new Date().toLocaleString("en-KE", { month: "long" })} color="#22c55e" />
        <StatCard label="Bookings" value={String(totalBookings ?? 0)} sub={`${pendingBookings ?? 0} pending`} color="var(--violet-bright)" href="/admin/bookings" />
        <StatCard label="Orders" value={String(totalOrders ?? 0)} sub={`${pendingOrders ?? 0} pending`} color="var(--gold)" href="/admin/orders" />
        <StatCard label="Active Staff" value={String(totalStaff ?? 0)} color="var(--cyan-bright)" href="/admin/staff" />
      </div>

      {/* Two-column tables */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(440px,100%), 1fr))", gap: 24 }}>
        {/* Recent Bookings */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em" }}>RECENT BOOKINGS</h2>
            <Link href="/admin/bookings" style={{ color: "var(--cyan-bright)", fontSize: 12, textDecoration: "none", fontFamily: "var(--font-mono)" }}>View all →</Link>
          </div>
          <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 12, overflow: "hidden" }}>
            {(recentBookings ?? []).length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>No bookings yet.</div>
            ) : (recentBookings ?? []).map((b: { id: string; session_name: string; booking_date: string; time_slot: string; status: string; total_kobo: number; customers?: { name: string } | null }) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid rgba(124,58,237,0.08)", transition: "background 0.15s" }} className="admin-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.customers?.name ?? "—"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 1 }}>{b.session_name} · {b.booking_date}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{kes(b.total_kobo / 100)}</div>
                  <div style={{ marginTop: 3 }}><Badge status={b.status} /></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em" }}>RECENT ORDERS</h2>
            <Link href="/admin/orders" style={{ color: "var(--cyan-bright)", fontSize: 12, textDecoration: "none", fontFamily: "var(--font-mono)" }}>View all →</Link>
          </div>
          <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 12, overflow: "hidden" }}>
            {(recentOrders ?? []).length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>No orders yet.</div>
            ) : (recentOrders ?? []).map((o: { id: string; paystack_reference: string | null; status: string; total_kobo: number; customers?: { name: string } | null }) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid rgba(124,58,237,0.08)", transition: "background 0.15s" }} className="admin-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{o.customers?.name ?? "—"}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 1 }}>{o.paystack_reference ?? o.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{kes(o.total_kobo / 100)}</div>
                  <div style={{ marginTop: 3 }}><Badge status={o.status} /></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style>{`.admin-row:hover { background: rgba(124,58,237,0.06) !important; }`}</style>
    </div>
  );
}
