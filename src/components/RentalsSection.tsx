"use client";

import { useState, useCallback } from "react";
import { RENTAL_MODELS } from "@/data/rentals";
import type { RentalModel } from "@/data/rentals";
import CardRow from "@/components/CardRow";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

const POT_IMAGE: Record<string, string> = {
  "premium-pot": "/images/rentals/premium-pot.jpg",
  "duo-pot": "/images/rentals/duo-pot.jpg",
};

type Filter = "all" | "sale" | "rental";

function matchesFilter(model: RentalModel, filter: Filter) {
  if (filter === "all") return true;
  if (model.mode === "both") return true;
  return model.mode === filter;
}

// ─── Filter pills ───────────────────────────────────────────────────────────
function FilterPills({ filter, onChange }: { filter: Filter; onChange: (f: Filter) => void }) {
  const options: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "sale", label: "For Sale" },
    { id: "rental", label: "For Rent" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const isActive = filter === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              minHeight: 44,
              padding: "0 18px",
              borderRadius: 999,
              border: `1px solid ${isActive ? "var(--sv-red-bright)" : "rgba(255,255,255,0.14)"}`,
              background: isActive ? "rgba(225,29,46,0.16)" : "rgba(255,255,255,0.04)",
              color: isActive ? "var(--sv-red-bright)" : "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-barlow)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Spec badge ─────────────────────────────────────────────────────────────
function SpecBadge({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "8px 14px",
      textAlign: "center",
      minWidth: 84,
    }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 13, color: "#fff" }}>
        {value}
      </p>
    </div>
  );
}

function EstBadge() {
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      letterSpacing: "0.1em",
      color: "rgba(255,255,255,0.4)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 999,
      padding: "2px 8px",
      marginLeft: 8,
      verticalAlign: "middle",
    }}>
      EST.
    </span>
  );
}

// ─── Spotlight (PS5-style hero for the featured pot) ───────────────────────
function Spotlight({
  model, isMobile, onOpenDetail, onPrev, onNext,
}: {
  model: RentalModel;
  isMobile: boolean;
  onOpenDetail: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const showSale = model.mode === "sale" || model.mode === "both";
  const showRental = model.mode === "rental" || model.mode === "both";
  const image = POT_IMAGE[model.id];

  return (
    <div style={{
      position: "relative",
      minHeight: isMobile ? 480 : 560,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      borderRadius: isMobile ? 0 : 20,
      margin: isMobile ? "0 0 24px" : "0 5vw 32px",
      background: "linear-gradient(180deg, var(--sv-charcoal) 0%, var(--sv-black) 100%)",
    }}>
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={model.name}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              opacity: 0.9,
            }}
          />
          {/* Scrim for text legibility over the photo */}
          <div style={{
            position: "absolute", inset: 0,
            background: isMobile
              ? "linear-gradient(to top, rgba(5,3,10,0.95) 0%, rgba(5,3,10,0.55) 45%, rgba(5,3,10,0.15) 100%)"
              : "linear-gradient(to right, rgba(5,3,10,0.95) 0%, rgba(5,3,10,0.55) 45%, rgba(5,3,10,0.05) 75%)",
          }} />
        </>
      ) : (
        /* Radial glow spotlight — brand red (fallback when no product photo) */
        <div style={{
          position: "absolute",
          top: "50%", left: isMobile ? "50%" : "68%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? 360 : 620,
          height: isMobile ? 360 : 620,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${model.accentColor}33 0%, ${model.accentColor}0d 45%, transparent 72%)`,
          pointerEvents: "none",
          transition: "background 0.5s ease",
        }} />
      )}

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 24 : 12,
        padding: isMobile ? "36px 24px" : "0 clamp(32px,5vw,72px)",
      }}>
        {/* Left: copy */}
        <div style={{ maxWidth: isMobile ? "100%" : 440 }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: model.accentColor,
            marginBottom: 12,
          }}>
            ( {model.tier} Pot )
          </p>
          <h3 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: isMobile ? "clamp(38px,10vw,52px)" : "clamp(48px,5vw,64px)",
            letterSpacing: "0.03em",
            color: "#fff",
            lineHeight: 0.95,
            marginBottom: 14,
          }}>
            {model.name}
          </h3>
          <p style={{
            fontFamily: "var(--font-barlow)",
            fontSize: 15,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.6,
            marginBottom: 22,
          }}>
            {model.tagline}
          </p>

          {/* Pricing */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 22 }}>
            {showSale && (
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Buy</p>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: 26, color: "var(--sv-gold)", letterSpacing: "0.03em" }}>
                  {kes(model.salePrice)}{model.priceEstimated && <EstBadge />}
                </p>
              </div>
            )}
            {showRental && (
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Rent / Session</p>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: 26, color: "var(--sv-gold)", letterSpacing: "0.03em" }}>
                  {kes(model.sessionRate)}{model.priceEstimated && <EstBadge />}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onOpenDetail}
            style={{
              minHeight: 48,
              padding: "0 28px",
              borderRadius: 10,
              border: "none",
              background: model.accentColor,
              color: "#0a0508",
              fontFamily: "var(--font-bebas)",
              fontSize: 16,
              letterSpacing: "0.08em",
              cursor: "pointer",
              boxShadow: `0 8px 28px ${model.accentColor}55`,
            }}
          >
            {showSale ? "Buy or Rent" : "Reserve"} →
          </button>
        </div>

        {/* Right: spec badges + arrow scrubber */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <SpecBadge label="Height" value={model.height} />
            <SpecBadge label="Hose" value={model.hoseType} />
            <SpecBadge label="Units" value={`${model.available} left`} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onPrev}
              aria-label="Previous pot"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: 18, cursor: "pointer",
              }}
            >‹</button>
            <button
              onClick={onNext}
              aria-label="Next pot"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: 18, cursor: "pointer",
              }}
            >›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compact card for the row ───────────────────────────────────────────────
function PotCard({ model, onClick }: { model: RentalModel; onClick: () => void }) {
  const image = POT_IMAGE[model.id];
  return (
    <button
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        width: 220,
        minHeight: 44,
        textAlign: "left",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${model.accentColor}33`,
        borderRadius: 14,
        padding: image ? 0 : "18px 16px",
        cursor: "pointer",
        scrollSnapAlign: "start",
        transition: "border-color 0.2s ease",
        overflow: "hidden",
      }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={model.name}
          style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ padding: image ? "14px 16px 16px" : 0 }}>
      <div style={{
        display: "inline-block",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: model.accentColor,
        border: `1px solid ${model.accentColor}55`,
        borderRadius: 999,
        padding: "2px 8px",
        marginBottom: 10,
      }}>
        {model.tier}
      </div>
      <p style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: "0.03em", color: "#fff", marginBottom: 4 }}>
        {model.name}
      </p>
      <p style={{ fontFamily: "var(--font-barlow)", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10, lineHeight: 1.4 }}>
        {model.height} · {model.hoseType}
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--sv-gold)" }}>
        {model.mode === "rental" ? kes(model.sessionRate) : kes(model.salePrice)}
        {model.priceEstimated && <EstBadge />}
      </p>
      </div>
    </button>
  );
}

// ─── Detail panel (slide-in desktop / bottom sheet mobile) ─────────────────
function DetailPanel({ model, isMobile, onClose, onAddToCart }: {
  model: RentalModel;
  isMobile: boolean;
  onClose: () => void;
  onAddToCart: (mode: "sale" | "rental") => void;
}) {
  const showSale = model.mode === "sale" || model.mode === "both";
  const showRental = model.mode === "rental" || model.mode === "both";

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 101,
        maxHeight: "88vh", overflowY: "auto",
        background: "var(--sv-charcoal)",
        borderRadius: "20px 20px 0 0",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "24px 20px 32px",
      }
    : {
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 101,
        width: "min(420px, 92vw)",
        overflowY: "auto",
        background: "var(--sv-charcoal)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 28px",
      };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      />
      <div style={panelStyle}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff", fontSize: 18, cursor: "pointer",
            marginBottom: 16,
          }}
        >×</button>

        <div style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
          color: model.accentColor, border: `1px solid ${model.accentColor}55`, borderRadius: 999,
          padding: "3px 10px", marginBottom: 12,
        }}>
          {model.tier}
        </div>
        <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: 36, letterSpacing: "0.03em", color: "#fff", marginBottom: 8 }}>
          {model.name}
        </h3>
        <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24 }}>
          {model.tagline}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          <SpecBadge label="Height" value={model.height} />
          <SpecBadge label="Hose Type" value={model.hoseType} />
          <SpecBadge label="Material" value={model.material.split(" + ")[0]} />
          <SpecBadge label="Available" value={`${model.available} units`} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {showSale && (
            <button
              onClick={() => onAddToCart("sale")}
              style={{
                minHeight: 48, borderRadius: 10, border: "none",
                background: model.accentColor, color: "#0a0508",
                fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.08em",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 18px",
              }}
            >
              <span>Buy — {kes(model.salePrice)}</span>
              {model.priceEstimated && <EstBadge />}
            </button>
          )}
          {showRental && (
            <button
              onClick={() => onAddToCart("rental")}
              style={{
                minHeight: 48, borderRadius: 10,
                border: `1px solid ${model.accentColor}`,
                background: "transparent", color: model.accentColor,
                fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.08em",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 18px",
              }}
            >
              <span>Rent — {kes(model.sessionRate)}/session</span>
              {model.priceEstimated && <EstBadge />}
            </button>
          )}
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 14, textAlign: "center" }}>
          Added to cart · checkout confirms via WhatsApp
        </p>
      </div>
    </>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────
export default function RentalsSection() {
  const isMobile = useIsMobile();
  const { addToCart } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = RENTAL_MODELS.filter((m) => matchesFilter(m, filter));
  const [featuredId, setFeaturedId] = useState(RENTAL_MODELS[0].id);
  const [detailModel, setDetailModel] = useState<RentalModel | null>(null);

  const featured = filtered.find((m) => m.id === featuredId) ?? filtered[0] ?? RENTAL_MODELS[0];

  const stepFeatured = useCallback((dir: 1 | -1) => {
    const idx = filtered.findIndex((m) => m.id === featured.id);
    const next = filtered[(idx + dir + filtered.length) % filtered.length];
    if (next) setFeaturedId(next.id);
  }, [filtered, featured]);

  const handleAddToCart = (model: RentalModel, mode: "sale" | "rental") => {
    addToCart({
      id: `rental-${model.id}-${mode}`,
      type: "rental",
      name: `${model.name} (${mode === "sale" ? "Purchase" : "Rental"})`,
      price: mode === "sale" ? model.salePrice : model.sessionRate,
      quantity: 1,
      meta: { potId: model.id, mode },
    });
    setDetailModel(null);
  };

  return (
    <section id="rentals" style={{ position: "relative", background: "var(--sv-black)", padding: isMobile ? "48px 0" : "72px 0" }}>
      <style>{`#rentals { scroll-margin-top: 80px; }`}</style>

      <div style={{
        padding: isMobile ? "0 20px 24px" : "0 5vw 32px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-red-bright)", marginBottom: 8 }}>
            The Showroom
          </p>
          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: isMobile ? "clamp(36px,9vw,52px)" : "clamp(44px,5vw,68px)",
            color: "#fff", letterSpacing: "0.03em", lineHeight: 0.95,
          }}>
            Pots — Buy or Rent
          </h2>
        </div>
        <FilterPills filter={filter} onChange={(f) => { setFilter(f); }} />
      </div>

      {featured && (
        <Spotlight
          model={featured}
          isMobile={isMobile}
          onOpenDetail={() => setDetailModel(featured)}
          onPrev={() => stepFeatured(-1)}
          onNext={() => stepFeatured(1)}
        />
      )}

      <CardRow title="All Pots" subtitle="Tap a pot to feature it above">
        {filtered.map((model) => (
          <PotCard key={model.id} model={model} onClick={() => setFeaturedId(model.id)} />
        ))}
      </CardRow>

      {detailModel && (
        <DetailPanel
          model={detailModel}
          isMobile={isMobile}
          onClose={() => setDetailModel(null)}
          onAddToCart={(mode) => handleAddToCart(detailModel, mode)}
        />
      )}
    </section>
  );
}
