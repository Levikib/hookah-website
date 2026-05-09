"use client";

import { useState, useEffect, FormEvent } from "react";

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  active: boolean;
  avatar_emoji: string;
  booking_count: number;
}

interface AssignedBooking {
  id: string;
  session_name: string;
  booking_date: string;
  time_slot: string;
  status: string;
}

const AVATAR_EMOJIS = ["🧑", "👨", "👩", "🧔", "👱", "🙍", "🧕", "🧑‍🦱"];

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--gold)",
  confirmed: "var(--cyan-bright)",
  cancelled: "#ef4444",
  completed: "#22c55e",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [bookings, setBookings] = useState<AssignedBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    avatar_emoji: "🧑",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const json = await res.json() as { staff: StaffMember[] };
        setStaff(json.staff ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStaff(); }, []);

  async function toggleActive(member: StaffMember) {
    const res = await fetch("/api/admin/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, active: !member.active }),
    });
    if (res.ok) loadStaff();
  }

  async function handleSelectStaff(member: StaffMember) {
    setSelectedStaff(member);
    setBookingsLoading(true);
    setBookings([]);
    const res = await fetch(`/api/admin/staff?id=${member.id}&bookings=1`);
    if (res.ok) {
      const json = await res.json() as { bookings: AssignedBooking[] };
      setBookings(json.bookings ?? []);
    }
    setBookingsLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", phone: "", email: "", area: "", avatar_emoji: "🧑" });
        loadStaff();
      } else {
        const err = await res.json() as { error?: string };
        setFormError(err.error ?? "Failed to create staff member.");
      }
    } catch {
      setFormError("Network error.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 40,
            color: "var(--text-primary)",
            letterSpacing: "0.06em",
            lineHeight: 1,
          }}>
            STAFF
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            {staff.length} staff member{staff.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            minHeight: 44,
            background: "var(--electric)",
            color: "#05030a",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 15,
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          {showForm ? "CANCEL" : "+ ADD STAFF"}
        </button>
      </div>

      {/* Add staff form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: "var(--nebula)",
          border: "1px solid var(--glass-border)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}>
          <h2 style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 20,
            color: "var(--text-primary)",
            letterSpacing: "0.06em",
            marginBottom: 20,
          }}>
            NEW STAFF MEMBER
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            {(["name", "phone", "email", "area"] as const).map((field) => (
              <div key={field}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                  {field}
                </label>
                <input
                  type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                  required={field === "name"}
                  placeholder={`Enter ${field}`}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontFamily: "var(--font-barlow), sans-serif",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
          {/* Avatar picker */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Avatar
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, avatar_emoji: emoji }))}
                  style={{
                    width: 44,
                    height: 44,
                    fontSize: 24,
                    borderRadius: 8,
                    border: `2px solid ${form.avatar_emoji === emoji ? "var(--electric)" : "var(--glass-border)"}`,
                    background: form.avatar_emoji === emoji ? "rgba(237,255,102,0.1)" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          {formError && (
            <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>
              {formError}
            </div>
          )}
          <button
            type="submit"
            disabled={formLoading}
            style={{
              padding: "10px 24px",
              minHeight: 44,
              background: formLoading ? "rgba(237,255,102,0.3)" : "var(--electric)",
              color: "#05030a",
              border: "none",
              borderRadius: 8,
              fontFamily: "var(--font-bebas), sans-serif",
              fontSize: 15,
              letterSpacing: "0.1em",
              cursor: formLoading ? "not-allowed" : "pointer",
            }}
          >
            {formLoading ? "SAVING..." : "CREATE STAFF MEMBER"}
          </button>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selectedStaff ? "1fr 320px" : "1fr", gap: 20, alignItems: "flex-start" }}>
        {/* Staff table */}
        <div style={{
          background: "var(--nebula)",
          border: "1px solid var(--glass-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {loading ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
          ) : staff.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No staff members yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {["", "Name", "Phone", "Area", "Bookings", "Active", ""].map((h, i) => (
                      <th key={i} style={{
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
                  {staff.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => handleSelectStaff(member)}
                      style={{
                        borderBottom: "1px solid rgba(124,58,237,0.08)",
                        cursor: "pointer",
                        background: selectedStaff?.id === member.id ? "rgba(124,58,237,0.06)" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "14px 16px", fontSize: 24, width: 52 }}>{member.avatar_emoji}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{member.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{member.email}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{member.phone}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>{member.area}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          background: "rgba(124,58,237,0.1)",
                          color: "var(--violet-bright)",
                          border: "1px solid rgba(124,58,237,0.2)",
                        }}>
                          {member.booking_count}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: member.active ? "#22c55e" : "#ef4444",
                          background: member.active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                          border: `1px solid ${member.active ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        }}>
                          {member.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleActive(member)}
                          style={{
                            padding: "5px 10px",
                            minHeight: 30,
                            borderRadius: 6,
                            border: `1px solid ${member.active ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                            background: "transparent",
                            color: member.active ? "#ef4444" : "#22c55e",
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Staff detail panel */}
        {selectedStaff && (
          <div style={{
            background: "var(--nebula)",
            border: "1px solid var(--glass-border)",
            borderRadius: 12,
            overflow: "hidden",
            position: "sticky",
            top: 24,
          }}>
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 32 }}>{selectedStaff.avatar_emoji}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--text-primary)", letterSpacing: "0.06em" }}>{selectedStaff.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{selectedStaff.area}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 18, cursor: "pointer", padding: 4 }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Assigned Bookings
              </div>
              {bookingsLoading ? (
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
              ) : bookings.length === 0 ? (
                <div style={{ color: "var(--text-dim)", fontSize: 13 }}>No assigned bookings.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bookings.map((b) => (
                    <div key={b.id} style={{
                      padding: "10px 12px",
                      background: "rgba(124,58,237,0.06)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 8,
                    }}>
                      <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{b.session_name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>{b.booking_date} · {b.time_slot}</div>
                      <div style={{ marginTop: 5 }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: STATUS_COLORS[b.status] ?? "var(--text-muted)",
                          background: `${STATUS_COLORS[b.status] ?? "var(--text-muted)"}18`,
                          border: `1px solid ${STATUS_COLORS[b.status] ?? "var(--text-muted)"}44`,
                        }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
