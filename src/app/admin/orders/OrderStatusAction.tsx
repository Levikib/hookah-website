"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const BUTTON_STYLES: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "var(--gold)" },
  paid: { bg: "rgba(34,211,238,0.12)", color: "var(--cyan-bright)" },
  processing: { bg: "rgba(124,58,237,0.12)", color: "var(--violet-bright)" },
  shipped: { bg: "rgba(232,121,249,0.12)", color: "var(--magenta)" },
  delivered: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

export default function OrderStatusAction({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const transitions = TRANSITIONS[currentStatus];

  if (transitions.length === 0) return <span style={{ color: "var(--text-dim)", fontSize: 12 }}>—</span>;

  async function updateStatus(newStatus: OrderStatus) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update status.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {transitions.map((s) => {
        const style = BUTTON_STYLES[s];
        return (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            disabled={loading !== null}
            style={{
              padding: "7px 12px",
              minHeight: 34,
              borderRadius: 6,
              border: `1px solid ${style.color}44`,
              background: style.bg,
              color: style.color,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading !== null ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {loading === s ? "..." : `→ ${s}`}
          </button>
        );
      })}
    </div>
  );
}
