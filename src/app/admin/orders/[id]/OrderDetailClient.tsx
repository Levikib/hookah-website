"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)", paid: "var(--cyan-bright)", processing: "#a78bfa",
  shipped: "var(--magenta)", delivered: "#22c55e", cancelled: "#ef4444",
};

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [], cancelled: [],
};

interface DeliveryEvent { id: string; status: string; note: string | null; created_at: string; }

interface Props {
  order: { id: string; status: OrderStatus };
  deliveryEvents: DeliveryEvent[];
}

export default function OrderDetailClient({ order, deliveryEvents: initialEvents }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const transitions = TRANSITIONS[status];

  async function updateStatus(newStatus: OrderStatus) {
    setLoading(newStatus);
    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { setStatus(newStatus); router.refresh(); }
    setLoading(null);
  }

  async function addDeliveryNote() {
    if (!note.trim()) return;
    setAddingNote(true);
    const res = await fetch(`/api/admin/orders/${order.id}/delivery`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.trim(), status }),
    });
    if (res.ok) {
      const data = await res.json() as { event: DeliveryEvent };
      setEvents(prev => [...prev, data.event]);
      setNote("");
    }
    setAddingNote(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Status */}
      <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--violet-bright)", letterSpacing: "0.08em", marginBottom: 16 }}>UPDATE STATUS</h2>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13,
            fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase",
            color: STATUS_COLORS[status], background: `${STATUS_COLORS[status]}18`,
            border: `1px solid ${STATUS_COLORS[status]}44`,
          }}>{status}</span>
        </div>
        {transitions.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {transitions.map(s => (
              <button key={s} onClick={() => updateStatus(s)} disabled={loading !== null}
                style={{
                  padding: "8px 16px", minHeight: 36, borderRadius: 8,
                  border: `1px solid ${STATUS_COLORS[s]}44`, background: `${STATUS_COLORS[s]}12`,
                  color: STATUS_COLORS[s], fontSize: 12, fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                }}>
                {loading === s ? "..." : `→ ${s}`}
              </button>
            ))}
          </div>
        ) : <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Order finalised.</div>}
      </div>

      {/* Delivery timeline */}
      <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--gold)", letterSpacing: "0.08em", marginBottom: 16 }}>DELIVERY TIMELINE</h2>

        {events.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>No events yet.</div>
        ) : (
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 1, background: "var(--glass-border)" }} />
            {events.map((ev, i) => (
              <div key={ev.id} style={{ display: "flex", gap: 16, marginBottom: 14, position: "relative" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: i === events.length - 1 ? "var(--electric)" : "var(--glass-border)", border: "2px solid var(--void)", flexShrink: 0, zIndex: 1 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{ev.status}</div>
                  {ev.note && <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2 }}>{ev.note}</div>}
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>{new Date(ev.created_at).toLocaleString("en-KE")}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add delivery note..."
            onKeyDown={e => e.key === "Enter" && addDeliveryNote()}
            style={{
              flex: 1, minHeight: 40, background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--glass-border)", borderRadius: 8,
              padding: "8px 12px", color: "var(--text-primary)", fontSize: 13,
              fontFamily: "var(--font-barlow), sans-serif", outline: "none",
            }}
          />
          <button onClick={addDeliveryNote} disabled={addingNote || !note.trim()}
            style={{
              padding: "8px 16px", minHeight: 40, borderRadius: 8,
              background: "var(--electric)", color: "#05030a", border: "none",
              fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
              cursor: !note.trim() ? "not-allowed" : "pointer", opacity: !note.trim() ? 0.5 : 1,
            }}>
            {addingNote ? "..." : "ADD"}
          </button>
        </div>
      </div>
    </div>
  );
}
