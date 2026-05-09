import { createServiceClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FLAVOURS } from "@/data/flavours";
import OrderDetailClient from "./OrderDetailClient";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)", paid: "var(--cyan-bright)", processing: "#a78bfa",
  shipped: "var(--magenta)", delivered: "#22c55e", cancelled: "#ef4444",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceClient();

  const { data: order } = await sb
    .from("orders")
    .select("*, customers(id,name,email,phone), order_items(id,flavour_id,size,quantity,unit_price_kobo), delivery_events(id,status,note,created_at)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const flavourMap = Object.fromEntries(FLAVOURS.map(f => [String(f.id), f]));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/orders" style={{ color: "var(--cyan-bright)", fontSize: 13, textDecoration: "none", fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          ← Orders
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 36, color: "var(--text-primary)", letterSpacing: "0.06em", lineHeight: 1 }}>ORDER DETAIL</h1>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{order.paystack_reference ?? order.id}</div>
          </div>
          <span style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13,
            fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase",
            color: STATUS_COLORS[order.status], background: `${STATUS_COLORS[order.status]}18`,
            border: `1px solid ${STATUS_COLORS[order.status]}44`,
            alignSelf: "center",
          }}>{order.status}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px,100%), 1fr))", gap: 20 }}>
        {/* Customer + Delivery */}
        <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--cyan-bright)", letterSpacing: "0.08em", marginBottom: 16 }}>CUSTOMER</h2>
          {order.customers ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{order.customers.name}</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 2 }}>{order.customers.email}</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{order.customers.phone ?? "—"}</div>
            </>
          ) : <div style={{ color: "var(--text-dim)", fontSize: 14 }}>No customer data.</div>}

          {order.delivery_address && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Delivery Address</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>{order.delivery_address}</div>
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label: "Order Date", value: new Date(order.created_at).toLocaleString("en-KE") },
              { label: "Total", value: kes(order.total_kobo / 100) },
              { label: "Reference", value: order.paystack_reference ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--magenta)", letterSpacing: "0.08em", marginBottom: 16 }}>ORDER ITEMS</h2>
          {(order.order_items ?? []).length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No items.</div>
          ) : (order.order_items ?? []).map((item: { id: string; flavour_id: string; size: string; quantity: number; unit_price_kobo: number }) => {
            const flavour = flavourMap[String(item.flavour_id)];
            return (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 24 }}>{flavour?.emoji ?? "🫙"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{flavour?.name ?? `Flavour #${item.flavour_id}`}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{item.size} × {item.quantity}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{kes(item.unit_price_kobo / 100 * item.quantity)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{kes(item.unit_price_kobo / 100)} each</div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--electric)" }}>Total: {kes(order.total_kobo / 100)}</div>
          </div>
        </div>

        {/* Status + Delivery Timeline (client) */}
        <OrderDetailClient
          order={{ id: order.id, status: order.status }}
          deliveryEvents={(order.delivery_events ?? []).sort((a: { created_at: string }, b: { created_at: string }) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())}
        />
      </div>
    </div>
  );
}
