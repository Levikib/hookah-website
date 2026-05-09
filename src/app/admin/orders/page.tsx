import { createServiceClient } from "@/lib/supabase";
import OrderStatusAction from "./OrderStatusAction";

function kes(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)",
  paid: "var(--cyan-bright)",
  processing: "var(--violet-bright)",
  shipped: "var(--magenta)",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

const ALL_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof ALL_STATUSES[number];

interface OrderItemRow {
  id: string;
  flavour_id: string;
  size: string;
  quantity: number;
  unit_price_kobo: number;
}

interface OrderRow {
  id: string;
  created_at: string;
  status: OrderStatus;
  total_kobo: number;
  delivery_address: string;
  paystack_reference: string | null;
  customers?: { name: string; email: string; phone: string | null } | null;
  order_items?: OrderItemRow[];
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("orders")
    .select("id, created_at, status, total_kobo, delivery_address, paystack_reference, customers(name, email, phone), order_items(id, flavour_id, size, quantity, unit_price_kobo)")
    .order("created_at", { ascending: false });

  if (filterStatus && ALL_STATUSES.includes(filterStatus as OrderStatus)) {
    query = query.eq("status", filterStatus);
  }

  const { data, error } = await query;
  const orders = (data ?? []) as OrderRow[];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "var(--font-bebas), sans-serif",
          fontSize: 40,
          color: "var(--text-primary)",
          letterSpacing: "0.06em",
          lineHeight: 1,
        }}>
          ORDERS
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""} {filterStatus ? `with status "${filterStatus}"` : "total"}
        </p>
        {error && (
          <div style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
            Error: {String(error)}
          </div>
        )}
      </div>

      {/* Status Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <a
          href="/admin/orders"
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
            href={`/admin/orders?status=${s}`}
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

      {/* Orders list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.length === 0 && (
          <div style={{
            background: "var(--nebula)",
            border: "1px solid var(--glass-border)",
            borderRadius: 12,
            padding: "40px 24px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}>
            No orders found.
          </div>
        )}
        {orders.map((o) => (
          <div key={o.id} style={{
            background: "var(--nebula)",
            border: "1px solid var(--glass-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {/* Order header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
              padding: "16px 20px",
              borderBottom: o.order_items && o.order_items.length > 0 ? "1px solid rgba(124,58,237,0.12)" : "none",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                {/* Ref */}
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Reference</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {o.paystack_reference ?? o.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
                {/* Customer */}
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer</div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, marginTop: 2 }}>{o.customers?.name ?? "—"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{o.customers?.email}</div>
                </div>
                {/* Status */}
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: STATUS_COLORS[o.status],
                      background: `${STATUS_COLORS[o.status]}18`,
                      border: `1px solid ${STATUS_COLORS[o.status]}44`,
                    }}>
                      {o.status}
                    </span>
                  </div>
                </div>
                {/* Total */}
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</div>
                  <div style={{ fontSize: 14, color: "var(--gold)", fontWeight: 700, marginTop: 2 }}>{kes(o.total_kobo / 100)}</div>
                </div>
              </div>
              {/* Actions */}
              <OrderStatusAction orderId={o.id} currentStatus={o.status} />
            </div>

            {/* Items */}
            {o.order_items && o.order_items.length > 0 && (
              <div style={{ padding: "12px 20px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Items ({o.order_items.length})
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {o.order_items.map((item) => (
                    <div key={item.id} style={{
                      padding: "5px 10px",
                      background: "rgba(124,58,237,0.08)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 6,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}>
                      {item.flavour_id} · {item.size} × {item.quantity} — {kes(item.unit_price_kobo / 100 * item.quantity)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
