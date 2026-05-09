"use client";
import { useState } from "react";
import type { SessionTier } from "@/data/sessions";
import type { RentalModel } from "@/data/rentals";
import type { Flavour } from "@/data/flavours";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

type Tab = "sessions" | "pricing" | "rentals" | "flavours" | "business";

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 20px", minHeight: 40, borderRadius: 8,
      background: active ? "var(--violet)" : "transparent",
      color: active ? "#fff" : "var(--text-muted)",
      border: `1px solid ${active ? "var(--violet)" : "var(--glass-border)"}`,
      fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em",
      textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s",
    }}>{label}</button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text" }: { value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", minHeight: 40, background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--glass-border)", borderRadius: 8,
        padding: "8px 12px", color: "var(--text-primary)", fontSize: 14,
        fontFamily: "var(--font-barlow), sans-serif", outline: "none",
      }}
    />
  );
}

function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      style={{
        padding: "10px 24px", minHeight: 44, borderRadius: 8,
        background: saved ? "#22c55e" : "var(--electric)", color: "#05030a",
        border: "none", fontFamily: "var(--font-bebas), sans-serif",
        fontSize: 15, letterSpacing: "0.1em", cursor: saving ? "not-allowed" : "pointer",
        transition: "background 0.2s",
      }}>
      {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE CHANGES"}
    </button>
  );
}

export default function SettingsClient({
  sessions, customPricing, rentals, flavours,
}: {
  sessions: SessionTier[];
  customPricing: Record<string, number>;
  rentals: RentalModel[];
  flavours: Flavour[];
}) {
  const [tab, setTab] = useState<Tab>("sessions");
  const [editSessions, setEditSessions] = useState(sessions.map(s => ({ ...s })));
  const [editPricing, setEditPricing] = useState({ ...customPricing });
  const [editRentals, setEditRentals] = useState(rentals.map(r => ({ ...r })));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Business config state
  const [businessConfig, setBusinessConfig] = useState({
    businessName: "HKH Hookah",
    phone: "+254 700 000 000",
    email: "hello@hkh.co",
    address: "Nairobi, Kenya",
    openingTime: "10:00",
    closingTime: "23:00",
    deliveryFee: "2000",
    minOrderAmount: "0",
    maxAdvanceBookingDays: "30",
    bookingBuffer: "60",
    lowStockThreshold: "20",
  });

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const TIERS = ["Standard", "Premium", "Luxury", "Event"] as const;

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {(["sessions", "pricing", "rentals", "flavours", "business"] as Tab[]).map(t => (
          <TabBtn key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      {/* SESSIONS TAB */}
      {tab === "sessions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Edit session names, pricing, duration, and capacity. Changes here reflect on the booking flow.</p>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {editSessions.filter(s => !s.isCustom).map((session, i) => (
              <div key={session.id} style={{ background: "var(--nebula)", border: `1px solid ${session.color}33`, borderRadius: 14, padding: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: session.color }} />
                <div style={{ paddingLeft: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 28 }}>{session.emoji}</span>
                    <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em" }}>{session.name}</div>
                    {session.popular && <span style={{ padding: "2px 8px", background: "rgba(237,255,102,0.12)", border: "1px solid rgba(237,255,102,0.3)", borderRadius: 20, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--electric)", letterSpacing: "0.08em" }}>POPULAR</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px,100%), 1fr))", gap: 16 }}>
                    <Field label="Name">
                      <Input value={editSessions[i].name} onChange={v => setEditSessions(prev => prev.map((s, j) => j === i ? { ...s, name: v } : s))} />
                    </Field>
                    <Field label="Price (KES)">
                      <Input type="number" value={editSessions[i].price} onChange={v => setEditSessions(prev => prev.map((s, j) => j === i ? { ...s, price: parseInt(v) || 0 } : s))} />
                    </Field>
                    <Field label="Duration">
                      <Input value={editSessions[i].duration} onChange={v => setEditSessions(prev => prev.map((s, j) => j === i ? { ...s, duration: v } : s))} />
                    </Field>
                    <Field label="People">
                      <Input value={String(editSessions[i].people)} onChange={v => setEditSessions(prev => prev.map((s, j) => j === i ? { ...s, people: parseInt(v) || v } : s))} />
                    </Field>
                    <Field label="Tagline">
                      <Input value={editSessions[i].tagline} onChange={v => setEditSessions(prev => prev.map((s, j) => j === i ? { ...s, tagline: v } : s))} />
                    </Field>
                    <Field label="Mood">
                      <Input value={editSessions[i].mood} onChange={v => setEditSessions(prev => prev.map((s, j) => j === i ? { ...s, mood: v } : s))} />
                    </Field>
                  </div>
                  <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(237,255,102,0.06)", border: "1px solid rgba(237,255,102,0.15)", borderRadius: 8, fontSize: 14, color: "var(--electric)", fontWeight: 700 }}>
                    Current Price: {kes(editSessions[i].price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
        </div>
      )}

      {/* PRICING TAB */}
      {tab === "pricing" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Custom package wizard pricing components.</p>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
          <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--electric)", letterSpacing: "0.06em", marginBottom: 20 }}>CUSTOM BUILD PRICING</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px,100%), 1fr))", gap: 20 }}>
              {Object.entries(editPricing).map(([key, val]) => (
                <Field key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}>
                  <Input type="number" value={val} onChange={v => setEditPricing(p => ({ ...p, [key]: parseInt(v) || 0 }))} />
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{kes(editPricing[key])}</div>
                </Field>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENTALS TAB */}
      {tab === "rentals" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Edit rental model details, rates, and availability.</p>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {editRentals.map((rental, i) => (
              <div key={rental.id} style={{ background: "var(--nebula)", border: `1px solid ${rental.accentColor}33`, borderRadius: 14, padding: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: rental.accentColor }} />
                <div style={{ paddingLeft: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em" }}>{rental.name}</div>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontFamily: "var(--font-mono)", color: rental.accentColor, background: `${rental.accentColor}18`, border: `1px solid ${rental.accentColor}44` }}>{rental.tier}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px,100%), 1fr))", gap: 16 }}>
                    <Field label="Name">
                      <Input value={editRentals[i].name} onChange={v => setEditRentals(prev => prev.map((r, j) => j === i ? { ...r, name: v } : r))} />
                    </Field>
                    <Field label="Tagline">
                      <Input value={editRentals[i].tagline} onChange={v => setEditRentals(prev => prev.map((r, j) => j === i ? { ...r, tagline: v } : r))} />
                    </Field>
                    <Field label="Daily Rate (KES)">
                      <Input type="number" value={editRentals[i].dailyRate} onChange={v => setEditRentals(prev => prev.map((r, j) => j === i ? { ...r, dailyRate: parseInt(v) || 0 } : r))} />
                    </Field>
                    <Field label="Session Rate (KES)">
                      <Input type="number" value={editRentals[i].sessionRate} onChange={v => setEditRentals(prev => prev.map((r, j) => j === i ? { ...r, sessionRate: parseInt(v) || 0 } : r))} />
                    </Field>
                    <Field label="Available Units">
                      <Input type="number" value={editRentals[i].available} onChange={v => setEditRentals(prev => prev.map((r, j) => j === i ? { ...r, available: parseInt(v) || 0 } : r))} />
                    </Field>
                    <Field label="Tier">
                      <select value={editRentals[i].tier} onChange={e => setEditRentals(prev => prev.map((r, j) => j === i ? { ...r, tier: e.target.value as RentalModel["tier"] } : r))}
                        style={{ width: "100%", minHeight: 40, background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 14, outline: "none" }}>
                        {TIERS.map(t => <option key={t} value={t} style={{ background: "#0d0a1e" }}>{t}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLAVOURS TAB */}
      {tab === "flavours" && (
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>Flavour catalogue overview. Edit stock levels in the Inventory section.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px,100%), 1fr))", gap: 12 }}>
            {flavours.map(f => (
              <div key={f.id} style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 12, padding: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: f.color }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{f.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{f.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{f.category}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.description}</div>
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["50g", "100g", "250g"] as const).map(size => (
                    <span key={size} style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontFamily: "var(--font-mono)", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "var(--violet-bright)" }}>
                      {size} · {kes(f.price)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUSINESS TAB */}
      {tab === "business" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>General business configuration and operational settings.</p>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(360px,100%), 1fr))", gap: 20 }}>
            {/* Business Info */}
            <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
              <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--electric)", letterSpacing: "0.06em", marginBottom: 20 }}>BUSINESS INFO</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(["businessName", "phone", "email", "address"] as const).map(k => (
                  <Field key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}>
                    <Input value={businessConfig[k]} onChange={v => setBusinessConfig(p => ({ ...p, [k]: v }))} />
                  </Field>
                ))}
              </div>
            </div>

            {/* Operations */}
            <div style={{ background: "var(--nebula)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: 24 }}>
              <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "var(--cyan-bright)", letterSpacing: "0.06em", marginBottom: 20 }}>OPERATIONS</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Opening Time">
                    <Input type="time" value={businessConfig.openingTime} onChange={v => setBusinessConfig(p => ({ ...p, openingTime: v }))} />
                  </Field>
                  <Field label="Closing Time">
                    <Input type="time" value={businessConfig.closingTime} onChange={v => setBusinessConfig(p => ({ ...p, closingTime: v }))} />
                  </Field>
                </div>
                <Field label="Delivery Fee (KES)">
                  <Input type="number" value={businessConfig.deliveryFee} onChange={v => setBusinessConfig(p => ({ ...p, deliveryFee: v }))} />
                </Field>
                <Field label="Min Order Amount (KES)">
                  <Input type="number" value={businessConfig.minOrderAmount} onChange={v => setBusinessConfig(p => ({ ...p, minOrderAmount: v }))} />
                </Field>
                <Field label="Max Advance Booking (days)">
                  <Input type="number" value={businessConfig.maxAdvanceBookingDays} onChange={v => setBusinessConfig(p => ({ ...p, maxAdvanceBookingDays: v }))} />
                </Field>
                <Field label="Booking Buffer (minutes)">
                  <Input type="number" value={businessConfig.bookingBuffer} onChange={v => setBusinessConfig(p => ({ ...p, bookingBuffer: v }))} />
                </Field>
                <Field label="Low Stock Threshold">
                  <Input type="number" value={businessConfig.lowStockThreshold} onChange={v => setBusinessConfig(p => ({ ...p, lowStockThreshold: v }))} />
                </Field>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ background: "var(--nebula)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 24 }}>
              <h2 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18, color: "#ef4444", letterSpacing: "0.06em", marginBottom: 16 }}>DANGER ZONE</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
                These actions are irreversible. Proceed with caution.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Export All Bookings (CSV)", action: "#" },
                  { label: "Export All Orders (CSV)", action: "#" },
                  { label: "Export Customers (CSV)", action: "#" },
                ].map(({ label }) => (
                  <button key={label} style={{ padding: "10px 16px", minHeight: 44, borderRadius: 8, background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textAlign: "left", cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
