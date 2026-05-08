"use client";
import AnimatedTitle from "./AnimatedTitle";
import { useState } from "react";
import { RENTAL_MODELS as RENTALS } from "@/data/rentals";
import { useStore } from "@/store/useStore";

const TIER_COLORS: Record<string, string> = {
  Standard: "var(--teal)",
  Premium:  "var(--gold)",
  Luxury:   "var(--purple)",
  Event:    "var(--orange)",
};

function RentalCard({ rental, active, onSelect }: {
  rental: typeof RENTALS[0];
  active: boolean;
  onSelect: () => void;
}) {
  const addToCart = useStore((s) => s.addToCart);
  const accent = TIER_COLORS[rental.tier] ?? "var(--teal)";

  const handleReserve = () => {
    addToCart({
      id: `rental-${rental.id}`,
      type: "rental",
      name: `${rental.name} Hookah (1 day)`,
      price: rental.dailyRate,
      quantity: 1,
    });
  };

  return (
    <div
      onClick={onSelect}
      style={{
        flex: "0 0 auto",
        width: active ? 340 : 260,
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        cursor: "pointer",
        opacity: active ? 1 : 0.55,
        transform: active ? "scale(1.04)" : "scale(0.96)",
      }}
    >
      <div
        className="glass"
        style={{
          borderTop: `3px solid ${accent}`,
          padding: "28px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow accent */}
        {active && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 80,
              background: `linear-gradient(to bottom, ${accent}22, transparent)`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Tier badge */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: accent,
            border: `1px solid ${accent}`,
            padding: "3px 10px",
            borderRadius: 4,
            marginBottom: 16,
            display: "inline-block",
          }}
        >
          {rental.tier}
        </span>

        {/* Hookah visual placeholder — coloured silhouette */}
        <div
          style={{
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg viewBox="0 0 80 160" width={active ? 80 : 60} fill="none">
            {/* Bowl */}
            <ellipse cx="40" cy="18" rx="22" ry="10" fill={accent} opacity="0.7" />
            {/* Shaft */}
            <rect x="36" y="28" width="8" height="70" fill={accent} opacity="0.5" rx="4" />
            {/* Base */}
            <ellipse cx="40" cy="110" rx="30" ry="14" fill={accent} opacity="0.65" />
            {/* Plate */}
            <ellipse cx="40" cy="88" rx="18" ry="6" fill={accent} opacity="0.45" />
            {/* Hose */}
            <path d="M48 70 Q70 70 72 90 Q74 110 60 115" stroke={accent} strokeWidth="5"
              strokeLinecap="round" fill="none" opacity="0.5" />
            {/* Mouthpiece */}
            <circle cx="60" cy="116" r="5" fill={accent} opacity="0.6" />
          </svg>
        </div>

        {/* Name */}
        <h3
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: active ? 28 : 22,
            color: "#fff",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
            lineHeight: 1,
            transition: "font-size 0.3s",
          }}
        >
          {rental.name}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-barlow)",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            marginBottom: active ? 16 : 0,
            lineHeight: 1.4,
            overflow: "hidden",
            maxHeight: active ? 60 : 0,
            transition: "max-height 0.3s, opacity 0.3s",
            opacity: active ? 1 : 0,
          }}
        >
          {rental.tagline}
        </p>

        {active && (
          <>
            {/* Specs */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Height", value: rental.height },
                { label: "Material", value: rental.material },
                { label: "Hose", value: rental.hoseType },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 13, color: "#fff" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Daily</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: accent, fontWeight: 700 }}>
                  ${rental.dailyRate}/day
                </p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Session</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
                  ${rental.sessionRate}/session
                </p>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleReserve(); }}
              className="btn-teal"
              style={{ width: "100%", fontSize: 14 }}
            >
              Reserve This Model
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function RentalsSection() {
  const [activeIdx, setActiveIdx] = useState(2); // default to middle

  return (
    <section
      id="rentals"
      style={{
        background: "var(--nebula)",
        padding: "100px 0 120px",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 60, padding: "0 5vw" }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.2em", color: "var(--purple)",
          textTransform: "uppercase", marginBottom: 16,
        }}>
          6 models · every style
        </p>
        <AnimatedTitle
          text={"The Showroom.\nPick Your Piece."}
          as="h2"
          start="top 85%"
          style={{
            fontSize: "clamp(48px, 6vw, 80px)",
            lineHeight: 0.95,
            letterSpacing: "0.04em",
            color: "var(--text-primary)",
          }}
        />
        <style>{`
          .rentals-title div:last-child .animated-word { color: var(--violet-bright); }
        `}</style>
      </div>

      {/* Horizontal carousel */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "20px 5vw",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {RENTALS.map((rental, i) => (
          <RentalCard
            key={rental.id}
            rental={rental}
            active={i === activeIdx}
            onSelect={() => setActiveIdx(i)}
          />
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
        {RENTALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              width: i === activeIdx ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === activeIdx ? "var(--purple)" : "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
