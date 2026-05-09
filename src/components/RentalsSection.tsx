"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RENTAL_MODELS } from "@/data/rentals";
import type { RentalModel } from "@/data/rentals";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";
import gsap from "gsap";

// ─── Tier → accent mapping (fallback to model's own accentColor) ─────────────
const TIER_LABEL: Record<string, string> = {
  Standard: "STANDARD",
  Premium: "PREMIUM",
  Luxury: "LUXURY",
  Event: "EVENT",
};

// ─── Pedestal depth layout (translateZ, translateX per model index 0-5) ───────
// Closest → furthest: index 0 is front-centre, spreading out
const PEDESTAL_POSITIONS: { tz: number; tx: number; scale: number }[] = [
  { tz: 160,  tx: -560, scale: 1.18 }, // front-left
  { tz: 60,   tx: -200, scale: 1.06 }, // mid-left
  { tz: -80,  tx: 120,  scale: 0.94 }, // back-left-centre
  { tz: -80,  tx: -120, scale: 0.94 }, // back-right-centre
  { tz: 60,   tx: 200,  scale: 1.06 }, // mid-right
  { tz: 160,  tx: 560,  scale: 1.18 }, // front-right
];

// ─── Detailed hookah SVG ──────────────────────────────────────────────────────
function HookahSVG({ color, height = 200 }: { color: string; height?: number }) {
  const w = height * 0.45;
  return (
    <svg
      viewBox="0 0 90 200"
      width={w}
      height={height}
      fill="none"
      aria-hidden="true"
      style={{ display: "block", filter: `drop-shadow(0 0 12px ${color}88)` }}
    >
      {/* Coal tray rim */}
      <ellipse cx="45" cy="12" rx="20" ry="6" fill={color} opacity="0.55" />
      {/* Bowl */}
      <path d="M30 12 Q28 26 33 32 Q45 36 57 32 Q62 26 60 12 Z" fill={color} opacity="0.75" />
      {/* Bowl neck */}
      <rect x="41" y="32" width="8" height="10" rx="3" fill={color} opacity="0.6" />
      {/* Tray plate */}
      <ellipse cx="45" cy="44" rx="22" ry="7" fill={color} opacity="0.45" />
      <ellipse cx="45" cy="44" rx="16" ry="5" fill={color} opacity="0.3" />
      {/* Main shaft — tapered */}
      <path d="M41 44 L43 130 L47 130 L49 44 Z" fill={color} opacity="0.55" rx="3" />
      {/* Shaft ornament ring 1 */}
      <ellipse cx="45" cy="80" rx="7" ry="3" fill={color} opacity="0.7" />
      {/* Shaft ornament ring 2 */}
      <ellipse cx="45" cy="108" rx="6" ry="2.5" fill={color} opacity="0.65" />
      {/* Vase body */}
      <path
        d="M28 130 Q20 148 26 162 Q35 174 45 175 Q55 174 64 162 Q70 148 62 130 Z"
        fill={color}
        opacity="0.6"
      />
      {/* Vase highlight */}
      <path
        d="M33 135 Q28 148 32 160 Q36 166 40 168"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Base foot */}
      <ellipse cx="45" cy="175" rx="26" ry="9" fill={color} opacity="0.65" />
      <ellipse cx="45" cy="178" rx="18" ry="6" fill={color} opacity="0.4" />
      {/* Hose port */}
      <circle cx="62" cy="145" r="4" fill={color} opacity="0.8" />
      {/* Hose tube */}
      <path
        d="M66 145 Q84 140 86 158 Q88 174 76 178 Q68 182 65 176"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      {/* Mouthpiece */}
      <ellipse cx="65" cy="176" rx="5" ry="3.5" fill={color} opacity="0.75" />
      {/* Inner smoke glow */}
      <ellipse cx="45" cy="150" rx="14" ry="18" fill={color} opacity="0.06" />
    </svg>
  );
}

// ─── Spotlight cone (light from ceiling) ─────────────────────────────────────
function Spotlight({ color, brightness }: { color: string; brightness: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -220,
        left: "50%",
        transform: "translateX(-50%)",
        width: 160,
        height: 340,
        background: `linear-gradient(to bottom, ${color}${Math.round(brightness * 255).toString(16).padStart(2, "0")}, transparent 80%)`,
        clipPath: "polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%)",
        pointerEvents: "none",
        transition: "opacity 0.4s ease",
      }}
      aria-hidden="true"
    />
  );
}

// ─── Single Pedestal + Hookah unit ───────────────────────────────────────────
function PedestalUnit({
  model,
  index,
  isSelected,
  isDeselected,
  onSelect,
  pedestalRef,
}: {
  model: RentalModel;
  index: number;
  isSelected: boolean;
  isDeselected: boolean;
  onSelect: () => void;
  pedestalRef: (el: HTMLDivElement | null) => void;
}) {
  const pos = PEDESTAL_POSITIONS[index];
  const [hovered, setHovered] = useState(false);
  const hookahRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<gsap.core.Tween | null>(null);

  // Idle sway animation
  useEffect(() => {
    if (!hookahRef.current) return;
    idleRef.current = gsap.to(hookahRef.current, {
      rotationZ: -3,
      duration: 4 + index * 0.7,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    return () => { idleRef.current?.kill(); };
  }, [index]);

  // Hover lift
  useEffect(() => {
    if (!hookahRef.current) return;
    gsap.to(hookahRef.current, {
      y: hovered && !isSelected ? -8 : 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [hovered, isSelected]);

  const accent = model.accentColor;
  const spotBrightness = isSelected ? 0.22 : hovered ? 0.14 : 0.08;

  return (
    <div
      ref={pedestalRef}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transformOrigin: "bottom center",
        transform: `translateX(-50%) translateX(${pos.tx}px) translateZ(${pos.tz}px) scale(${pos.scale})`,
        opacity: isDeselected ? 0.28 : 1,
        transition: "opacity 0.5s ease",
        cursor: "pointer",
        width: 160,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      aria-label={`Select ${model.name}`}
    >
      {/* Ceiling spotlight */}
      <Spotlight color={accent} brightness={spotBrightness} />

      {/* Hookah visual */}
      <div
        ref={hookahRef}
        style={{
          marginBottom: 12,
          transformOrigin: "bottom center",
          transition: "filter 0.3s ease",
          filter: isSelected
            ? `drop-shadow(0 0 28px ${accent}) drop-shadow(0 -6px 16px ${accent}88)`
            : `drop-shadow(0 0 8px ${accent}66)`,
        }}
      >
        <HookahSVG color={accent} height={190} />
      </div>

      {/* Pedestal base — trapezoid cylinder illusion */}
      <div
        style={{
          position: "relative",
          width: 130,
          height: 64,
          clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
          background: `linear-gradient(160deg, #1a1235 0%, #0d0a1e 60%, #05030a 100%)`,
          border: "none",
          boxShadow: isSelected
            ? `0 0 0 2px ${accent}, 0 0 40px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.08)`
            : `0 0 0 1px ${accent}44, 0 0 16px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.04)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Model name on pedestal face */}
        <span
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: 13,
            letterSpacing: "0.1em",
            color: isSelected ? accent : "rgba(255,255,255,0.75)",
            textTransform: "uppercase",
            lineHeight: 1,
            textAlign: "center",
            padding: "0 8px",
            transition: "color 0.3s",
          }}
        >
          {model.name}
        </span>
        {/* Tier badge */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.16em",
            color: accent,
            border: `1px solid ${accent}66`,
            padding: "1px 6px",
            borderRadius: 3,
            lineHeight: 1.4,
            textTransform: "uppercase",
          }}
        >
          {TIER_LABEL[model.tier]}
        </span>
      </div>

      {/* Floor glow puddle */}
      <div
        style={{
          width: 120,
          height: 16,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accent}44 0%, transparent 75%)`,
          marginTop: -4,
          transition: "opacity 0.4s ease",
          opacity: isSelected ? 1 : 0.5,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

// ─── Detail Panel (desktop: right sidebar, mobile: bottom sheet) ──────────────
function DetailPanel({
  model,
  onClose,
  isMobile,
}: {
  model: RentalModel;
  onClose: () => void;
  isMobile: boolean;
}) {
  const addToCart = useStore((s) => s.addToCart);
  const panelRef = useRef<HTMLDivElement>(null);
  const accent = model.accentColor;

  // Slide in on mount
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (isMobile) {
      gsap.fromTo(el, { y: "100%" }, { y: "0%", duration: 0.45, ease: "power3.out" });
    } else {
      gsap.fromTo(el, { x: "100%" }, { x: "0%", duration: 0.45, ease: "power3.out" });
    }
  }, [isMobile]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleReserve = () => {
    addToCart({
      id: `rental-${model.id}`,
      type: "rental",
      name: `${model.name} Hookah (1 day)`,
      price: model.dailyRate,
      quantity: 1,
    });
    onClose();
  };

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "72vh",
        borderRadius: "20px 20px 0 0",
        zIndex: 200,
        overflowY: "auto",
      }
    : {
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: 360,
        zIndex: 200,
        overflowY: "auto",
      };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(5,3,10,0.55)",
          zIndex: 199,
          backdropFilter: "blur(2px)",
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          ...panelStyle,
          background: "linear-gradient(160deg, #120d28 0%, #0d0a1e 100%)",
          borderLeft: isMobile ? "none" : `1px solid ${accent}33`,
          borderTop: isMobile ? `2px solid ${accent}` : "none",
          boxShadow: isMobile
            ? `0 -24px 60px rgba(5,3,10,0.8)`
            : `-24px 0 60px rgba(5,3,10,0.8)`,
          padding: "32px 28px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${model.name} details`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          style={{
            alignSelf: "flex-end",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            color: "rgba(255,255,255,0.7)",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Hookah preview */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: -12 }}>
          <HookahSVG color={accent} height={160} />
        </div>

        {/* Tier badge */}
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: accent,
              border: `1px solid ${accent}66`,
              padding: "3px 10px",
              borderRadius: 4,
              textTransform: "uppercase",
            }}
          >
            {TIER_LABEL[model.tier]}
          </span>
        </div>

        {/* Name + tagline */}
        <div>
          <h3
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: 38,
              letterSpacing: "0.06em",
              color: "#f0f2fa",
              lineHeight: 0.95,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            {model.name}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-barlow)",
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.5,
            }}
          >
            {model.tagline}
          </p>
        </div>

        {/* Specs grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px 20px",
            padding: "18px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { label: "Height", value: model.height },
            { label: "Material", value: model.material },
            { label: "Hose Config", value: model.hoseType },
            { label: "Available", value: `${model.available} units` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-barlow)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#f0f2fa",
                  lineHeight: 1.3,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              flex: 1,
              padding: "14px 16px",
              background: `${accent}12`,
              border: `1px solid ${accent}33`,
              borderRadius: 10,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Daily Rate
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 26,
                color: accent,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ${model.dailyRate}
            </p>
          </div>
          <div
            style={{
              flex: 1,
              padding: "14px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Per Session
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 26,
                color: "rgba(255,255,255,0.55)",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ${model.sessionRate}
            </p>
          </div>
        </div>

        {/* Stock badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: model.available > 2 ? "#22d3ee" : model.available === 1 ? "#fbbf24" : "#6b5f88",
              boxShadow:
                model.available > 0
                  ? `0 0 8px ${model.available > 2 ? "#22d3ee" : "#fbbf24"}`
                  : "none",
            }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
              color:
                model.available > 2
                  ? "var(--cyan-bright)"
                  : model.available === 1
                  ? "var(--gold-bright)"
                  : "var(--text-dim)",
              textTransform: "uppercase",
            }}
          >
            {model.available > 2
              ? "In Stock"
              : model.available === 1
              ? "Last Unit"
              : `${model.available} Left`}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={handleReserve}
          className="btn-teal"
          style={{ width: "100%", fontSize: 14, marginTop: "auto" }}
        >
          Reserve This Model
        </button>
      </div>
    </>
  );
}

// ─── Main Showroom Section ────────────────────────────────────────────────────
export default function RentalsSection() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const showroomRef = useRef<HTMLDivElement>(null);
  const pedestalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);

  // Mouse parallax state
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // ── Entrance animation via IntersectionObserver ──────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entered) {
          setEntered(true);
          // Stagger pedestals rising from below
          pedestalRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.fromTo(
              el,
              { y: 80, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, delay: i * 0.1, ease: "power3.out" }
            );
          });
          // Header fade in
          if (headerRef.current) {
            gsap.fromTo(
              headerRef.current,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }
            );
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [entered]);

  // ── Mouse parallax RAF loop ───────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseTarget.current = {
      x: ((e.clientX - cx) / rect.width) * 2,
      y: ((e.clientY - cy) / rect.height) * 2,
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const loop = () => {
      const LERP = 0.08;
      mouseCurrent.current.x +=
        (mouseTarget.current.x - mouseCurrent.current.x) * LERP;
      mouseCurrent.current.y +=
        (mouseTarget.current.y - mouseCurrent.current.y) * LERP;

      if (showroomRef.current) {
        const rx = mouseCurrent.current.y * -4; // rotateX degrees
        const ry = mouseCurrent.current.x * 6;  // rotateY degrees
        showroomRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  // ── Select / deselect logic ───────────────────────────────────────────────
  const handleSelect = useCallback((idx: number) => {
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  }, []);

  const handleClose = useCallback(() => setSelectedIdx(null), []);

  // ── Initial state: pedestals invisible until entrance anim ───────────────
  const pedestalInitialStyle: React.CSSProperties = entered
    ? {}
    : { opacity: 0, transform: "translateY(80px)" };

  return (
    <section
      id="rentals"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--nebula)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Showroom Environment: ceiling ───────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          background:
            "linear-gradient(to bottom, #020108 0%, #0a0718 60%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Ceiling panel texture lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "28%",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 60px)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Side walls ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(5,3,10,0.85) 0%, transparent 18%, transparent 82%, rgba(5,3,10,0.85) 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        ref={headerRef}
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "clamp(48px,7vw,90px) 5vw 0",
          opacity: 0, // set to 0; entrance anim sets to 1
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "var(--cyan-bright)",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          THE SHOWROOM · 6 MODELS
        </p>
        <h2
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(44px, 7vw, 96px)",
            letterSpacing: "0.05em",
            color: "var(--text-primary)",
            lineHeight: 0.92,
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          CHOOSE YOUR PIECE.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-barlow)",
            fontSize: "clamp(12px, 1.4vw, 15px)",
            color: "rgba(255,255,255,0.4)",
            maxWidth: 420,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Step inside. Six masterpieces await. Click a pedestal to inspect.
        </p>
      </div>

      {/* ── 3D Showroom Stage ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: isMobile ? 420 : 560,
          perspective: 1200,
          perspectiveOrigin: "50% 30%",
          zIndex: 5,
        }}
      >
        {/* Showroom group — receives mouse parallax rotation */}
        <div
          ref={showroomRef}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transformOrigin: "50% 50%",
            transition: isMobile ? "none" : undefined,
          }}
        >
          {/* ── Floor ─────────────────────────────────────────────────── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 0,
              left: "-20%",
              right: "-20%",
              height: "55%",
              background: "linear-gradient(to bottom, #0d0a1e 0%, #05030a 100%)",
              backgroundImage: [
                "linear-gradient(to bottom, #0d0a1e 0%, #05030a 100%)",
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 80px)",
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 60px)",
              ].join(", "),
              transformStyle: "preserve-3d",
            }}
          />

          {/* Floor reflection shimmer */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "25%",
              background:
                "linear-gradient(to top, rgba(124,58,237,0.04) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          {/* ── Pedestals container ───────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              bottom: isMobile ? "18%" : "22%",
              left: 0,
              right: 0,
              height: 320,
              transformStyle: "preserve-3d",
            }}
          >
            {isMobile ? (
              // Mobile: horizontal scroll list instead of 3D perspective
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  scrollbarWidth: "none",
                  padding: "20px 10vw",
                  alignItems: "flex-end",
                  height: "100%",
                }}
              >
                {RENTAL_MODELS.map((model, i) => (
                  <div
                    key={model.id}
                    onClick={() => handleSelect(i)}
                    style={{
                      flex: "0 0 auto",
                      scrollSnapAlign: "center",
                      width: 130,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      opacity: selectedIdx !== null && selectedIdx !== i ? 0.3 : 1,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <div style={{ filter: `drop-shadow(0 0 12px ${model.accentColor}88)` }}>
                      <HookahSVG color={model.accentColor} height={140} />
                    </div>
                    <div
                      style={{
                        width: "100%",
                        background: "rgba(13,10,30,0.95)",
                        border: `1px solid ${model.accentColor}44`,
                        borderRadius: 8,
                        padding: "8px 10px",
                        textAlign: "center",
                        marginTop: 8,
                        boxShadow:
                          selectedIdx === i
                            ? `0 0 20px ${model.accentColor}55`
                            : "none",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-bebas)",
                          fontSize: 14,
                          color: "#f0f2fa",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {model.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 8,
                          color: model.accentColor,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                        }}
                      >
                        {TIER_LABEL[model.tier]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop: full 3D perspective pedestals
              RENTAL_MODELS.map((model, i) => (
                <PedestalUnit
                  key={model.id}
                  model={model}
                  index={i}
                  isSelected={selectedIdx === i}
                  isDeselected={selectedIdx !== null && selectedIdx !== i}
                  onSelect={() => handleSelect(i)}
                  pedestalRef={(el) => {
                    pedestalRefs.current[i] = el;
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Hint text ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 5vw clamp(32px, 5vw, 60px)",
        }}
      >
        {isMobile ? (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--cyan-bright)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            ← swipe · tap to inspect →
          </p>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Click a pedestal · Move cursor to pan the showroom
          </p>
        )}
      </div>

      {/* ── Detail Panel (portal-like, fixed) ───────────────────────────── */}
      {selectedIdx !== null && (
        <DetailPanel
          model={RENTAL_MODELS[selectedIdx]}
          onClose={handleClose}
          isMobile={isMobile}
        />
      )}
    </section>
  );
}
