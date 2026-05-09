"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)", confirmed: "var(--cyan-bright)",
  cancelled: "#ef4444", completed: "#22c55e",
};

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [], completed: [],
};

interface StaffMember { id: string; name: string; avatar_emoji: string; }

interface Props {
  booking: { id: string; status: BookingStatus };
  staffList: (StaffMember & { area?: string })[];
  assignedStaff: StaffMember[];
}

export default function BookingDetailClient({ booking, staffList, assignedStaff: initialAssigned }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(booking.status);
  const [assigned, setAssigned] = useState<StaffMember[]>(initialAssigned);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [staffLoading, setStaffLoading] = useState(false);

  async function updateStatus(newStatus: BookingStatus) {
    setStatusLoading(newStatus);
    const res = await fetch(`/api/admin/bookings/${booking.id}/status`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { setStatus(newStatus); router.refresh(); }
    setStatusLoading(null);
  }

  async function assignStaff(member: StaffMember) {
    if (assigned.find(a => a.id === member.id)) return;
    setStaffLoading(true);
    const res = await fetch(`/api/admin/bookings/${booking.id}/staff`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_id: member.id }),
    });
    if (res.ok) setAssigned(prev => [...prev, member]);
    setStaffLoading(false);
  }

  async function removeStaff(staffId: string) {
    setStaffLoading(true);
    const res = await fetch(`/api/admin/bookings/${booking.id}/staff`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_id: staffId }),
    });
    if (res.ok) setAssigned(prev => prev.filter(a => a.id !== staffId));
    setStaffLoading(false);
  }

  const transitions = TRANSITIONS[status];
  const available = staffList.filter(s => !assigned.find(a => a.id === s.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Status panel */}
      <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--violet-bright)", letterSpacing: "0.08em", marginBottom: 16 }}>STATUS</h2>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13,
            fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase",
            color: STATUS_COLORS[status], background: `${STATUS_COLORS[status]}18`,
            border: `1px solid ${STATUS_COLORS[status]}44`,
          }}>{status}</span>
        </div>
        {transitions.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {transitions.map(s => (
              <button key={s} onClick={() => updateStatus(s)} disabled={statusLoading !== null}
                style={{
                  padding: "8px 16px", minHeight: 36, borderRadius: 8,
                  border: `1px solid ${STATUS_COLORS[s]}44`, background: `${STATUS_COLORS[s]}12`,
                  color: STATUS_COLORS[s], fontSize: 12, fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: statusLoading ? "not-allowed" : "pointer", opacity: statusLoading ? 0.6 : 1,
                }}>
                {statusLoading === s ? "..." : `→ ${s}`}
              </button>
            ))}
          </div>
        )}
        {transitions.length === 0 && <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No further transitions.</div>}
      </div>

      {/* Staff assignment panel */}
      <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--gold)", letterSpacing: "0.08em", marginBottom: 16 }}>ASSIGN STAFF</h2>

        {assigned.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Assigned</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {assigned.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8 }}>
                  <span style={{ fontSize: 18 }}>{m.avatar_emoji}</span>
                  <span style={{ fontSize: 13, color: "#22c55e" }}>{m.name}</span>
                  <button onClick={() => removeStaff(m.id)} disabled={staffLoading}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {available.length > 0 && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Available Staff</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {available.map(m => (
                <button key={m.id} onClick={() => assignStaff(m)} disabled={staffLoading}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", minHeight: 36, background: "rgba(124,58,237,0.08)", border: "1px solid var(--glass-border)", borderRadius: 8, cursor: "pointer", color: "var(--text-muted)", fontSize: 13 }}>
                  <span style={{ fontSize: 16 }}>{m.avatar_emoji}</span> {m.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {available.length === 0 && assigned.length === 0 && <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No active staff available.</div>}
      </div>
    </div>
  );
}
