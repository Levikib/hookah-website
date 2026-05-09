"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { RENTAL_MODELS, type RentalModel } from "@/data/rentals";
import { FLAVOURS, getStockStatus } from "@/data/flavours";
import { SESSIONS } from "@/data/sessions";
import { useStore } from "@/store/useStore";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }
function hexRgb(hex: string) {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = ["occasion", "hookah", "flavours", "addons", "review"] as const;
type Step = (typeof STEPS)[number];

const STEP_META: Record<Step, { label: string; hint: string; icon: string }> = {
  occasion: { label: "Occasion",  hint: "What's the vibe?",           icon: "🎭" },
  hookah:   { label: "Piece",     hint: "Pick your weapon",           icon: "🪬" },
  flavours: { label: "Flavours",  hint: "Load the bowl",              icon: "🧪" },
  addons:   { label: "Add-ons",   hint: "Extras that hit different",  icon: "✨" },
  review:   { label: "Review",    hint: "Your formula",               icon: "📋" },
};

// ─── Add-ons catalogue ────────────────────────────────────────────────────────
interface Addon {
  id: string;
  name: string;
  desc: string;
  price: number;
  emoji: string;
  popular?: boolean;
}

const ADDONS: Addon[] = [
  { id: "coals",    name: "Premium Coals",      desc: "Long-burning coconut coals, 24-pack", price: 800,  emoji: "🪨", popular: true },
  { id: "delivery", name: "Setup & Delivery",   desc: "We bring it, set it up, you enjoy",   price: 1500, emoji: "🚚", popular: true },
  { id: "photos",   name: "Photo Setup",        desc: "Ring light + backdrop for the moment", price: 2500, emoji: "📸" },
  { id: "flavour2", name: "Second Flavour Mix", desc: "Layer a second blend into your bowl",  price: 600,  emoji: "🌀" },
  { id: "ice",      name: "Ice Tray Cooling",   desc: "Chilled base for smoother pulls",      price: 400,  emoji: "🧊" },
  { id: "mouthpieces", name: "Hygiene Kit",     desc: "Personal mouthpieces for each guest",  price: 350,  emoji: "🦷" },
  { id: "charcoal", name: "Charcoal Service",   desc: "Attendant manages your coals all session", price: 1200, emoji: "🔥" },
  { id: "hookahbag",name: "Carry Bag",          desc: "Padded hookah transport bag",          price: 900,  emoji: "👜" },
];

// ─── Duration options ─────────────────────────────────────────────────────────
const DURATIONS = [
  { label: "2 hrs", hours: 2, mult: 1 },
  { label: "4 hrs", hours: 4, mult: 1.7 },
  { label: "Full Day", hours: 10, mult: 3.0 },
  { label: "Full Weekend", hours: 48, mult: 5.5 },
];

// ─── Tiny animated hookah icon for each model ─────────────────────────────────
function MiniHookah({ color }: { color: string }) {
  const rgb = hexRgb(color);
  return (
    <svg viewBox="0 0 36 80" width="36" height="80" style={{ overflow: "visible" }}>
      {/* Bowl */}
      <ellipse cx="18" cy="10" rx="10" ry="6" fill={`rgba(${rgb},0.6)`} stroke={`rgba(${rgb},0.9)`} strokeWidth="1.2" />
      <ellipse cx="18" cy="7" rx="7" ry="4" fill={`rgba(${rgb},0.4)`} />
      {/* Shaft */}
      <rect x="16" y="15" width="4" height="35" rx="2" fill={`rgba(${rgb},0.5)`} />
      {/* Base */}
      <ellipse cx="18" cy="50" rx="12" ry="5" fill={`rgba(${rgb},0.4)`} stroke={`rgba(${rgb},0.7)`} strokeWidth="1" />
      <ellipse cx="18" cy="54" rx="9" ry="3.5" fill={`rgba(${rgb},0.3)`} />
      {/* Hose port */}
      <line x1="22" y1="32" x2="32" y2="38" stroke={`rgba(${rgb},0.6)`} strokeWidth="2" strokeLinecap="round" />
      {/* Smoke */}
      <text x="18" y="4" textAnchor="middle" fontSize="6" opacity="0.6" style={{ animation: "rise 2s ease-out infinite" }}>~</text>
    </svg>
  );
}

// ─── Step: Occasion ──────────────────────────────────────────────────────────
const OCCASIONS = [
  { id: "solo",       label: "Solo Session",      emoji: "🧘", desc: "Just me, my thoughts, and the smoke",      guests: "1"     },
  { id: "duo",        label: "Date Night",        emoji: "💫", desc: "Two of us, one bowl, good energy",         guests: "2"     },
  { id: "squad",      label: "Squad Goals",       emoji: "🔥", desc: "Group of friends, big vibes, louder laughs", guests: "3–8" },
  { id: "rooftop",    label: "Rooftop Sesh",      emoji: "🌇", desc: "Sunset views, good music, great company",  guests: "5–15"  },
  { id: "corporate",  label: "Corporate Event",   emoji: "🎯", desc: "Client entertainment, premium setup required", guests: "10–50" },
  { id: "wedding",    label: "Wedding / Event",   emoji: "💍", desc: "The big day deserves the biggest setup",   guests: "50+"   },
  { id: "birthday",   label: "Birthday Party",    emoji: "🎂", desc: "Because one hookah isn't enough tonight",  guests: "10–30" },
  { id: "custom",     label: "Something Custom",  emoji: "🎭", desc: "Tell us what you need and we'll build it", guests: "Any"   },
];

function StepOccasion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "rgba(240,235,255,0.55)", marginBottom: 28 }}>
        Every great session starts with knowing the occasion.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {OCCASIONS.map(occ => {
          const active = value === occ.id;
          return (
            <button key={occ.id} onClick={() => onChange(occ.id)} style={{
              padding: "16px 18px", borderRadius: 14, textAlign: "left",
              border: active ? "1.5px solid rgba(124,58,237,0.9)" : "1.5px solid rgba(255,255,255,0.08)",
              background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: active ? "0 0 24px rgba(124,58,237,0.25), inset 0 1px 0 rgba(157,92,245,0.2)" : "none",
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{occ.emoji}</div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 18, letterSpacing: "0.04em", color: active ? "#c4b5fd" : "#f0f2fa", marginBottom: 4 }}>{occ.label}</div>
              <div style={{ fontFamily: "var(--font-barlow)", fontSize: 12, color: "rgba(200,195,230,0.5)", lineHeight: 1.5, marginBottom: 6 }}>{occ.desc}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: active ? "rgba(167,139,250,0.7)" : "rgba(200,195,230,0.3)" }}>Guests: {occ.guests}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Hookah + Duration ──────────────────────────────────────────────────
function StepHookah({
  model, duration, onModel, onDuration,
}: { model: RentalModel | null; duration: number; onModel: (m: RentalModel) => void; onDuration: (h: number) => void }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "rgba(240,235,255,0.55)", marginBottom: 28 }}>
        The right piece sets the entire tone.
      </p>

      {/* Hookah grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 36 }}>
        {RENTAL_MODELS.map(m => {
          const active = model?.id === m.id;
          const rgb    = hexRgb(m.accentColor);
          return (
            <button key={m.id} onClick={() => onModel(m)} style={{
              padding: "18px 16px", borderRadius: 14, textAlign: "center",
              border: active ? `1.5px solid rgba(${rgb},0.9)` : "1.5px solid rgba(255,255,255,0.07)",
              background: active ? `rgba(${rgb},0.12)` : "rgba(255,255,255,0.02)",
              cursor: "pointer", transition: "all 0.22s ease",
              boxShadow: active ? `0 0 28px rgba(${rgb},0.28)` : "none",
            }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
                <MiniHookah color={m.accentColor} />
              </div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 17, letterSpacing: "0.04em", color: active ? m.accentColor : "#f0f2fa", marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 20, border: `1px solid rgba(${rgb},${active ? 0.7 : 0.3})`, color: active ? m.accentColor : "rgba(200,195,230,0.4)", display: "inline-block", marginBottom: 6 }}>{m.tier}</div>
              <div style={{ fontFamily: "var(--font-barlow)", fontSize: 11, color: "rgba(200,195,230,0.45)", lineHeight: 1.4, marginBottom: 8 }}>{m.tagline}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: active ? m.accentColor : "rgba(200,195,230,0.5)", fontWeight: 700 }}>{kes(m.sessionRate)} / session</div>
            </button>
          );
        })}
      </div>

      {/* Duration */}
      <div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>How long is the session?</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {DURATIONS.map(d => {
            const active = duration === d.hours;
            return (
              <button key={d.hours} onClick={() => onDuration(d.hours)} style={{
                padding: "10px 20px", borderRadius: 10,
                border: active ? "1.5px solid rgba(124,58,237,0.8)" : "1.5px solid rgba(255,255,255,0.08)",
                background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                cursor: "pointer", transition: "all 0.18s ease",
                boxShadow: active ? "0 0 16px rgba(124,58,237,0.2)" : "none",
              }}>
                <div style={{ fontFamily: "var(--font-bebas)", fontSize: 18, letterSpacing: "0.05em", color: active ? "#c4b5fd" : "#f0f2fa" }}>{d.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(200,195,230,0.4)", letterSpacing: "0.08em" }}>×{d.mult} rate</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Flavours ───────────────────────────────────────────────────────────
function StepFlavours({
  selected, onChange,
}: { selected: number[]; onChange: (ids: number[]) => void }) {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(FLAVOURS.map(f => f.category)))];
  const filtered = cat === "All" ? FLAVOURS : FLAVOURS.filter(f => f.category === cat);

  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else if (selected.length < 4) onChange([...selected, id]);
  };

  return (
    <div>
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "rgba(240,235,255,0.55)", marginBottom: 6 }}>
        Pick up to 4 flavours for your session bowl.
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
        {selected.length}/4 selected
      </p>

      {/* Cat filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "5px 12px", borderRadius: 20,
            border: cat === c ? "1px solid rgba(34,211,238,0.7)" : "1px solid rgba(255,255,255,0.08)",
            background: cat === c ? "rgba(34,211,238,0.1)" : "transparent",
            color: cat === c ? "var(--cyan-bright)" : "rgba(200,195,230,0.4)",
            cursor: "pointer", transition: "all 0.15s ease",
          }}>{c === "All" ? "ALL" : c}</button>
        ))}
      </div>

      {/* Flavour grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))", gap: 10, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
        {filtered.map(f => {
          const active  = selected.includes(f.id);
          const isOut   = getStockStatus(f.stock) === "out";
          const rgb     = hexRgb(f.color);
          const maxed   = selected.length >= 4 && !active;
          return (
            <button key={f.id} onClick={() => !isOut && !maxed && toggle(f.id)}
              disabled={isOut || maxed}
              style={{
                padding: "12px", borderRadius: 12, textAlign: "left",
                border: active ? `1.5px solid rgba(${rgb},0.9)` : "1.5px solid rgba(255,255,255,0.06)",
                background: active ? `rgba(${rgb},0.12)` : "rgba(255,255,255,0.02)",
                cursor: isOut || maxed ? "not-allowed" : "pointer",
                opacity: isOut ? 0.35 : maxed ? 0.45 : 1,
                transition: "all 0.18s ease",
                boxShadow: active ? `0 0 18px rgba(${rgb},0.25)` : "none",
                position: "relative",
              }}
            >
              {active && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  width: 20, height: 20, borderRadius: "50%",
                  background: f.color, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: 11, color: "#000", fontWeight: 700,
                }}>✓</div>
              )}
              <div style={{ fontSize: 22, marginBottom: 6 }}>{f.emoji}</div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 15, letterSpacing: "0.04em", color: active ? f.color : "#f0f2fa", marginBottom: 4 }}>{f.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase", color: active ? f.color : "rgba(200,195,230,0.4)", marginBottom: 4 }}>{f.category} · {f.intensity}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: active ? f.color : "rgba(200,195,230,0.5)" }}>{kes(f.price)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Add-ons ────────────────────────────────────────────────────────────
function StepAddons({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div>
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "rgba(240,235,255,0.55)", marginBottom: 28 }}>
        The extras that separate a session from an experience.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {ADDONS.map(addon => {
          const active = selected.includes(addon.id);
          return (
            <button key={addon.id} onClick={() => toggle(addon.id)} style={{
              padding: "16px 18px", borderRadius: 14, textAlign: "left",
              border: active ? "1.5px solid rgba(34,211,238,0.8)" : "1.5px solid rgba(255,255,255,0.07)",
              background: active ? "rgba(34,211,238,0.09)" : "rgba(255,255,255,0.02)",
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: active ? "0 0 20px rgba(34,211,238,0.18)" : "none",
              position: "relative",
            }}>
              {addon.popular && !active && (
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "2px 6px", borderRadius: 20,
                  border: "1px solid rgba(245,158,11,0.5)", color: "rgba(245,158,11,0.8)",
                  background: "rgba(245,158,11,0.08)",
                }}>Popular</div>
              )}
              {active && (
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "var(--cyan-bright)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: 12, color: "#000", fontWeight: 700,
                }}>✓</div>
              )}
              <div style={{ fontSize: 28, marginBottom: 8 }}>{addon.emoji}</div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 17, letterSpacing: "0.04em", color: active ? "var(--cyan-bright)" : "#f0f2fa", marginBottom: 4 }}>{addon.name}</div>
              <div style={{ fontFamily: "var(--font-barlow)", fontSize: 12, color: "rgba(200,195,230,0.5)", lineHeight: 1.5, marginBottom: 8 }}>{addon.desc}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: active ? "var(--cyan-bright)" : "rgba(200,195,230,0.6)", fontWeight: 700 }}>{kes(addon.price)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Review ─────────────────────────────────────────────────────────────
function StepReview({
  occasion, model, durationH, flavourIds, addonIds, onBook,
}: {
  occasion: string;
  model: RentalModel | null;
  durationH: number;
  flavourIds: number[];
  addonIds: string[];
  onBook: () => void;
}) {
  const occ         = OCCASIONS.find(o => o.id === occasion);
  const dur         = DURATIONS.find(d => d.hours === durationH) ?? DURATIONS[0];
  const flavourList = FLAVOURS.filter(f => flavourIds.includes(f.id));
  const addonList   = ADDONS.filter(a => addonIds.includes(a.id));

  const hookahCost  = model ? Math.round(model.sessionRate * dur.mult) : 0;
  const flavourCost = flavourList.reduce((s, f) => s + f.price, 0);
  const addonCost   = addonList.reduce((s, a) => s + a.price, 0);
  const total       = hookahCost + flavourCost + addonCost;

  const lineStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontFamily: "var(--font-mono)" as const, fontSize: 13,
    color: "rgba(220,215,240,0.7)",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Left: summary */}
      <div>
        <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "rgba(240,235,255,0.55)", marginBottom: 24 }}>
          Your custom package is ready. Let's lock it in.
        </p>

        {/* Occasion */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Occasion</div>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: 20, color: "#f0f2fa" }}>{occ ? `${occ.emoji} ${occ.label}` : "—"}</div>
        </div>

        {/* Hookah */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Piece + Duration</div>
          {model ? (
            <div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 20, color: model.accentColor }}>{model.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(200,195,230,0.5)" }}>{dur.label} · {kes(hookahCost)}</div>
            </div>
          ) : <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "rgba(255,100,100,0.6)" }}>No piece selected</div>}
        </div>

        {/* Flavours */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Flavours</div>
          {flavourList.length > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {flavourList.map(f => (
                <span key={f.id} style={{
                  fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 12,
                  padding: "4px 10px", borderRadius: 20,
                  background: `rgba(${hexRgb(f.color)},0.12)`,
                  border: `1px solid rgba(${hexRgb(f.color)},0.35)`,
                  color: f.color,
                }}>{f.emoji} {f.name}</span>
              ))}
            </div>
          ) : <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(200,195,230,0.3)" }}>No flavours selected</div>}
        </div>

        {/* Add-ons */}
        {addonList.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Add-ons</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {addonList.map(a => (
                <span key={a.id} style={{
                  fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 12,
                  padding: "4px 10px", borderRadius: 20,
                  background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.25)",
                  color: "var(--cyan-bright)",
                }}>{a.emoji} {a.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: price breakdown */}
      <div>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "22px 24px",
        }}>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: 18, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase" }}>Price Breakdown</div>

          {model && <div style={lineStyle}><span>Hookah — {dur.label}</span><span>{kes(hookahCost)}</span></div>}
          {flavourList.map(f => (
            <div key={f.id} style={lineStyle}><span>{f.emoji} {f.name}</span><span>{kes(f.price)}</span></div>
          ))}
          {addonList.map(a => (
            <div key={a.id} style={lineStyle}><span>{a.emoji} {a.name}</span><span>{kes(a.price)}</span></div>
          ))}

          {/* Total */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 16, marginTop: 4,
          }}>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Package Total</div>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: 36, color: "var(--electric)", letterSpacing: "0.04em", textShadow: "0 0 24px rgba(237,255,102,0.4)" }}>{kes(total)}</div>
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginTop: 8, marginBottom: 20 }}>
            All-inclusive · Delivery extra if selected
          </div>

          <button
            onClick={onBook}
            disabled={!model || flavourIds.length === 0}
            style={{
              width: "100%", padding: "16px", borderRadius: 12,
              border: "none",
              background: !model || flavourIds.length === 0
                ? "rgba(255,255,255,0.06)"
                : "var(--electric)",
              color: !model || flavourIds.length === 0 ? "rgba(255,255,255,0.2)" : "#05030a",
              fontFamily: "var(--font-bebas)", fontSize: 20,
              letterSpacing: "0.1em", cursor: !model || flavourIds.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.25s ease",
              boxShadow: !model || flavourIds.length === 0 ? "none" : "0 8px 28px rgba(237,255,102,0.3)",
            }}
            onMouseEnter={e => {
              if (model && flavourIds.length > 0) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"}
          >
            {!model ? "Select a piece first" : flavourIds.length === 0 ? "Pick at least 1 flavour" : "CONFIRM & BOOK THIS PACKAGE →"}
          </button>

          {(!model || flavourIds.length === 0) && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,100,100,0.5)", marginTop: 10, textAlign: "center" }}>
              Complete all steps to unlock booking
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, steps, onGoto }: { current: number; steps: typeof STEPS; onGoto: (i: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 48, position: "relative" }}>
      {/* Connecting line */}
      <div style={{
        position: "absolute", top: 18, left: "10%", right: "10%", height: 1,
        background: "rgba(255,255,255,0.08)", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", top: 18, left: "10%", height: 1, zIndex: 1,
        width: `${(current / (steps.length - 1)) * 80}%`,
        background: "linear-gradient(to right, var(--violet), var(--cyan-bright))",
        transition: "width 0.5s ease",
      }} />

      {steps.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        const meta   = STEP_META[step];
        return (
          <button
            key={step}
            onClick={() => i < current && onGoto(i)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              background: "none", border: "none", cursor: i < current ? "pointer" : "default",
              position: "relative", zIndex: 2,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: active ? "2px solid var(--violet-bright)" : done ? "2px solid var(--cyan-bright)" : "2px solid rgba(255,255,255,0.12)",
              background: active ? "rgba(124,58,237,0.25)" : done ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: done ? 14 : 16,
              boxShadow: active ? "0 0 18px rgba(124,58,237,0.4)" : done ? "0 0 12px rgba(34,211,238,0.25)" : "none",
              transition: "all 0.3s ease",
            }}>
              {done ? "✓" : meta.icon}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: active ? "var(--violet-bright)" : done ? "var(--cyan-bright)" : "rgba(255,255,255,0.25)",
              transition: "color 0.3s ease",
            }}>{meta.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
export default function PackageWizard() {
  const [stepIdx, setStepIdx]       = useState(0);
  const [occasion, setOccasion]     = useState("");
  const [model, setModel]           = useState<RentalModel | null>(null);
  const [durationH, setDurationH]   = useState(2);
  const [flavourIds, setFlavourIds] = useState<number[]>([]);
  const [addonIds, setAddonIds]     = useState<string[]>([]);
  const [booked, setBooked]         = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const addToCart  = useStore(s => s.addToCart);
  const setBookingOpen = useStore(s => s.setBookingOpen);

  const step = STEPS[stepIdx];

  const canAdvance = useMemo(() => {
    if (step === "occasion") return !!occasion;
    if (step === "hookah")   return !!model;
    if (step === "flavours") return flavourIds.length > 0;
    return true;
  }, [step, occasion, model, flavourIds]);

  // Animate step change
  const gotoStep = useCallback((idx: number) => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      opacity: 0, x: -30, duration: 0.2, ease: "power2.in",
      onComplete: () => {
        setStepIdx(idx);
        gsap.fromTo(contentRef.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" });
      },
    });
  }, []);

  const next = useCallback(() => {
    if (stepIdx < STEPS.length - 1) gotoStep(stepIdx + 1);
  }, [stepIdx, gotoStep]);

  const back = useCallback(() => {
    if (stepIdx > 0) gotoStep(stepIdx - 1);
  }, [stepIdx, gotoStep]);

  const handleBook = useCallback(() => {
    // Add hookah to cart
    if (model) {
      const dur = DURATIONS.find(d => d.hours === durationH) ?? DURATIONS[0];
      const price = Math.round(model.sessionRate * dur.mult);
      addToCart({ id: `pkg-hookah-${model.id}`, type: "rental", name: `${model.name} (${dur.label})`, price, quantity: 1 });
    }
    // Add flavours
    FLAVOURS.filter(f => flavourIds.includes(f.id)).forEach(f => {
      addToCart({ id: `pkg-flavour-${f.id}`, type: "flavour", name: f.name, price: f.price, quantity: 1 });
    });
    // Add add-ons
    ADDONS.filter(a => addonIds.includes(a.id)).forEach(a => {
      addToCart({ id: `pkg-addon-${a.id}`, type: "addon", name: a.name, price: a.price, quantity: 1 });
    });
    setBooked(true);
    setTimeout(() => setBookingOpen(true), 400);
  }, [model, durationH, flavourIds, addonIds, addToCart, setBookingOpen]);

  // Compute running total for sidebar
  const dur         = DURATIONS.find(d => d.hours === durationH) ?? DURATIONS[0];
  const hookahCost  = model ? Math.round(model.sessionRate * dur.mult) : 0;
  const flavourCost = FLAVOURS.filter(f => flavourIds.includes(f.id)).reduce((s, f) => s + f.price, 0);
  const addonCost   = ADDONS.filter(a => addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const runningTotal = hookahCost + flavourCost + addonCost;

  return (
    <section id="builder" style={{
      background: "var(--nebula)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        #builder { scroll-margin-top: 80px; }
        .wiz-scrollbar::-webkit-scrollbar { width: 3px; }
        .wiz-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .wiz-scrollbar::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.5); border-radius: 2px; }
      `}</style>

      {/* Nebula backdrop */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 60% at 20% 30%, rgba(124,58,237,0.1) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 80% 70%, rgba(6,182,212,0.07) 0%, transparent 60%)",
      }} />

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "clamp(60px,8vw,100px) clamp(16px,4vw,40px) clamp(60px,8vw,100px)",
        position: "relative", zIndex: 1,
      }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <span className="section-label">
            <span style={{ width: 24, height: 1, background: "var(--cyan-bright)", display: "inline-block", marginRight: 8 }} />
            Build Your Package
          </span>
          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(56px,7vw,100px)",
            lineHeight: 0.9, letterSpacing: "0.04em",
            color: "#f0f2fa", marginBottom: 10,
          }}>
            THE<br />
            <span style={{ color: "var(--cyan-bright)", textShadow: "0 0 50px rgba(6,182,212,0.4)" }}>
              FORMULA
            </span>
          </h2>
          <p style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: "clamp(15px,1.8vw,19px)",
            color: "rgba(220,215,255,0.55)", maxWidth: 520,
          }}>
            Design your perfect hookah package step by step. Prices calculate live as you build.
          </p>
        </div>

        {/* Main wizard layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 28, alignItems: "start" }}>

          {/* Left: wizard */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "32px 32px 28px",
          }}>
            <ProgressBar current={stepIdx} steps={STEPS} onGoto={gotoStep} />

            {/* Step title */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>
                Step {stepIdx + 1} of {STEPS.length} · {STEP_META[step].hint}
              </div>
              <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: 32, letterSpacing: "0.04em", color: "#f0f2fa" }}>
                {STEP_META[step].icon} {STEP_META[step].label}
              </h3>
            </div>

            {/* Step content — animated */}
            <div ref={contentRef}>
              {step === "occasion" && <StepOccasion value={occasion} onChange={setOccasion} />}
              {step === "hookah"   && <StepHookah model={model} duration={durationH} onModel={setModel} onDuration={setDurationH} />}
              {step === "flavours" && <StepFlavours selected={flavourIds} onChange={setFlavourIds} />}
              {step === "addons"   && <StepAddons selected={addonIds} onChange={setAddonIds} />}
              {step === "review"   && <StepReview occasion={occasion} model={model} durationH={durationH} flavourIds={flavourIds} addonIds={addonIds} onBook={handleBook} />}
            </div>

            {/* Nav buttons */}
            {step !== "review" && (
              <div style={{ display: "flex", gap: 12, marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {stepIdx > 0 && (
                  <button onClick={back} style={{
                    padding: "12px 24px", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(200,195,230,0.5)",
                    fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12,
                    letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                  }}>← Back</button>
                )}
                <button
                  onClick={next}
                  disabled={!canAdvance}
                  style={{
                    flex: 1, padding: "13px 0", borderRadius: 10,
                    border: "none",
                    background: canAdvance ? "var(--electric)" : "rgba(255,255,255,0.06)",
                    color: canAdvance ? "#05030a" : "rgba(255,255,255,0.2)",
                    fontFamily: "var(--font-bebas)", fontSize: 18,
                    letterSpacing: "0.1em", cursor: canAdvance ? "pointer" : "not-allowed",
                    transition: "all 0.22s ease",
                    boxShadow: canAdvance ? "0 6px 24px rgba(237,255,102,0.25)" : "none",
                  }}
                  onMouseEnter={e => { if (canAdvance) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"}
                >
                  {canAdvance ? `Next: ${STEP_META[STEPS[stepIdx + 1]]?.label ?? "Review"} →` : "Select an option to continue"}
                </button>
              </div>
            )}
          </div>

          {/* Right: live price ticker */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, padding: "24px 20px",
            position: "sticky", top: 100,
          }}>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>Live Price</div>

            {/* Hookah line */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>Hookah</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: model ? "#f0f2fa" : "rgba(255,255,255,0.2)" }}>
                {model ? `${model.name} · ${dur.label}` : "Not selected"}
              </div>
              {hookahCost > 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--violet-bright)", marginTop: 2 }}>{kes(hookahCost)}</div>}
            </div>

            {/* Flavours line */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>Flavours ({flavourIds.length})</div>
              {flavourIds.length > 0 ? (
                <>
                  {FLAVOURS.filter(f => flavourIds.includes(f.id)).map(f => (
                    <div key={f.id} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: f.color, marginBottom: 2 }}>{f.emoji} {f.name}</div>
                  ))}
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--violet-bright)", marginTop: 4 }}>{kes(flavourCost)}</div>
                </>
              ) : <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>None selected</div>}
            </div>

            {/* Add-ons line */}
            {addonIds.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>Add-ons ({addonIds.length})</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cyan-bright)" }}>{kes(addonCost)}</div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "16px 0" }} />

            {/* Total */}
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Package Total</div>
            <div style={{
              fontFamily: "var(--font-bebas)", fontSize: 32, lineHeight: 1,
              color: runningTotal > 0 ? "var(--electric)" : "rgba(255,255,255,0.15)",
              textShadow: runningTotal > 0 ? "0 0 20px rgba(237,255,102,0.35)" : "none",
              transition: "all 0.35s ease",
            }}>{runningTotal > 0 ? kes(runningTotal) : "—"}</div>

            {/* Step dots */}
            <div style={{ display: "flex", gap: 6, marginTop: 24 }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= stepIdx ? "var(--violet-bright)" : "rgba(255,255,255,0.08)",
                  transition: "background 0.3s ease",
                }} />
              ))}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
              {stepIdx + 1} / {STEPS.length} steps complete
            </div>
          </div>
        </div>

        {/* Booked confirmation */}
        {booked && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(4,2,12,0.9)", backdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
              <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: 48, color: "var(--electric)", letterSpacing: "0.04em", marginBottom: 12 }}>Package Built!</h3>
              <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "rgba(240,235,255,0.6)" }}>Opening checkout now...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
