"use client";
import { useState } from "react";
import AnimatedTitle from "./AnimatedTitle";
import { FLAVOURS, CATEGORIES, getStockStatus } from "@/data/flavours";
import { useStore } from "@/store/useStore";

const INTENSITY_COLORS = {
  Mild: "var(--teal)",
  Medium: "var(--gold)",
  Strong: "var(--orange)",
};

function StockBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock);
  if (status === "normal") return null;
  const label = status === "out" ? "OUT OF STOCK" : status === "critical" ? "ALMOST GONE" : "LOW STOCK";
  const cls = status === "out" ? "badge-out" : status === "critical" ? "badge-low" : "badge-low";
  return (
    <span
      className={cls}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.12em",
        padding: "2px 8px",
        borderRadius: 4,
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

function FlavourCard({ flavour }: { flavour: typeof FLAVOURS[0] }) {
  const [adding, setAdding] = useState(false);
  const addToCart = useStore((s) => s.addToCart);
  const status = getStockStatus(flavour.stock);
  const isOut = status === "out";

  const handleAdd = () => {
    if (isOut) return;
    setAdding(true);
    addToCart({
      id: `flavour-${flavour.id}`,
      type: "flavour",
      name: flavour.name,
      price: flavour.price,
      quantity: 1,
    });
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div
      className="glass glass-hover"
      style={{
        padding: "20px 18px",
        opacity: isOut ? 0.5 : 1,
        cursor: isOut ? "not-allowed" : "default",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 200,
        border: `1px solid ${isOut ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`,
      }}
    >
      {/* Emoji + stock badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 36, lineHeight: 1 }}>{flavour.emoji}</span>
        <StockBadge stock={flavour.stock} />
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: 22,
          color: "#fff",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          lineHeight: 1,
          margin: 0,
        }}
      >
        {flavour.name}
      </h3>

      {/* Category + intensity */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-barlow)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {flavour.category}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: INTENSITY_COLORS[flavour.intensity],
            letterSpacing: "0.08em",
          }}
        >
          · {flavour.intensity}
        </span>
      </div>

      {/* Flavour notes */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {flavour.notes.slice(0, 3).map((note) => (
          <span
            key={note}
            style={{
              fontFamily: "var(--font-barlow)",
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.06)",
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {note}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Price + CTA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 16,
            color: "var(--gold)",
            fontWeight: 700,
          }}
        >
          ${flavour.price.toFixed(2)}
        </span>
        <button
          onClick={handleAdd}
          disabled={isOut}
          style={{
            fontFamily: "var(--font-barlow)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "7px 14px",
            borderRadius: 8,
            border: isOut
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid var(--teal)",
            background: adding
              ? "var(--teal)"
              : isOut
              ? "transparent"
              : "rgba(0,245,212,0.1)",
            color: adding ? "#000" : isOut ? "rgba(255,255,255,0.3)" : "var(--teal)",
            cursor: isOut ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          {adding ? "✓ Added" : isOut ? "Sold Out" : "Add to Session"}
        </button>
      </div>
    </div>
  );
}

export default function FlavourWall() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? FLAVOURS
    : FLAVOURS.filter((f) => f.category === activeCategory);

  const categories = [...CATEGORIES];

  return (
    <section
      style={{
        background: "#050505",
        padding: "100px 0 120px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 5vw" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--teal)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            25 Premium Blends
          </p>
          <AnimatedTitle
            text={"The Flavour\nWall."}
            as="h2"
            start="top 85%"
            style={{
              fontSize: "clamp(48px, 6vw, 80px)",
              lineHeight: 0.95,
              letterSpacing: "0.04em",
              marginBottom: 16,
              color: "var(--text-primary)",
            }}
          />
          <style>{`
            .animated-title div:last-child .animated-word:last-child { color: var(--cyan-bright); }
          `}</style>
          <p
            style={{
              fontFamily: "var(--font-barlow)",
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Every session begins with a choice. Pick your blend — we handle the rest.
          </p>
        </div>

        {/* Category filter bar */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 48,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "8px 20px",
                borderRadius: 24,
                border: activeCategory === cat
                  ? "1px solid var(--teal)"
                  : "1px solid rgba(255,255,255,0.15)",
                background: activeCategory === cat
                  ? "rgba(0,245,212,0.12)"
                  : "rgba(255,255,255,0.04)",
                color: activeCategory === cat
                  ? "var(--teal)"
                  : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid — 5 columns desktop, 2 mobile */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((flavour) => (
            <FlavourCard key={flavour.id} flavour={flavour} />
          ))}
        </div>

        {/* Count indicator */}
        <p
          style={{
            textAlign: "center",
            marginTop: 48,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em",
          }}
        >
          {filtered.length} blend{filtered.length !== 1 ? "s" : ""} available
        </p>
      </div>
    </section>
  );
}
