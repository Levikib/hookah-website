"use client";
import React, {
  useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo, memo, forwardRef,
} from "react";
import { gsap } from "gsap";
import { FLAVOURS, getStockStatus, type Flavour } from "@/data/flavours";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function hexRgb(hex: string) {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

// ─── Constants ────────────────────────────────────────────────────────────────
type Layout = "SPHERE" | "HELIX";

const CARD_W = 180;
const CARD_H = 220;
const OFFSET_X = -90;
const OFFSET_Y = -110;

const CATEGORY_COLORS: Record<string, string> = {
  Classic:   "#e74c3c",
  Fresh:     "#1abc9c",
  Fruity:    "#ff6b9d",
  Tropical:  "#f39c12",
  Floral:    "#fd79a8",
  Specialty: "#e17055",
  Novelty:   "#a29bfe",
  Mystery:   "#74b9ff",
  Premium:   "#ffd700",
};

const INTENSITY_COLORS: Record<string, string> = {
  Mild:   "#22d3ee",
  Medium: "#f59e0b",
  Strong: "#ff6b35",
};

const LAYOUT_META: Record<Layout, { label: string; hint: string }> = {
  SPHERE: { label: "Sphere", hint: "Drag to orbit · tap any card" },
  HELIX:  { label: "Helix",  hint: "Drag to spin · tap any card" },
};

interface Pos { x: number; y: number; z: number; rx: number; ry: number; rz: number; }

// Positions for N items (not always 36) — tight packing regardless of count
function computeSpherePos(n: number): Pos[] {
  if (n === 0) return [];
  const R = Math.max(240, Math.min(440, 180 + n * 8));
  return Array.from({ length: n }, (_, i) => {
    const phi   = Math.acos(1 - (2 * (i + 0.5)) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const x = R * Math.sin(phi) * Math.cos(theta);
    const y = R * Math.sin(phi) * Math.sin(theta);
    const z = R * Math.cos(phi);
    const ry = Math.atan2(x, z) * (180 / Math.PI);
    const rx = -Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
    return { x, y, z, rx, ry, rz: 0 };
  });
}

function computeHelixPos(n: number): Pos[] {
  if (n === 0) return [];
  const R = 300;
  const H = Math.max(600, Math.min(1600, n * 44));
  const turns = Math.max(1.5, Math.min(3.5, n / 10));

  const strandA: number[] = [];
  const strandB: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) strandA.push(i); else strandB.push(i);
  }
  const result: Pos[] = new Array(n);
  const nA = strandA.length;
  const nB = strandB.length;

  strandA.forEach((globalIdx, si) => {
    const t = nA > 1 ? si / (nA - 1) : 0.5;
    const angle = t * Math.PI * 2 * turns;
    result[globalIdx] = {
      x: Math.cos(angle) * R,
      z: Math.sin(angle) * R,
      y: (t - 0.5) * -H,
      rx: 0,
      ry: -angle * (180 / Math.PI),
      rz: 0,
    };
  });
  strandB.forEach((globalIdx, si) => {
    const t = nB > 1 ? si / (nB - 1) : 0.5;
    const angle = t * Math.PI * 2 * turns + Math.PI;
    result[globalIdx] = {
      x: Math.cos(angle) * R,
      z: Math.sin(angle) * R,
      y: (t - 0.5) * -H,
      rx: 0,
      ry: -angle * (180 / Math.PI),
      rz: 0,
    };
  });
  return result;
}

// ─── Flavour Detail Modal ─────────────────────────────────────────────────────
const FlavourModal = memo(function FlavourModal({
  flavour, onClose, onAdd,
}: {
  flavour: Flavour;
  onClose: () => void;
  onAdd: (f: Flavour) => void;
}) {
  const accent = CATEGORY_COLORS[flavour.category] ?? "#22d3ee";
  const intColor = INTENSITY_COLORS[flavour.intensity] ?? "#22d3ee";
  const stock = getStockStatus(flavour.stock);
  const isOut = stock === "out";
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);
  const rgb = hexRgb(accent);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(panelRef.current,
      { y: 50, opacity: 0, scale: 0.96 },
      { y: 0,  opacity: 1, scale: 1,    duration: 0.4, ease: "back.out(1.4)" }
    );
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(panelRef.current, { y: 32, opacity: 0, scale: 0.96, duration: 0.18, onComplete: onClose });
  }, [onClose]);

  const handleAdd = () => {
    if (isOut) return;
    setAdded(true);
    onAdd(flavour);
    setTimeout(() => { setAdded(false); close(); }, 1000);
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && close()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(5,3,10,0.88)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "min(560px, 100%)",
          background: "linear-gradient(145deg, #0d0a1e, #120d28)",
          border: `1px solid rgba(${rgb},0.45)`,
          borderTop: `3px solid rgba(${rgb},1)`,
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          boxShadow: `0 0 60px rgba(${rgb},0.18), 0 32px 80px rgba(0,0,0,0.8)`,
          margin: "auto",
        }}
      >
        {/* Close */}
        <button
          onClick={close}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 10,
            width: 44, height: 44, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.75)", fontSize: 20,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >×</button>

        {/* Hero */}
        <div style={{
          height: 160,
          background: `linear-gradient(135deg, rgba(${rgb},0.15) 0%, transparent 60%), var(--nebula)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {[180, 120, 60].map((size, ri) => (
            <div key={ri} style={{
              position: "absolute", width: size, height: size, borderRadius: "50%",
              border: `1px solid rgba(${rgb},${ri === 0 ? 0.12 : ri === 1 ? 0.22 : 0.4})`,
              animation: `spin-slow ${8 + ri * 4}s linear infinite ${ri % 2 ? "reverse" : ""}`,
            }} />
          ))}
          <span style={{ fontSize: 64, position: "relative", zIndex: 1, filter: `drop-shadow(0 0 16px rgba(${rgb},0.7))` }}>
            {flavour.emoji}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px 24px" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 4,
              border: `1px solid rgba(${rgb},0.8)`, color: accent, background: `rgba(${rgb},0.12)`,
            }}>{flavour.category}</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 4,
              border: `1px solid ${intColor}55`, color: intColor,
            }}>{flavour.intensity}</span>
            {stock !== "normal" && (
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "3px 10px", borderRadius: 4,
                border: `1px solid ${stock === "out" ? "rgba(255,255,255,0.15)" : "#f59e0b"}`,
                color: stock === "out" ? "rgba(255,255,255,0.3)" : "#f59e0b",
              }}>{stock === "out" ? "Sold Out" : stock === "critical" ? "Almost Gone" : "Low Stock"}</span>
            )}
          </div>

          <h2 style={{
            fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,5vw,42px)",
            letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: 10,
          }}>{flavour.name}</h2>

          <p style={{
            fontFamily: "var(--font-barlow)", fontSize: 14, lineHeight: 1.6,
            color: "rgba(255,255,255,0.65)", marginBottom: 16,
          }}>{flavour.description}</p>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>Flavour Notes</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {flavour.notes.map((n) => (
                <span key={n} style={{
                  fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 12,
                  padding: "4px 12px", borderRadius: 24,
                  background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.28)`,
                  color: "rgba(255,255,255,0.8)",
                }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 2 }}>Price</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: accent, lineHeight: 1 }}>{kes(flavour.price)}</p>
            </div>
            <button onClick={close} style={{
              fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "12px 20px", borderRadius: 10, minHeight: 44,
              border: "1px solid rgba(255,255,255,0.14)", background: "transparent",
              color: "rgba(255,255,255,0.45)", cursor: "pointer",
            }}>Back</button>
            <button onClick={handleAdd} disabled={isOut} style={{
              fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.1em",
              padding: "12px 20px", borderRadius: 10, minHeight: 44,
              border: `1px solid rgba(${rgb},${isOut ? 0.2 : 0.8})`,
              background: added ? accent : `rgba(${rgb},0.18)`,
              color: added ? "#000" : isOut ? "rgba(180,170,200,0.3)" : accent,
              cursor: isOut ? "not-allowed" : "pointer",
              transition: "all 0.22s ease",
              opacity: isOut ? 0.5 : 1,
            }}>{isOut ? "Sold Out" : added ? "✓ Added!" : "Add to Session →"}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Desktop 3D Card ──────────────────────────────────────────────────────────
interface CardProps { flavour: Flavour; onSelect: () => void; }

const FlavourCard = forwardRef<HTMLDivElement, CardProps>(
function FlavourCard({ flavour, onSelect }, ref) {
  const accent   = CATEGORY_COLORS[flavour.category] ?? "#22d3ee";
  const intColor = INTENSITY_COLORS[flavour.intensity];
  const stock    = getStockStatus(flavour.stock);
  const cardDownPos = useRef({ x: 0, y: 0 });

  return (
    <div
      data-flavour-id={flavour.id}
      ref={ref}
      onPointerDown={(e) => {
        cardDownPos.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
      }}
      onPointerUp={(e) => {
        const dx = e.clientX - cardDownPos.current.x;
        const dy = e.clientY - cardDownPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < 8) { e.stopPropagation(); onSelect(); }
      }}
      style={{
        width: CARD_W, height: CARD_H,
        position: "absolute", willChange: "transform",
        cursor: "pointer", opacity: 0,
      }}
    >
      <div
        style={{
          width: "100%", height: "100%",
          background: "#080512",
          border: `1px solid ${accent}33`,
          borderTop: `2px solid ${accent}`,
          borderRadius: 16, padding: "16px 14px 14px",
          display: "flex", flexDirection: "column", gap: 8,
          boxShadow: `0 0 20px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          position: "relative", overflow: "hidden",
          opacity: stock === "out" ? 0.45 : 1,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = `0 0 40px ${accent}44, 0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)`;
          el.style.borderColor = `${accent}77`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = `0 0 20px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`;
          el.style.borderColor = `${accent}33`;
        }}
      >
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>{flavour.emoji}</span>
          {stock !== "normal" && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "2px 6px", borderRadius: 4,
              border: `1px solid ${stock === "out" ? "rgba(255,255,255,0.15)" : "#f59e0b"}`,
              color: stock === "out" ? "rgba(255,255,255,0.3)" : "#f59e0b",
            }}>{stock === "out" ? "OUT" : stock === "critical" ? "LAST FEW" : "LOW"}</span>
          )}
        </div>
        <p style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff", lineHeight: 1, margin: 0 }}>{flavour.name}</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>{flavour.category}</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: intColor }}>{flavour.intensity}</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {flavour.notes.slice(0, 3).map((n) => (
            <span key={n} style={{ fontFamily: "var(--font-barlow)", fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>{n}</span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700, color: accent, flexShrink: 0 }}>{kes(flavour.price)}</span>
          <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}22`, color: accent, whiteSpace: "nowrap" }}>View →</span>
        </div>
      </div>
    </div>
  );
});

// ─── Mobile Grid Card ─────────────────────────────────────────────────────────
function MobileCard({ flavour, onSelect }: { flavour: Flavour; onSelect: () => void }) {
  const accent   = CATEGORY_COLORS[flavour.category] ?? "#22d3ee";
  const stock    = getStockStatus(flavour.stock);
  const isOut    = stock === "out";
  const rgb      = hexRgb(accent);

  return (
    <button
      onClick={() => !isOut && onSelect()}
      disabled={isOut}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        padding: "14px 12px", borderRadius: 14, textAlign: "left",
        border: `1.5px solid rgba(${rgb},${isOut ? 0.1 : 0.45})`,
        background: `rgba(${rgb},${isOut ? 0.02 : 0.07})`,
        cursor: isOut ? "not-allowed" : "pointer",
        opacity: isOut ? 0.4 : 1,
        transition: "all 0.18s ease",
        position: "relative",
        gap: 6, minHeight: 44,
        width: "100%",
        boxShadow: `0 0 12px rgba(${rgb},0.1)`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "14px 14px 0 0", background: `rgba(${rgb},${isOut ? 0.2 : 0.85})` }} />
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
        <span style={{ fontSize: 26 }}>{flavour.emoji}</span>
        {stock !== "normal" && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "2px 5px", borderRadius: 3,
            border: `1px solid ${isOut ? "rgba(255,255,255,0.12)" : "#f59e0b"}`,
            color: isOut ? "rgba(255,255,255,0.25)" : "#f59e0b",
          }}>{isOut ? "OUT" : "LOW"}</span>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-bebas)", fontSize: 15, letterSpacing: "0.04em", color: accent, lineHeight: 1.1 }}>{flavour.name}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(200,195,230,0.5)" }}>{flavour.category}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: accent, fontWeight: 700, marginTop: 2 }}>{kes(flavour.price)}</div>
    </button>
  );
}

// ─── Desktop 3D Wall ─────────────────────────────────────────────────────────
function DesktopWall({
  category,
  onSelect,
}: {
  category: string;
  onSelect: (f: Flavour) => void;
}) {
  const [targetLayout, setTarget] = useState<Layout>("SPHERE");
  const [morphing, setMorphing]   = useState(false);
  // Track displayed count for stage height
  const [visibleCount, setVisibleCount] = useState(FLAVOURS.length);

  const sceneRef  = useRef<HTMLDivElement>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);

  const orbitRef       = useRef({ x: 0, y: 0 });
  const targetOrbitRef = useRef({ x: 0, y: 0 });
  const velRef         = useRef({ x: 0, y: 0 });
  const pointerIsDown  = useRef(false);
  const isDragging     = useRef(false);
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const lastPointer    = useRef({ x: 0, y: 0 });
  const rafOrbit       = useRef<number>(0);
  const currentLayout  = useRef<Layout>("SPHERE");
  // Track current category for cross-effect use in morphTo
  const currentCategory = useRef<string>("All");

  // Apply positions for a subset of flavours to their elements
  const applyPositions = useCallback((
    visibleIndices: number[],
    layout: Layout,
    animate: boolean,
    onDone?: () => void,
  ) => {
    const positions = layout === "SPHERE"
      ? computeSpherePos(visibleIndices.length)
      : computeHelixPos(visibleIndices.length);

    const hiddenIndices = FLAVOURS.map((_, i) => i).filter(i => !visibleIndices.includes(i));

    // Kill existing tweens on all cards
    cardRefs.current.forEach(el => { if (el) gsap.killTweensOf(el); });

    if (animate) {
      // Hide cards that are not in the visible set — shrink to centre
      hiddenIndices.forEach(i => {
        const el = cardRefs.current[i];
        if (!el) return;
        gsap.to(el, { x: OFFSET_X, y: OFFSET_Y, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
        el.style.pointerEvents = "none";
      });

      // Animate visible cards to their new positions with stagger
      visibleIndices.forEach((globalIdx, slot) => {
        const el = cardRefs.current[globalIdx];
        const p = positions[slot];
        if (!el || !p) return;
        gsap.to(el, {
          x: p.x + OFFSET_X, y: p.y + OFFSET_Y, z: p.z,
          rotationX: p.rx, rotationY: p.ry, rotationZ: p.rz,
          scale: 1, opacity: 1,
          duration: 0.55,
          delay: slot * 0.012,
          ease: "power3.out",
        });
        el.style.pointerEvents = "auto";
      });

      if (onDone) setTimeout(onDone, visibleIndices.length * 12 + 600);
    } else {
      // Instant set (initial load)
      hiddenIndices.forEach(i => {
        const el = cardRefs.current[i];
        if (!el) return;
        gsap.set(el, { x: OFFSET_X, y: OFFSET_Y, z: 0, scale: 0, opacity: 0 });
        el.style.pointerEvents = "none";
      });
      visibleIndices.forEach((globalIdx, slot) => {
        const el = cardRefs.current[globalIdx];
        const p = positions[slot];
        if (!el || !p) return;
        gsap.set(el, { x: p.x + OFFSET_X, y: p.y + OFFSET_Y, z: p.z, rotationX: p.rx, rotationY: p.ry, rotationZ: p.rz, scale: 1, opacity: 1 });
        el.style.pointerEvents = "auto";
      });
      if (onDone) onDone();
    }
  }, []);

  // Build visible indices from category
  const getVisibleIndices = useCallback((cat: string) => {
    return FLAVOURS.map((f, i) => ({ f, i }))
      .filter(({ f }) => cat === "All" || f.category === cat)
      .map(({ i }) => i);
  }, []);

  // Initial mount — sphere, all flavours, no animation
  useLayoutEffect(() => {
    const indices = getVisibleIndices("All");
    applyPositions(indices, "SPHERE", false);
    // Fade in with stagger
    indices.forEach((globalIdx, slot) => {
      const el = cardRefs.current[globalIdx];
      if (!el) return;
      gsap.fromTo(el, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5, delay: slot * 0.01, ease: "power3.out" });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RAF orbit loop
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      rafOrbit.current = requestAnimationFrame(loop);

      if (!isDragging.current) {
        velRef.current.x *= 0.88;
        velRef.current.y *= 0.88;
        targetOrbitRef.current.x += velRef.current.x;
        targetOrbitRef.current.y += velRef.current.y;
      }

      const dx = targetOrbitRef.current.x - orbitRef.current.x;
      const dy = targetOrbitRef.current.y - orbitRef.current.y;
      const speed = Math.abs(velRef.current.x) + Math.abs(velRef.current.y);

      if (!isDragging.current && speed < 0.01 && Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;

      orbitRef.current.x += dx * 0.1;
      orbitRef.current.y += dy * 0.1;
      if (sceneRef.current) {
        sceneRef.current.style.transform = `rotateX(${orbitRef.current.x}deg) rotateY(${orbitRef.current.y}deg)`;
      }
    };
    loop();
    return () => { running = false; cancelAnimationFrame(rafOrbit.current); };
  }, []);

  // Category change — re-layout the visible subset
  useEffect(() => {
    currentCategory.current = category;
    const indices = getVisibleIndices(category);
    setVisibleCount(indices.length);
    applyPositions(indices, currentLayout.current, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const morphTo = useCallback((next: Layout) => {
    if (morphing || next === currentLayout.current) return;
    setMorphing(true);
    setTarget(next);

    const doMorph = () => {
      const indices = getVisibleIndices(currentCategory.current);
      applyPositions(indices, next, true, () => {
        currentLayout.current = next;
        setMorphing(false);
      });
    };

    // Reset orbit first, then morph
    gsap.to(targetOrbitRef.current, { x: 0, y: 0, duration: 0.6, ease: "power3.out", onComplete: doMorph });
    gsap.to(orbitRef.current, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
  }, [morphing, getVisibleIndices, applyPositions]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointerIsDown.current = true;
    isDragging.current = false;
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    lastPointer.current    = { x: e.clientX, y: e.clientY };
    velRef.current = { x: 0, y: 0 };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerIsDown.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    if (!isDragging.current && Math.sqrt(dx * dx + dy * dy) < 8) return;
    isDragging.current = true;
    const mdx = e.clientX - lastPointer.current.x;
    const mdy = e.clientY - lastPointer.current.y;
    velRef.current.y = mdx * 0.22;
    velRef.current.x = -mdy * 0.15;
    targetOrbitRef.current.y += mdx * 0.22;
    targetOrbitRef.current.x -= mdy * 0.15;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => { pointerIsDown.current = false; isDragging.current = false; }, []);

  // Stage height: clamp based on current visible count and layout
  const stageHeight = useMemo(() => {
    if (targetLayout === "HELIX") return Math.max(800, Math.min(2000, visibleCount * 44 + 200));
    return Math.max(700, Math.min(1300, 300 + visibleCount * 26));
  }, [targetLayout, visibleCount]);

  return (
    <div>
      {/* Layout switcher */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "24px 0 8px" }}>
        {(["SPHERE", "HELIX"] as Layout[]).map((l) => (
          <button
            key={l}
            onClick={() => morphTo(l)}
            disabled={morphing}
            className="no-min-h"
            style={{
              fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "8px 20px", borderRadius: 10, minHeight: 38,
              border: `1px solid ${targetLayout === l ? "var(--cyan-bright)" : "rgba(255,255,255,0.1)"}`,
              background: targetLayout === l ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
              color: targetLayout === l ? "var(--cyan-bright)" : "rgba(255,255,255,0.4)",
              cursor: morphing ? "not-allowed" : "pointer",
              transition: "all 0.25s ease",
              opacity: morphing && targetLayout !== l ? 0.5 : 1,
            }}
          >
            {LAYOUT_META[l].label}
          </button>
        ))}
      </div>

      <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 0, paddingBottom: 8 }}>
        {LAYOUT_META[targetLayout].hint}
      </p>

      {/* 3D Stage */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: "relative", zIndex: 5, width: "100%",
          height: stageHeight,
          overflow: "hidden",
          perspective: "2200px", perspectiveOrigin: "50% 50%",
          touchAction: "none", marginTop: 0, userSelect: "none",
          transition: "height 0.6s ease",
        }}
      >
        <div
          ref={sceneRef}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transformStyle: "preserve-3d", willChange: "transform",
            contain: "layout style",
          }}
        >
          {FLAVOURS.map((f, i) => (
            <FlavourCard
              key={f.id}
              flavour={f}
              onSelect={() => onSelect(f)}
              ref={(el) => { cardRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>

      <p style={{ textAlign: "center", padding: "28px 0 clamp(16px,3vw,32px)", fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.16)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {visibleCount} blends · {targetLayout.toLowerCase()} view
        {morphing && " · morphing..."}
      </p>
    </div>
  );
}

// ─── Mobile Grid Wall ─────────────────────────────────────────────────────────
function MobileWall({ category, onSelect }: { category: string; onSelect: (f: Flavour) => void }) {
  const filtered = category === "All" ? FLAVOURS : FLAVOURS.filter(f => f.category === category);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll(".mob-card");
    gsap.fromTo(cards, { opacity: 0, y: 16, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, stagger: 0.03, ease: "power2.out" });
  }, [category]);

  return (
    <div ref={sectionRef} style={{ padding: "16px 0 32px" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14, textAlign: "center" }}>
        {filtered.length} blends · tap to explore
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {filtered.map(f => (
          <div key={f.id} className="mob-card">
            <MobileCard flavour={f} onSelect={() => onSelect(f)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main FlavourWall ─────────────────────────────────────────────────────────
export default function FlavourWall() {
  const isMobile = useIsMobile();
  const addToCart = useStore((s) => s.addToCart);

  const [category, setCategory]        = useState("All");
  const [selectedFlavour, setSelected] = useState<Flavour | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(FLAVOURS.map(f => f.category)))], []);

  const handleAdd = useCallback((f: Flavour) => {
    addToCart({ id: `flavour-${f.id}`, type: "flavour", name: f.name, price: f.price, quantity: 1 });
  }, [addToCart]);

  return (
    <section
      id="flavours"
      style={{
        background: "var(--void)",
        position: "relative",
        overflow: "hidden",
        paddingBottom: isMobile ? 0 : "clamp(60px,8vw,120px)",
      }}
    >
      {/* Nebula bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 40% at 20% 20%, rgba(124,58,237,0.13) 0%, transparent 65%),
          radial-gradient(ellipse 40% 55% at 80% 75%, rgba(6,182,212,0.09) 0%, transparent 60%)
        `,
      }} />

      <div style={{ position: "relative", zIndex: 10, padding: isMobile ? "clamp(40px,6vw,60px) 16px 0" : "clamp(52px,7vw,88px) 5vw 0" }}>
        {/* Header */}
        <div style={{ textAlign: isMobile ? "left" : "center", marginBottom: isMobile ? 20 : 0, pointerEvents: "none" }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em",
            color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 12, opacity: 0.8,
          }}>
            {FLAVOURS.length} Premium Blends
          </p>
          <h2 style={{
            fontFamily: "var(--font-bebas)", fontWeight: 400,
            fontSize: isMobile ? "clamp(44px,11vw,64px)" : "clamp(56px,7vw,100px)",
            lineHeight: 0.92, letterSpacing: "0.04em", color: "#fff", marginBottom: 12,
          }}>
            The Flavour <span style={{ color: "var(--cyan-bright)" }}>Wall.</span>
          </h2>
          <p style={{
            fontFamily: "var(--font-barlow)", fontSize: isMobile ? 13 : "clamp(13px,1.8vw,16px)",
            color: "rgba(255,255,255,0.4)", maxWidth: 400,
            margin: isMobile ? "0" : "0 auto",
          }}>
            {isMobile ? "Tap any card to explore." : "36 premium blends, three ways to explore. Click any card to go deeper."}
          </p>
        </div>

        {/* Category filter */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "nowrap",
          overflowX: "auto", scrollbarWidth: "none",
          padding: isMobile ? "16px 0 0" : "20px 0 0",
          marginBottom: isMobile ? 4 : 0,
          WebkitOverflowScrolling: "touch",
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="no-min-h"
              style={{
                fontFamily: "var(--font-barlow)", fontWeight: 700,
                fontSize: isMobile ? 11 : 12,
                letterSpacing: "0.1em", textTransform: "uppercase",
                padding: isMobile ? "7px 14px" : "8px 18px",
                borderRadius: 24, minHeight: 36, flexShrink: 0,
                border: `1px solid ${category === cat ? "var(--cyan-bright)" : "rgba(255,255,255,0.08)"}`,
                background: category === cat ? "rgba(34,211,238,0.1)" : "transparent",
                color: category === cat ? "var(--cyan-bright)" : "rgba(255,255,255,0.38)",
                cursor: "pointer", transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content: mobile grid vs desktop 3D */}
      <div style={{ position: "relative", zIndex: 5, padding: isMobile ? "0 16px" : "0" }}>
        {isMobile
          ? <MobileWall category={category} onSelect={setSelected} />
          : <DesktopWall category={category} onSelect={setSelected} />
        }
      </div>

      {/* Modal */}
      {selectedFlavour && (
        <FlavourModal
          flavour={selectedFlavour}
          onClose={() => setSelected(null)}
          onAdd={handleAdd}
        />
      )}
    </section>
  );
}
