"use client";
import { useState, useMemo } from "react";
import { FLAVOURS, CATEGORIES, type Flavour } from "@/data/flavours";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";
import CardRow from "@/components/CardRow";

type Size = "50g" | "100g" | "250g";

const SIZE_OPTIONS: { label: Size; mult: number; desc: string }[] = [
  { label: "50g",  mult: 1,   desc: "1–2 sessions" },
  { label: "100g", mult: 1.7, desc: "3–5 sessions" },
  { label: "250g", mult: 3.8, desc: "The stash"    },
];

function calcPrice(base: number, size: Size): number {
  const opt = SIZE_OPTIONS.find((s) => s.label === size)!;
  return Math.round(base * opt.mult);
}
function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

const CATEGORY_BANNER: Record<string, string> = {
  "Mint Family": "/images/flavours/mint-family.jpg",
  "Signature": "/images/flavours/signature.jpg",
  "Tropical": "/images/flavours/tropical.jpg",
};

// ── Est. badge — visible flag for placeholder pricing ─────────────────────
function EstBadge() {
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 8,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "rgba(255,200,120,0.85)",
      border: "1px solid rgba(255,200,120,0.35)",
      background: "rgba(255,180,80,0.08)",
      borderRadius: 999,
      padding: "2px 7px",
    }}>
      Est.
    </span>
  );
}

// ── PS5-style product card ─────────────────────────────────────────────────
function FlavourCard({ flavour, onOpen }: { flavour: Flavour; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{
        flex: "0 0 auto",
        width: "min(220px, 42vw)",
        minWidth: 200,
        textAlign: "left",
        background: "var(--sv-charcoal)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
        scrollSnapAlign: "start",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(225,29,46,0.5)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
    >
      {/* glow accent */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 100, height: 100,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${flavour.color}33 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 30 }}>{flavour.emoji}</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999,
          padding: "2px 8px",
        }}>
          {flavour.intensity}
        </span>
      </div>

      <h4 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: 20,
        letterSpacing: "0.03em",
        color: "var(--text-primary)",
        lineHeight: 1.1,
        marginBottom: 4,
      }}>
        {flavour.name}
      </h4>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--sv-red-bright)",
        marginBottom: 10,
      }}>
        {flavour.category}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--sv-gold)" }}>
          {kes(flavour.price)}
        </span>
        {flavour.priceEstimated && <EstBadge />}
      </div>
    </button>
  );
}

// ── PS5-style detail panel ─────────────────────────────────────────────────
function FlavourDetail({ flavour, onClose }: { flavour: Flavour; onClose: () => void }) {
  const [size, setSize] = useState<Size>("50g");
  const [added, setAdded] = useState(false);
  const addToCart = useStore((s) => s.addToCart);

  const price = calcPrice(flavour.price, size);

  const handleAdd = () => {
    addToCart({
      id: `flavour-${flavour.id}-${size}`,
      type: "flavour",
      name: `${flavour.name} (${size})`,
      price,
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 900);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(4,2,4,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div style={{
        width: "min(560px, 96vw)",
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        background: "linear-gradient(160deg, var(--sv-charcoal) 0%, var(--sv-black) 100%)",
        border: `1.5px solid ${flavour.color}55`,
        borderRadius: 20,
        boxShadow: `0 32px 80px rgba(0,0,0,0.85), 0 0 60px ${flavour.color}22`,
        position: "relative",
      }}>
        <div style={{ height: 3, background: `linear-gradient(to right, transparent, ${flavour.color}, transparent)` }} />

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            width: 44, height: 44, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.6)", fontSize: 20, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Close"
        >×</button>

        <div style={{ padding: "32px 28px 20px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 20,
              border: `1px solid ${flavour.color}88`, color: flavour.color, background: `${flavour.color}18`,
            }}>{flavour.category}</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)",
            }}>{flavour.intensity}</span>
          </div>

          <h2 style={{
            fontFamily: "var(--font-bebas)", fontSize: 40, letterSpacing: "0.03em",
            color: "var(--text-primary)", lineHeight: 1, marginBottom: 10,
          }}>
            {flavour.name} <span style={{ fontSize: 32 }}>{flavour.emoji}</span>
          </h2>
          <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, lineHeight: 1.6, color: "rgba(240,240,245,0.65)" }}>
            {flavour.description}
          </p>
        </div>

        <div style={{ padding: "0 28px 20px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Tasting Notes
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {flavour.notes.map((n) => (
              <span key={n} style={{
                fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 12,
                padding: "5px 12px", borderRadius: 24, background: `${flavour.color}18`,
                border: `1px solid ${flavour.color}44`, color: "var(--text-primary)",
              }}>{n}</span>
            ))}
          </div>
          {flavour.pairsWith.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Pairs with</span>
              {flavour.pairsWith.map((p) => (
                <span key={p} style={{
                  fontFamily: "var(--font-barlow)", fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(220,220,230,0.55)",
                }}>+ {p}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 28px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Choose Size
            </p>
            {flavour.priceEstimated && <EstBadge />}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {SIZE_OPTIONS.map(({ label, desc }) => {
              const szPrice = calcPrice(flavour.price, label);
              const active = size === label;
              return (
                <button
                  key={label}
                  onClick={() => setSize(label)}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 12, textAlign: "center",
                    minHeight: 44,
                    border: active ? `1.5px solid ${flavour.color}` : "1.5px solid rgba(255,255,255,0.1)",
                    background: active ? `${flavour.color}22` : "rgba(255,255,255,0.03)",
                    cursor: "pointer", transition: "all 0.18s ease",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-bebas)", fontSize: 18, letterSpacing: "0.06em", color: active ? flavour.color : "rgba(255,255,255,0.5)" }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3, textTransform: "uppercase" }}>{desc}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: active ? flavour.color : "rgba(255,255,255,0.35)", marginTop: 4 }}>{kes(szPrice)}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleAdd}
            className="btn-teal"
            style={{
              width: "100%",
              minHeight: 48,
              borderRadius: 12,
              border: "none",
              background: added ? "#22c55e" : "var(--sv-red)",
              color: "#fff",
              fontFamily: "var(--font-bebas)",
              fontSize: 18,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {added ? `✓ Added — ${kes(price)}` : `Add to Cart — ${kes(price)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlavourRows() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [detail, setDetail] = useState<Flavour | null>(null);
  const isMobile = useIsMobile();

  const grouped = useMemo(() => {
    const cats = CATEGORIES.filter((c) => c !== "All");
    return cats.map((cat) => ({
      category: cat,
      items: FLAVOURS.filter((f) => f.category === cat),
    })).filter((g) => g.items.length > 0);
  }, []);

  const filteredFlat = useMemo(() => {
    if (activeCategory === "All") return null;
    return FLAVOURS.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="flavours" style={{ background: "var(--sv-black)", padding: `${isMobile ? "60px" : "100px"} 0`, position: "relative" }}>
      <div style={{ padding: "0 5vw", marginBottom: 28 }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--sv-red-bright)",
          display: "block",
          marginBottom: 10,
        }}>
          Smokers Vine · Flavour Menu
        </span>
        <h2 style={{
          fontFamily: "var(--font-bebas)",
          fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(56px, 6vw, 84px)",
          letterSpacing: "0.03em",
          color: "var(--text-primary)",
          lineHeight: 0.95,
        }}>
          Load The Bowl
        </h2>
      </div>

      {/* Category filter pills */}
      <div style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "0 5vw 28px",
        scrollbarWidth: "none",
      }}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flex: "0 0 auto",
                minHeight: 40,
                padding: "8px 18px",
                borderRadius: 999,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                border: active ? "1px solid var(--sv-red-bright)" : "1px solid rgba(255,255,255,0.12)",
                background: active ? "rgba(225,29,46,0.16)" : "rgba(255,255,255,0.03)",
                color: active ? "var(--sv-red-bright)" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filteredFlat ? (
        <CardRow title={activeCategory} bannerImage={CATEGORY_BANNER[activeCategory]}>
          {filteredFlat.map((f) => (
            <FlavourCard key={f.id} flavour={f} onOpen={() => setDetail(f)} />
          ))}
        </CardRow>
      ) : (
        grouped.map(({ category, items }) => (
          <CardRow key={category} title={category} onViewAll={() => setActiveCategory(category)} bannerImage={CATEGORY_BANNER[category]}>
            {items.map((f) => (
              <FlavourCard key={f.id} flavour={f} onOpen={() => setDetail(f)} />
            ))}
          </CardRow>
        ))
      )}

      {detail && <FlavourDetail flavour={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}
