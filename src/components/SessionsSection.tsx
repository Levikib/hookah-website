"use client";
import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { SESSIONS, CUSTOM_PRICING } from "@/data/sessions";
import { useStore } from "@/store/useStore";

const SESSION_EMOJIS: Record<string, string> = {
  solo: "🌙",
  duo: "🔥",
  squad: "⚡",
  vip: "👑",
  rooftop: "🏙️",
  corporate: "🤝",
  wedding: "💍",
  custom: "🎨",
};

function SessionCard({ session, onBook }: { session: typeof SESSIONS[0]; onBook: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [8, -8]);
  const rotateY = useTransform(x, [-80, 80], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const accent = session.color;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800, cursor: "pointer" }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        className="glass"
        style={{
          padding: "28px 24px",
          borderTop: `2px solid ${accent}`,
          position: "relative",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {session.popular && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--orange)", border: "1px solid var(--orange)",
            padding: "3px 10px", borderRadius: 4,
            animation: "pulse-red 2s infinite",
          }}>
            Most Popular
          </div>
        )}

        <div style={{ fontSize: 36, marginBottom: 14, lineHeight: 1 }}>
          {SESSION_EMOJIS[session.id] ?? "🌿"}
        </div>

        <h3 style={{
          fontFamily: "var(--font-bebas)", fontSize: 28,
          color: "#fff", letterSpacing: "0.04em",
          textTransform: "uppercase", marginBottom: 6, lineHeight: 1,
        }}>
          {session.name}
        </h3>

        <p style={{
          fontFamily: "var(--font-barlow)", fontSize: 14,
          color: "rgba(255,255,255,0.55)", marginBottom: 18, lineHeight: 1.4,
        }}>
          {session.tagline}
        </p>

        <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
          {[
            { label: "People", value: session.people },
            { label: "Duration", value: session.duration },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: 2,
              }}>
                {label}
              </p>
              <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Equipment chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20, flex: 1 }}>
          {session.equipment.slice(0, 3).map((eq) => (
            <span key={eq} style={{
              fontFamily: "var(--font-barlow)", fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.06)",
              padding: "3px 10px", borderRadius: 20,
            }}>
              {eq}
            </span>
          ))}
          {session.equipment.length > 3 && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              padding: "3px 8px",
            }}>
              +{session.equipment.length - 3} more
            </span>
          )}
        </div>

        {!session.isCustom && (
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 26,
            color: accent, fontWeight: 700, marginBottom: 20,
          }}>
            ${session.price.toFixed(2)}
          </p>
        )}
        {session.isCustom && (
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 18,
            color: accent, marginBottom: 20,
          }}>
            Priced for you
          </p>
        )}

        <button
          onClick={onBook}
          className="btn-teal"
          style={{ width: "100%", fontSize: 14 }}
        >
          {session.isCustom ? "Get a Quote" : "Book Now"}
        </button>
      </div>
    </motion.div>
  );
}

function CustomBuilder() {
  const [hookahs, setHookahs] = useState(1);
  const [people, setPeople] = useState(4);
  const [flavours, setFlavours] = useState(2);
  const [hours, setHours] = useState(2);
  const [hosts, setHosts] = useState(0);
  const [catering, setCatering] = useState(false);
  const [delivery, setDelivery] = useState(false);

  const total =
    CUSTOM_PRICING.base +
    hookahs * CUSTOM_PRICING.perHookah +
    people * CUSTOM_PRICING.perPerson +
    flavours * CUSTOM_PRICING.perFlavour +
    Math.max(0, hours - 1) * CUSTOM_PRICING.extraHour +
    hosts * hours * CUSTOM_PRICING.hostPerHour +
    (catering ? people * CUSTOM_PRICING.cateringPerPerson : 0) +
    (delivery ? CUSTOM_PRICING.delivery : 0);

  const sliders = [
    { label: "Hookahs", value: hookahs, set: setHookahs, min: 1, max: 10 },
    { label: "People",  value: people,  set: setPeople,  min: 1, max: 100 },
    { label: "Flavours",value: flavours,set: setFlavours,min: 1, max: 10 },
    { label: "Hours",   value: hours,   set: setHours,   min: 1, max: 12 },
    { label: "Hosts",   value: hosts,   set: setHosts,   min: 0, max: 5 },
  ];

  return (
    <div className="glass" style={{
      padding: "40px 36px",
      borderTop: "2px solid var(--teal)",
      maxWidth: 680, margin: "64px auto 0",
    }}>
      <h3 style={{
        fontFamily: "var(--font-bebas)", fontSize: 36,
        color: "#fff", letterSpacing: "0.04em",
        textTransform: "uppercase", marginBottom: 8,
      }}>
        Custom Session Builder
      </h3>
      <p style={{
        fontFamily: "var(--font-barlow)", fontSize: 16,
        color: "rgba(255,255,255,0.55)", marginBottom: 32,
      }}>
        Build your perfect session. Price updates live.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sliders.map(({ label, value, set, min, max }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                {label}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--teal)" }}>
                {value}
              </span>
            </div>
            <input
              type="range" min={min} max={max} value={value}
              onChange={(e) => set(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--teal)", height: 4, cursor: "pointer" }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: `Catering (+$${(people * CUSTOM_PRICING.cateringPerPerson).toFixed(0)})`, val: catering, set: setCatering },
            { label: `Delivery (+$${CUSTOM_PRICING.delivery})`, val: delivery, set: setDelivery },
          ].map(({ label, val, set }) => (
            <button
              key={label}
              onClick={() => set(!val)}
              style={{
                fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 13,
                padding: "8px 20px", borderRadius: 8,
                border: val ? "1px solid var(--teal)" : "1px solid rgba(255,255,255,0.15)",
                background: val ? "rgba(0,245,212,0.12)" : "rgba(255,255,255,0.04)",
                color: val ? "var(--teal)" : "rgba(255,255,255,0.5)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {val ? "✓ " : ""}{label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 32, padding: "20px 24px",
        background: "rgba(0,245,212,0.06)",
        borderRadius: 12, border: "1px solid rgba(0,245,212,0.2)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.15em", color: "var(--teal)",
            textTransform: "uppercase", marginBottom: 4,
          }}>
            Estimated Total
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 36, color: "#fff", fontWeight: 700 }}>
            ${total.toFixed(2)}
          </p>
        </div>
        <button className="btn-teal" style={{ fontSize: 14 }}>
          Request Quote
        </button>
      </div>
    </div>
  );
}

export default function SessionsSection() {
  const setBookingOpen = useStore((s) => s.setBookingOpen);
  return (
    <section style={{ background: "var(--black)", padding: "100px 0 120px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 5vw" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.2em", color: "var(--teal)",
            textTransform: "uppercase", marginBottom: 16,
          }}>
            8 tiers · every occasion
          </p>
          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(48px, 6vw, 80px)",
            color: "#fff", letterSpacing: "0.04em",
            textTransform: "uppercase", lineHeight: 0.95,
          }}>
            Choose Your<br />
            <span style={{ color: "var(--gold)" }}>Session.</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {SESSIONS.filter((s) => !s.isCustom).map((s) => (
            <SessionCard key={s.id} session={s} onBook={() => setBookingOpen(true)} />
          ))}
        </div>

        <CustomBuilder />
      </div>
    </section>
  );
}
