"use client";
import { useState } from "react";
import { FLAVOURS, CATEGORIES, getStockStatus } from "@/data/flavours";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

type Size = "50g" | "100g" | "250g";

const SIZE_MULTIPLIERS: Record<Size, number> = {
  "50g": 1,
  "100g": 1.7,
  "250g": 3.8,
};

function calcPrice(base: number, size: Size): number {
  if (size === "50g") return base;
  const raw = base * SIZE_MULTIPLIERS[size];
  return Math.floor(raw) + 0.99;
}

function IntensityBar({ intensity, color }: { intensity: "Mild" | "Medium" | "Strong"; color: string }) {
  const filled = intensity === "Mild" ? 1 : intensity === "Medium" ? 2 : 3;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i <= filled ? color : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginLeft: 4,
          whiteSpace: "nowrap",
        }}
      >
        {intensity}
      </span>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock);
  if (status === "normal") return null;

  const label =
    status === "out" ? "OUT OF STOCK" : status === "critical" ? "ALMOST GONE" : "LOW STOCK";
  const color =
    status === "out" ? "rgba(255,255,255,0.25)" : "#ff6b35";
  const isPulsing = status === "critical";

  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.12em",
        padding: "2px 8px",
        borderRadius: 4,
        textTransform: "uppercase",
        background: status === "out" ? "rgba(255,255,255,0.06)" : "rgba(255,107,53,0.15)",
        border: `1px solid ${color}`,
        color,
        animation: isPulsing ? "pulse-badge 1.5s ease-in-out infinite" : "none",
      }}
    >
      {label}
    </span>
  );
}

interface ShopCardProps {
  flavour: typeof FLAVOURS[0];
  selectedSize: Size;
  onSizeChange: (size: Size) => void;
  isMobile: boolean;
}

function ShopCard({ flavour, selectedSize, onSizeChange, isMobile }: ShopCardProps) {
  const addToCart = useStore((s) => s.addToCart);
  const [adding, setAdding] = useState(false);
  const status = getStockStatus(flavour.stock);
  const isOut = status === "out";
  const price = calcPrice(flavour.price, selectedSize);

  const handleAdd = () => {
    if (isOut) return;
    setAdding(true);
    addToCart({
      id: `shop-${flavour.id}-${selectedSize}`,
      type: "flavour",
      name: `${flavour.name} (${selectedSize})`,
      price,
      quantity: 1,
    });
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div
      className="glass"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: isOut ? 0.5 : 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isOut) {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${flavour.color}22`;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Color gradient bar */}
      <div
        style={{
          height: isMobile ? 40 : 60,
          background: `linear-gradient(to bottom, ${flavour.color}66, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: isMobile ? 28 : 40, lineHeight: 1 }}>{flavour.emoji}</span>
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {/* Name + category */}
        <div>
          <h3
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: isMobile ? 18 : 22,
              color: "var(--text-primary)",
              letterSpacing: "0.04em",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {flavour.name}
          </h3>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            {flavour.category}
          </span>
        </div>

        {/* Intensity bar */}
        <IntensityBar intensity={flavour.intensity} color={flavour.color} />

        {/* Note chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {flavour.notes.map((note) => (
            <span
              key={note}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.08em",
                padding: "2px 7px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
              }}
            >
              {note}
            </span>
          ))}
        </div>

        {/* Size selector */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["50g", "100g", "250g"] as Size[]).map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              style={{
                flex: 1,
                padding: "5px 0",
                minHeight: 36,
                borderRadius: 6,
                border: selectedSize === size
                  ? `1px solid ${flavour.color}`
                  : "1px solid rgba(255,255,255,0.12)",
                background: selectedSize === size
                  ? `${flavour.color}18`
                  : "rgba(255,255,255,0.04)",
                color: selectedSize === size ? flavour.color : "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-mono)",
                fontSize: isMobile ? 11 : 13,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Price + stock badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--gold)",
              letterSpacing: "0.02em",
            }}
          >
            ${price.toFixed(2)}
          </span>
          <StockBadge stock={flavour.stock} />
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          disabled={isOut}
          className="btn-teal"
          style={{
            marginTop: "auto",
            fontSize: 13,
            letterSpacing: "0.12em",
            padding: "10px 0",
            minHeight: 44,
            width: "100%",
            opacity: isOut ? 0.4 : 1,
            cursor: isOut ? "not-allowed" : "pointer",
            background: adding ? "var(--teal)" : undefined,
          }}
        >
          {adding ? "ADDED ✓" : isOut ? "OUT OF STOCK" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}

export default function FlavourShop() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, Size>>({});
  const isMobile = useIsMobile();

  const filtered =
    activeCategory === "All"
      ? FLAVOURS
      : FLAVOURS.filter((f) => f.category === activeCategory);

  const getSizeForFlavour = (id: number): Size => selectedSizes[id] ?? "50g";

  const handleSizeChange = (id: number, size: Size) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  };

  return (
    <section
      id="shop"
      style={{
        background: "var(--void)",
        padding: "clamp(60px, 8vw, 120px) 5vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Keyframe for pulsing badge + scrollbar hide */}
      <style>{`
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .shop-filter-bar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Background accent orb */}
      <div
        style={{
          display: isMobile ? "none" : "block",
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
          top: "10%",
          right: "-15%",
          pointerEvents: "none",
        }}
      />

      {/* Section header */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 12,
            }}
          >
            buy to keep
          </p>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(40px, 6vw, 84px)",
              lineHeight: 0.92,
              letterSpacing: "0.02em",
              color: "var(--text-primary)",
              whiteSpace: "pre-line",
            }}
          >
            {"The Shop.\nTake It Home."}
          </h2>
        </div>

        {/* Filter bar */}
        {isMobile ? (
          <div
            className="shop-filter-bar"
            style={{
              overflowX: "auto",
              display: "flex",
              gap: 8,
              padding: "0 0 12px",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              marginBottom: 28,
            } as React.CSSProperties}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    flex: "0 0 auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    minHeight: 44,
                    whiteSpace: "nowrap",
                    borderRadius: 6,
                    border: isActive
                      ? "1px solid var(--gold)"
                      : "1px solid rgba(255,255,255,0.12)",
                    background: isActive
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(255,255,255,0.04)",
                    color: isActive ? "var(--gold)" : "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 0 12px rgba(245,158,11,0.2)" : "none",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 40,
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "7px 16px",
                    borderRadius: 6,
                    border: isActive
                      ? "1px solid var(--gold)"
                      : "1px solid rgba(255,255,255,0.12)",
                    background: isActive
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(255,255,255,0.04)",
                    color: isActive ? "var(--gold)" : "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 0 12px rgba(245,158,11,0.2)" : "none",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(240px, 1fr))",
            gap: isMobile ? 12 : 20,
          }}
        >
          {filtered.map((flavour) => (
            <ShopCard
              key={flavour.id}
              flavour={flavour}
              selectedSize={getSizeForFlavour(flavour.id)}
              onSizeChange={(size) => handleSizeChange(flavour.id, size)}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
