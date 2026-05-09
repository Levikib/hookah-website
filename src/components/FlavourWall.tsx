"use client";
import React, {
  useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo, memo, forwardRef,
} from "react";
import { gsap } from "gsap";
import { FLAVOURS, getStockStatus, type Flavour } from "@/data/flavours";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

// ─── Constants ────────────────────────────────────────────────────────────────
type Layout = "SPHERE" | "HELIX" | "GRID";

const CARD_W = 180;
const CARD_H = 220;
const OFFSET_X = -90;  // -CARD_W/2
const OFFSET_Y = -110; // -CARD_H/2

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
  SPHERE: { label: "Sphere View", hint: "Drag to rotate the flavour globe" },
  HELIX:  { label: "Helix View",  hint: "Drag to spin the DNA spiral" },
  GRID:   { label: "Grid View",   hint: "Drag to orbit — depth reveals layers" },
};

// ─── Position types ───────────────────────────────────────────────────────────
interface Pos { x: number; y: number; z: number; rx: number; ry: number; rz: number; }

// ─── Layout position calculators ─────────────────────────────────────────────
function spherePos(): Pos[] {
  const N = FLAVOURS.length;
  const R = 500;
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

function gridPos(): Pos[] {
  // 4×4×3 cuboid: 4 cols, 4 rows, 3 layers. 48 slots, use first 36.
  const COLS   = 4;
  const ROWS   = 4;
  const LAYERS = 3;
  const gapX = CARD_W + 28;
  const gapY = CARD_H + 28;
  const gapZ = 400;
  const padX = ((COLS - 1) * gapX) / 2;
  const padY = ((ROWS - 1) * gapY) / 2;

  return FLAVOURS.map((_, i) => {
    const layer = Math.floor(i / (COLS * ROWS));
    const rem   = i % (COLS * ROWS);
    const col   = rem % COLS;
    const row   = Math.floor(rem / COLS);
    const safeLayer = Math.min(layer, LAYERS - 1);
    return {
      x:   col * gapX - padX,
      y:   row * gapY - padY,
      z:  -safeLayer * gapZ,
      rx:  0,
      ry:  0,
      rz:  0,
    };
  });
}

function getPositions(layout: Layout): Pos[] {
  switch (layout) {
    case "SPHERE": return spherePos();
    case "HELIX":  return helixPos();
    case "GRID":   return gridPos();
  }
}

// ─── Flavour Detail Modal ─────────────────────────────────────────────────────
const FlavourModal = memo(function FlavourModal({
  flavour,
  onClose,
  onAdd,
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

  useEffect(() => {
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(panelRef.current,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0,  opacity: 1, scale: 1,    duration: 0.45, ease: "back.out(1.5)" }
    );
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(panelRef.current, { y: 40, opacity: 0, scale: 0.96, duration: 0.2,
      onComplete: onClose });
  }, [onClose]);

  const handleAdd = () => {
    if (isOut) return;
    setAdded(true);
    onAdd(flavour);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && close()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(5,3,10,0.88)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "min(640px, 94vw)",
          background: "linear-gradient(145deg, #0d0a1e, #120d28)",
          border: `1px solid ${accent}55`,
          borderTop: `3px solid ${accent}`,
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          boxShadow: `0 0 80px ${accent}22, 0 40px 80px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Glow bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 40% at 70% 0%, ${accent}18 0%, transparent 70%)`,
        }} />

        {/* Close */}
        <button
          onClick={close}
          style={{
            position: "absolute", top: 18, right: 18, zIndex: 10,
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.7)", fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          ×
        </button>

        {/* Hero visual */}
        <div style={{
          height: 180,
          background: `linear-gradient(135deg, ${accent}18 0%, transparent 60%), var(--nebula)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {[200, 140, 80].map((size, ri) => (
            <div key={ri} style={{
              position: "absolute",
              width: size, height: size,
              borderRadius: "50%",
              border: `1px solid ${accent}${ri === 0 ? "18" : ri === 1 ? "28" : "45"}`,
              animation: `spin-slow ${8 + ri * 4}s linear infinite ${ri % 2 ? "reverse" : ""}`,
            }} />
          ))}
          <span style={{ fontSize: 72, position: "relative", zIndex: 1, filter: `drop-shadow(0 0 20px ${accent}88)` }}>
            {flavour.emoji}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 32px 32px" }}>
          {/* Tags row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 4,
              border: `1px solid ${accent}`, color: accent,
              background: `${accent}15`,
            }}>
              {flavour.category}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 4,
              border: `1px solid ${intColor}55`, color: intColor,
            }}>
              {flavour.intensity}
            </span>
            {stock !== "normal" && (
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em",
                textTransform: "uppercase", padding: "3px 10px", borderRadius: 4,
                border: `1px solid ${stock === "out" ? "rgba(255,255,255,0.15)" : "#f59e0b"}`,
                color: stock === "out" ? "rgba(255,255,255,0.3)" : "#f59e0b",
              }}>
                {stock === "out" ? "Sold Out" : stock === "critical" ? "Almost Gone" : "Low Stock"}
              </span>
            )}
          </div>

          {/* Name */}
          <h2 style={{
            fontFamily: "var(--font-bebas)", fontSize: "clamp(32px,5vw,48px)",
            letterSpacing: "0.04em", textTransform: "uppercase",
            color: "#fff", lineHeight: 1, marginBottom: 14,
          }}>
            {flavour.name}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "var(--font-barlow)", fontSize: 15, lineHeight: 1.65,
            color: "rgba(255,255,255,0.7)", marginBottom: 20,
          }}>
            {flavour.description}
          </p>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8,
            }}>
              Flavour Notes
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {flavour.notes.map((n) => (
                <span key={n} style={{
                  fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 12,
                  padding: "5px 14px", borderRadius: 24,
                  background: `${accent}18`, border: `1px solid ${accent}33`,
                  color: "rgba(255,255,255,0.8)",
                }}>
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* Pairs with */}
          {flavour.pairsWith.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8,
              }}>
                Pairs Well With
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {flavour.pairsWith.map((p) => (
                  <span key={p} style={{
                    fontFamily: "var(--font-barlow)", fontSize: 11,
                    padding: "4px 10px", borderRadius: 20,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.5)",
                  }}>
                    + {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 2,
              }}>
                Price
              </p>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700,
                color: accent, lineHeight: 1,
              }}>
                ${flavour.price.toFixed(2)}
              </p>
            </div>
            <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={close}
                style={{
                  fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "12px 24px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent", color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleAdd}
                disabled={isOut}
                style={{
                  fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "12px 28px", borderRadius: 10,
                  border: `1px solid ${accent}`,
                  background: added ? accent : `${accent}22`,
                  color: added ? "#000" : accent,
                  cursor: isOut ? "not-allowed" : "pointer",
                  transition: "all 0.25s ease",
                  opacity: isOut ? 0.4 : 1,
                  minWidth: 140,
                }}
              >
                {isOut ? "Sold Out" : added ? "✓ Added to Cart" : "Add to Session →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Individual card ──────────────────────────────────────────────────────────
interface CardProps { flavour: Flavour; onClick: () => void; }

const FlavourCard = forwardRef<HTMLDivElement, CardProps>(
function FlavourCard({ flavour, onClick }, ref) {
  const accent   = CATEGORY_COLORS[flavour.category] ?? "#22d3ee";
  const intColor = INTENSITY_COLORS[flavour.intensity];
  const stock    = getStockStatus(flavour.stock);

  return (
    <div
      data-flavour-id={flavour.id}
      ref={ref}
      onClick={onClick}
      style={{
        width: CARD_W,
        height: CARD_H,
        position: "absolute",
        // No CSS transform — GSAP drives all transform including offset
        willChange: "transform",
        transformStyle: "preserve-3d",
        cursor: "pointer",
        // Start invisible until useLayoutEffect places them
        opacity: 0,
      }}
    >
      <div
        style={{
          width: "100%", height: "100%",
          background: "rgba(8,5,18,0.95)",
          border: `1px solid ${accent}33`,
          borderTop: `2px solid ${accent}`,
          borderRadius: 16,
          padding: "16px 14px 14px",
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
          el.style.borderTopColor = accent;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = `0 0 20px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`;
          el.style.borderColor = `${accent}33`;
          el.style.borderTopColor = accent;
        }}
      >
        {/* Corner glow */}
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 80, height: 80, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Emoji + stock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>{flavour.emoji}</span>
          {stock !== "normal" && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "2px 6px", borderRadius: 4,
              border: `1px solid ${stock === "out" ? "rgba(255,255,255,0.15)" : "#f59e0b"}`,
              color: stock === "out" ? "rgba(255,255,255,0.3)" : "#f59e0b",
            }}>
              {stock === "out" ? "OUT" : stock === "critical" ? "LAST FEW" : "LOW"}
            </span>
          )}
        </div>

        {/* Name */}
        <p style={{
          fontFamily: "var(--font-bebas)", fontSize: 20,
          letterSpacing: "0.05em", textTransform: "uppercase",
          color: "#fff", lineHeight: 1, margin: 0,
        }}>
          {flavour.name}
        </p>

        {/* Category + intensity */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
            textTransform: "uppercase", color: accent,
          }}>
            {flavour.category}
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>·</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em",
            color: intColor,
          }}>
            {flavour.intensity}
          </span>
        </div>

        {/* Notes */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {flavour.notes.slice(0, 3).map((n) => (
            <span key={n} style={{
              fontFamily: "var(--font-barlow)", fontSize: 10,
              padding: "2px 8px", borderRadius: 20,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.55)",
            }}>
              {n}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Price + tap hint */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 18,
            fontWeight: 700, color: accent,
          }}>
            ${flavour.price.toFixed(2)}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
          }}>
            View →
          </span>
        </div>
      </div>
    </div>
  );
});

// ─── Main FlavourWall ─────────────────────────────────────────────────────────
export default function FlavourWall() {
  const isMobile = useIsMobile();
  const addToCart = useStore((s) => s.addToCart);

  const [layout, setLayout]       = useState<Layout>("SPHERE");
  const [category, setCategory]   = useState("All");
  const [selectedFlavour, setSelected] = useState<Flavour | null>(null);
  const [morphing, setMorphing]   = useState(false);
  // Track target layout for button highlight
  const [targetLayout, setTarget] = useState<Layout>("SPHERE");

  const sceneRef  = useRef<HTMLDivElement>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);

  // Orbit state — all in refs, no React state
  const orbitRef       = useRef({ x: 0, y: 0 });
  const targetOrbitRef = useRef({ x: 0, y: 0 });
  const velRef         = useRef({ x: 0, y: 0 });
  const isDragging     = useRef(false);
  const lastPointer    = useRef({ x: 0, y: 0 });
  const rafOrbit       = useRef<number>(0);
  const currentLayout  = useRef<Layout>("SPHERE");

  // ── Apply initial sphere positions synchronously before first paint ──────
  useLayoutEffect(() => {
    const plist = spherePos();
    cardRefs.current.forEach((el, i) => {
      if (!el || !plist[i]) return;
      const p = plist[i];
      // GSAP set: positions are relative to center of scene root.
      // Card has CSS offset (OFFSET_X, OFFSET_Y) built in, so we add those to x/y.
      gsap.set(el, {
        x: p.x + OFFSET_X,
        y: p.y + OFFSET_Y,
        z: p.z,
        rotationX: p.rx,
        rotationY: p.ry,
        rotationZ: p.rz,
        opacity: 1,
        scale: 1,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Orbit animation RAF loop ──────────────────────────────────────────────
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
      // Clamp X for grid so it doesn't flip
      if (currentLayout.current === "GRID") {
        targetOrbitRef.current.x = Math.max(-60, Math.min(60, targetOrbitRef.current.x));
      }
      orbitRef.current.x += (targetOrbitRef.current.x - orbitRef.current.x) * 0.1;
      orbitRef.current.y += (targetOrbitRef.current.y - orbitRef.current.y) * 0.1;
      if (sceneRef.current) {
        sceneRef.current.style.transform =
          `rotateX(${orbitRef.current.x}deg) rotateY(${orbitRef.current.y}deg)`;
      }
    };
    loop();
    return () => { running = false; cancelAnimationFrame(rafOrbit.current); };
  }, []);

  // ── Ultra-smooth layout morph ─────────────────────────────────────────────
  const morphTo = useCallback((next: Layout) => {
    if (morphing || next === currentLayout.current) return;
    setMorphing(true);
    setTarget(next);

    const doMorph = () => {
      const plist = getPositions(next);
      const els = cardRefs.current;

      // Kill all running tweens first
      els.forEach(el => { if (el) gsap.killTweensOf(el); });

      // Phase 1: scale to 0.001, fade to 0 (0.25s)
      els.forEach((el, i) => {
        if (!el) return;
        const delay = i * 0.012;
        gsap.to(el, {
          scale: 0.001,
          opacity: 0,
          duration: 0.25,
          delay,
          ease: "power2.in",
        });
      });

      // Phase 2: snap positions while invisible, then fade/scale back in
      // All cards fade out by: 0.25 + lastCardDelay = 0.25 + (N-1)*0.012
      const maxPhase1 = 0.25 + (els.length - 1) * 0.012;
      const validEls = els.filter(Boolean);
      const lastIdx = validEls.length - 1;

      els.forEach((el, i) => {
        if (!el || !plist[i]) return;
        const p = plist[i];
        const revealDelay = maxPhase1 + i * 0.012;

        // Snap position to new layout just before reveal (while opacity=0)
        gsap.delayedCall(maxPhase1 - 0.02, () => {
          gsap.set(el, {
            x: p.x + OFFSET_X,
            y: p.y + OFFSET_Y,
            z: p.z,
            rotationX: p.rx,
            rotationY: p.ry,
            rotationZ: p.rz,
          });
        });

        // Reveal: scale + fade back in (staggered)
        gsap.to(el, {
          scale: 1,
          opacity: 1,
          duration: 1.0,
          delay: revealDelay,
          ease: "power4.out",
          onComplete: i === lastIdx ? () => {
            currentLayout.current = next;
            setLayout(next);
            setMorphing(false);
          } : undefined,
        });
      });
    };

    // For sphere↔helix: reset orbit Y to 0 first, then morph
    if (
      (currentLayout.current === "SPHERE" && next === "HELIX") ||
      (currentLayout.current === "HELIX" && next === "SPHERE")
    ) {
      gsap.to(targetOrbitRef.current, {
        x: 0, y: 0, duration: 0.8, ease: "power3.out",
        onComplete: doMorph,
      });
    } else {
      doMorph();
    }
  }, [morphing]);

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    velRef.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    velRef.current.y = dx * 0.25;
    velRef.current.x = -dy * 0.18;
    targetOrbitRef.current.y += dx * 0.25;
    targetOrbitRef.current.x -= dy * 0.18;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ── Category filter via GSAP — does NOT re-morph ──────────────────────────
  useEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const f = FLAVOURS[i];
      const visible = category === "All" || f.category === category;
      gsap.to(el, {
        opacity: visible ? 1 : 0,
        scale:   visible ? 1 : 0.5,
        duration: 0.35,
        ease: "power2.out",
      });
      el.style.pointerEvents = visible ? "auto" : "none";
    });
  }, [category]);

  const handleAdd = useCallback((f: Flavour) => {
    addToCart({ id: `flavour-${f.id}`, type: "flavour", name: f.name, price: f.price, quantity: 1 });
  }, [addToCart]);

  const categories = useMemo(() =>
    ["All", ...Array.from(new Set(FLAVOURS.map(f => f.category)))],
  []);

  const stageH = isMobile ? 500 : 700;

  return (
    <section
      id="flavours"
      style={{
        background: "var(--void)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Nebula bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 40% at 20% 20%, rgba(124,58,237,0.13) 0%, transparent 65%),
          radial-gradient(ellipse 40% 55% at 80% 75%, rgba(6,182,212,0.09) 0%, transparent 60%),
          radial-gradient(ellipse 60% 35% at 60% 50%, rgba(232,121,249,0.06) 0%, transparent 70%)
        `,
      }} />

      {/* ── Header ── */}
      <div style={{
        position: "relative", zIndex: 10,
        textAlign: "center",
        padding: "clamp(52px,7vw,88px) 5vw 0",
        pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em",
          color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 16, opacity: 0.8,
        }}>
          {FLAVOURS.length} Premium Blends
        </p>
        <h2 style={{
          fontFamily: "var(--font-bebas)", fontWeight: 400,
          fontSize: "clamp(56px,7vw,100px)", lineHeight: 0.92,
          letterSpacing: "0.04em", textTransform: "uppercase",
          color: "#fff", marginBottom: 16,
        }}>
          The Flavour <span style={{ color: "var(--cyan-bright)" }}>Wall.</span>
        </h2>
        <p style={{
          fontFamily: "var(--font-barlow)", fontSize: "clamp(13px,1.8vw,16px)",
          color: "rgba(255,255,255,0.45)", maxWidth: 400, margin: "0 auto",
        }}>
          36 premium blends, three ways to explore. Click any card to go deeper.
        </p>
      </div>

      {/* ── Layout switcher ── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "center", gap: isMobile ? 6 : 10,
        flexWrap: "wrap",
        padding: isMobile ? "28px 16px 0" : "32px 5vw 0",
      }}>
        {(["SPHERE", "HELIX", "GRID"] as Layout[]).map((l) => (
          <button
            key={l}
            onClick={() => morphTo(l)}
            disabled={morphing}
            style={{
              fontFamily: "var(--font-barlow)", fontWeight: 700,
              fontSize: isMobile ? 11 : 12,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: isMobile ? "8px 14px" : "10px 20px",
              borderRadius: 10,
              border: `1px solid ${targetLayout === l ? "var(--cyan-bright)" : "rgba(255,255,255,0.1)"}`,
              background: targetLayout === l ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
              color: targetLayout === l ? "var(--cyan-bright)" : "rgba(255,255,255,0.4)",
              cursor: morphing ? "not-allowed" : "pointer",
              transition: "all 0.25s ease",
              backdropFilter: "blur(8px)",
              opacity: morphing && targetLayout !== l ? 0.5 : 1,
            }}
          >
            {LAYOUT_META[l].label}
          </button>
        ))}
      </div>

      {/* Hint text */}
      <p style={{
        position: "relative", zIndex: 10, textAlign: "center",
        marginTop: 10,
        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
      }}>
        {LAYOUT_META[targetLayout].hint} · drag to orbit all axes
      </p>

      {/* ── Category filter ── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "center",
        gap: 8, flexWrap: "wrap",
        padding: isMobile ? "16px 12px 0" : "20px 5vw 0",
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              fontFamily: "var(--font-barlow)", fontWeight: 700,
              fontSize: isMobile ? 10 : 11,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: isMobile ? "6px 12px" : "6px 16px",
              borderRadius: 24, minHeight: 36,
              border: `1px solid ${category === cat ? "var(--cyan-bright)" : "rgba(255,255,255,0.08)"}`,
              background: category === cat ? "rgba(34,211,238,0.1)" : "transparent",
              color: category === cat ? "var(--cyan-bright)" : "rgba(255,255,255,0.4)",
              cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── 3D Stage — fixed pixel height, no overflow ── */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          height: stageH,
          overflow: "hidden",
          perspective: "1400px",
          perspectiveOrigin: "50% 50%",
          cursor: isDragging.current ? "grabbing" : "grab",
          touchAction: "none",
          marginTop: 24,
          userSelect: "none",
        }}
      >
        {/* Scene root — rotated by orbit RAF, centered */}
        <div
          ref={sceneRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {FLAVOURS.map((f, i) => (
            <FlavourCard
              key={f.id}
              flavour={f}
              onClick={() => setSelected(f)}
              ref={(el) => { cardRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>

      {/* ── Footer count ── */}
      <p style={{
        position: "relative", zIndex: 10, textAlign: "center",
        padding: "24px 0 clamp(48px,6vw,80px)",
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: "rgba(255,255,255,0.18)", letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}>
        {category === "All" ? FLAVOURS.length : FLAVOURS.filter(f => f.category === category).length} blends · {layout.toLowerCase()} view
        {morphing && " · morphing..."}
      </p>

      {/* ── Detail modal ── */}
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
