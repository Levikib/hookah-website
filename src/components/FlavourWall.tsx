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

function spherePos(): Pos[] {
  const N = FLAVOURS.length;
  const R = 440;
  return FLAVOURS.map((_, i) => {
    const phi   = Math.acos(1 - (2 * (i + 0.5)) / N);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const x = R * Math.sin(phi) * Math.cos(theta);
    const y = R * Math.sin(phi) * Math.sin(theta);
    const z = R * Math.cos(phi);
    const ry = Math.atan2(x, z) * (180 / Math.PI);
    const rx = -Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
    return { x, y, z, rx, ry, rz: 0 };
  });
}

function helixPos(): Pos[] {
  const N = FLAVOURS.length;
  const R = 300;
  const H = 1400;
  return FLAVOURS.map((_, i) => {
    const strand = i % 2 === 0 ? 1 : -1;
    const t = i / (N - 1);
    const angle = t * Math.PI * 5 * strand;
    const x = Math.cos(angle) * R;
    const z = Math.sin(angle) * R;
    const y = (t - 0.5) * -H;
    const ry = -angle * (180 / Math.PI);
    return { x, y, z, rx: 0, ry, rz: 0 };
  });
}

function getPositions(layout: Layout): Pos[] {
  return layout === "SPHERE" ? spherePos() : helixPos();
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
        transformStyle: "preserve-3d", cursor: "pointer", opacity: 0,
      }}
    >
      <div
        style={{
          width: "100%", height: "100%",
          background: "rgba(8,5,18,0.95)",
          border: `1px solid ${accent}33`,
          borderTop: `2px solid ${accent}`,
          borderRadius: 16, padding: "16px 14px 14px",
          display: "flex", flexDirection: "column", gap: 8,
          boxShadow: `0 0 20px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
          backdropFilter: "blur(12px)",
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
      {/* Accent bar */}
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
  const [layout, setLayout]       = useState<Layout>("SPHERE");
  const [targetLayout, setTarget] = useState<Layout>("SPHERE");
  const [morphing, setMorphing]   = useState(false);

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

  useLayoutEffect(() => {
    const plist = spherePos();
    cardRefs.current.forEach((el, i) => {
      if (!el || !plist[i]) return;
      const p = plist[i];
      gsap.set(el, { x: p.x + OFFSET_X, y: p.y + OFFSET_Y, z: p.z, rotationX: p.rx, rotationY: p.ry, rotationZ: p.rz, opacity: 1, scale: 1 });
    });
  }, []);

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
      orbitRef.current.x += (targetOrbitRef.current.x - orbitRef.current.x) * 0.1;
      orbitRef.current.y += (targetOrbitRef.current.y - orbitRef.current.y) * 0.1;
      if (sceneRef.current) {
        sceneRef.current.style.transform = `rotateX(${orbitRef.current.x}deg) rotateY(${orbitRef.current.y}deg)`;
      }
    };
    loop();
    return () => { running = false; cancelAnimationFrame(rafOrbit.current); };
  }, []);

  const morphTo = useCallback((next: Layout) => {
    if (morphing || next === currentLayout.current) return;
    setMorphing(true);
    setTarget(next);
    const doMorph = () => {
      const plist = getPositions(next);
      const els = cardRefs.current;
      els.forEach(el => { if (el) gsap.killTweensOf(el); });
      els.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, { scale: 0.001, opacity: 0, duration: 0.25, delay: i * 0.012, ease: "power2.in" });
      });
      const maxPhase1 = 0.25 + (els.length - 1) * 0.012;
      const lastIdx = els.filter(Boolean).length - 1;
      els.forEach((el, i) => {
        if (!el || !plist[i]) return;
        const p = plist[i];
        gsap.delayedCall(maxPhase1 - 0.02, () => {
          gsap.set(el, { x: p.x + OFFSET_X, y: p.y + OFFSET_Y, z: p.z, rotationX: p.rx, rotationY: p.ry, rotationZ: p.rz });
        });
        gsap.to(el, {
          scale: 1, opacity: 1, duration: 1.0, delay: maxPhase1 + i * 0.012, ease: "power4.out",
          onComplete: i === lastIdx ? () => { currentLayout.current = next; setLayout(next); setMorphing(false); } : undefined,
        });
      });
    };
    if ((currentLayout.current === "SPHERE" && next === "HELIX") || (currentLayout.current === "HELIX" && next === "SPHERE")) {
      gsap.to(targetOrbitRef.current, { x: 0, y: 0, duration: 0.8, ease: "power3.out", onComplete: doMorph });
    } else {
      doMorph();
    }
  }, [morphing]);

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

  useEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const f = FLAVOURS[i];
      const visible = category === "All" || f.category === category;
      gsap.to(el, { opacity: visible ? 1 : 0, scale: visible ? 1 : 0.5, duration: 0.35, ease: "power2.out" });
      el.style.pointerEvents = visible ? "auto" : "none";
    });
  }, [category]);

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
          position: "relative", zIndex: 5, width: "100%", height: 1300,
          overflow: "visible",
          perspective: "2200px", perspectiveOrigin: "50% 50%",
          touchAction: "none", marginTop: 0, userSelect: "none",
        }}
      >
        <div
          ref={sceneRef}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transformStyle: "preserve-3d", willChange: "transform",
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
        {category === "All" ? FLAVOURS.length : FLAVOURS.filter(f => f.category === category).length} blends · {layout.toLowerCase()} view
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
        // Critical: do NOT set minHeight on mobile — let content determine height
        minHeight: isMobile ? "auto" : "auto",
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
