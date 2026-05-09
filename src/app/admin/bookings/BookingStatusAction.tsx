"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Props {
  bookingId: string;
  currentStatus: BookingStatus;
}

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

const BUTTON_STYLES: Record<BookingStatus, { bg: string; color: string }> = {
  confirmed: { bg: "rgba(34,211,238,0.12)", color: "var(--cyan-bright)" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  completed: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  pending: { bg: "rgba(245,158,11,0.12)", color: "var(--gold)" },
};

export default function BookingStatusAction({ bookingId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const transitions = TRANSITIONS[currentStatus];

  if (transitions.length === 0) return <span style={{ color: "var(--text-dim)", fontSize: 12 }}>—</span>;

  async function updateStatus(newStatus: BookingStatus) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
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
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {transitions.map((s) => {
        const style = BUTTON_STYLES[s];
        return (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            disabled={loading !== null}
            style={{
              padding: "5px 10px",
              minHeight: 30,
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
            {loading === s ? "..." : s}
          </button>
        );
      })}
    </div>
  );
}
