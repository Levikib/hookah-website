"use client";

import React, {
  useRef, useEffect, useState, useCallback, useLayoutEffect,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { SESSIONS, CUSTOM_PRICING, type SessionTier } from "@/data/sessions";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

gsap.registerPlugin(ScrollTrigger, Observer);

// ─── KES formatter ────────────────────────────────────────────────────────────
function kes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

// ─── Lottie-style SVG animations (hand-crafted, no external dep) ─────────────
function SmokeRing({ color }: { color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.9 }}>
      <style>{`
        @keyframes sr-ring {
          0%   { stroke-dashoffset: 150; opacity: 0; }
          20%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.4; }
        }
        @keyframes sr-inner {
          0%   { stroke-dashoffset: 95; opacity: 0; }
          30%  { opacity: 0.9; }
          100% { stroke-dashoffset: 0; opacity: 0.2; }
        }
        .sr-r1 { animation: sr-ring 2.4s ease-in-out infinite; }
        .sr-r2 { animation: sr-inner 2.4s ease-in-out infinite 0.4s; }
        .sr-r3 { animation: sr-ring 2.4s ease-in-out infinite 0.8s; }
      `}</style>
      <circle className="sr-r1" cx="24" cy="24" r="22" stroke={color} strokeWidth="2"
        strokeDasharray="138" strokeDashoffset="138" fill="none" />
      <circle className="sr-r2" cx="24" cy="24" r="14" stroke={color} strokeWidth="1.5"
        strokeDasharray="88" strokeDashoffset="88" fill="none" />
      <circle className="sr-r3" cx="24" cy="24" r="7" stroke={color} strokeWidth="1"
        strokeDasharray="44" strokeDashoffset="44" fill="none" />
    </svg>
  );
}

function FlameIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" fill="none">
      <style>{`
        @keyframes fl-sway {
          0%,100% { transform: skewX(-3deg) scaleY(1); }
          50%      { transform: skewX(4deg) scaleY(1.06); }
        }
        @keyframes fl-glow {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        .fl-body { animation: fl-sway 1.8s ease-in-out infinite; transform-origin: 50% 100%; }
        .fl-glow { animation: fl-glow 1.8s ease-in-out infinite; }
      `}</style>
      <g className="fl-glow">
        <ellipse cx="20" cy="46" rx="14" ry="5" fill={color} opacity="0.25" />
      </g>
      <g className="fl-body">
        <path d="M20 4 C14 14 6 18 8 30 C10 40 16 46 20 46 C24 46 30 40 32 30 C34 18 26 14 20 4Z"
          fill={color} opacity="0.85" />
        <path d="M20 18 C17 24 14 28 15 34 C16 39 18 42 20 42 C22 42 24 39 25 34 C26 28 23 24 20 18Z"
          fill="rgba(255,255,255,0.35)" />
      </g>
    </svg>
  );
}

function StarBurst({ color }: { color: string }) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 360) / 8;
    const r = i % 2 === 0 ? 20 : 10;
    const rad = (a * Math.PI) / 180;
    return `${24 + r * Math.cos(rad)},${24 + r * Math.sin(rad)}`;
  }).join(" ");
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <style>{`
        @keyframes sb-spin { to { transform: rotate(45deg); } }
        @keyframes sb-pulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        .sb-star { animation: sb-spin 6s linear infinite, sb-pulse 2s ease-in-out infinite;
          transform-origin: 24px 24px; }
      `}</style>
      <polygon className="sb-star" points={pts} fill={color} opacity="0.9" />
      <circle cx="24" cy="24" r="5" fill="white" opacity="0.6" />
    </svg>
  );
}

function WaveIcon({ color }: { color: string }) {
  return (
    <svg width="52" height="32" viewBox="0 0 52 32" fill="none">
      <style>{`
        @keyframes wv-move {
          0%   { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes wv-move2 {
          0%   { stroke-dashoffset: 160; }
          100% { stroke-dashoffset: -40; }
        }
        .wv1 { animation: wv-move  2s linear infinite; }
        .wv2 { animation: wv-move2 2s linear infinite 0.5s; }
        .wv3 { animation: wv-move  2s linear infinite 1s; }
      `}</style>
      <path className="wv1" d="M2 20 Q14 6 26 20 Q38 34 50 20" stroke={color} strokeWidth="2.5"
        fill="none" strokeDasharray="160" strokeDashoffset="160" opacity="0.9" />
      <path className="wv2" d="M2 16 Q14 2 26 16 Q38 30 50 16" stroke={color} strokeWidth="1.5"
        fill="none" strokeDasharray="130" strokeDashoffset="130" opacity="0.5" />
      <path className="wv3" d="M2 24 Q14 10 26 24 Q38 38 50 24" stroke={color} strokeWidth="1"
        fill="none" strokeDasharray="160" strokeDashoffset="160" opacity="0.3" />
    </svg>
  );
}

function CrownAnim({ color }: { color: string }) {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <style>{`
        @keyframes cr-rise { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
        @keyframes cr-shine { 0%,100%{opacity:0.3;} 50%{opacity:1;} }
        .cr-body { animation: cr-rise 2.2s ease-in-out infinite; }
        .cr-g1 { animation: cr-shine 1.4s ease-in-out infinite 0s; }
        .cr-g2 { animation: cr-shine 1.4s ease-in-out infinite 0.3s; }
        .cr-g3 { animation: cr-shine 1.4s ease-in-out infinite 0.6s; }
      `}</style>
      <g className="cr-body">
        <path d="M4 34 L8 16 L18 26 L24 8 L30 26 L40 16 L44 34 Z"
          fill={color} opacity="0.85" />
        <rect x="4" y="34" width="40" height="5" rx="2" fill={color} opacity="0.7" />
        <circle className="cr-g1" cx="24" cy="9" r="3.5" fill="white" />
        <circle className="cr-g2" cx="8.5" cy="16.5" r="2.5" fill="white" />
        <circle className="cr-g3" cx="39.5" cy="16.5" r="2.5" fill="white" />
      </g>
    </svg>
  );
}

function SkyIcon({ color }: { color: string }) {
  return (
    <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
      <style>{`
        @keyframes sky-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
        @keyframes sky-star { 0%,100%{opacity:0.2;} 50%{opacity:1;} }
        .sky-b { animation: sky-float 3s ease-in-out infinite; }
        .sky-s1 { animation: sky-star 1.2s ease-in-out infinite 0s; }
        .sky-s2 { animation: sky-star 1.2s ease-in-out infinite 0.4s; }
        .sky-s3 { animation: sky-star 1.2s ease-in-out infinite 0.8s; }
      `}</style>
      <g className="sky-b">
        <rect x="8" y="20" width="36" height="22" rx="4" fill={color} opacity="0.2" />
        <rect x="14" y="14" width="24" height="28" rx="4" fill={color} opacity="0.4" />
        <rect x="18" y="8" width="16" height="34" rx="4" fill={color} opacity="0.7" />
        <circle cx="26" cy="8" r="5" fill={color} opacity="0.85" />
      </g>
      <circle className="sky-s1" cx="6" cy="8" r="2" fill="white" />
      <circle className="sky-s2" cx="44" cy="4" r="1.5" fill="white" />
      <circle className="sky-s3" cx="48" cy="14" r="1" fill="white" />
    </svg>
  );
}

function BriefcaseAnim({ color }: { color: string }) {
  return (
    <svg width="48" height="44" viewBox="0 0 48 44" fill="none">
      <style>{`
        @keyframes br-pulse { 0%,100%{opacity:0.8;} 50%{opacity:1;} }
        .br-b { animation: br-pulse 2s ease-in-out infinite; }
      `}</style>
      <g className="br-b">
        <rect x="4" y="16" width="40" height="26" rx="4" fill={color} opacity="0.25" stroke={color} strokeWidth="1.5" />
        <rect x="16" y="8" width="16" height="10" rx="3" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="4" y1="28" x2="44" y2="28" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <rect x="20" y="24" width="8" height="8" rx="2" fill={color} opacity="0.6" />
      </g>
    </svg>
  );
}

function DiamondAnim({ color }: { color: string }) {
  return (
    <svg width="48" height="44" viewBox="0 0 48 44" fill="none">
      <style>{`
        @keyframes dm-spin { 0%,100%{transform:rotate(0deg) scale(1);} 50%{transform:rotate(10deg) scale(1.08);} }
        @keyframes dm-glow { 0%,100%{opacity:0.5;} 50%{opacity:1;} }
        .dm-g { transform-origin: 24px 22px; animation: dm-spin 3s ease-in-out infinite; }
        .dm-gl { animation: dm-glow 1.5s ease-in-out infinite; }
      `}</style>
      <g className="dm-gl">
        <ellipse cx="24" cy="38" rx="14" ry="4" fill={color} opacity="0.2" />
      </g>
      <g className="dm-g">
        <polygon points="24,4 44,20 24,42 4,20" fill={color} opacity="0.3" />
        <polygon points="24,4 44,20 24,42 4,20" fill="none" stroke={color} strokeWidth="1.5" />
        <polygon points="24,4 44,20 24,20 4,20" fill={color} opacity="0.5" />
        <line x1="4" y1="20" x2="44" y2="20" stroke="white" strokeWidth="0.8" opacity="0.4" />
        <line x1="24" y1="4" x2="24" y2="20" stroke="white" strokeWidth="0.8" opacity="0.3" />
      </g>
    </svg>
  );
}

function PaletteAnim({ color }: { color: string }) {
  const dots = [
    { cx: 18, cy: 18, c: "#e879f9", delay: "0s" },
    { cx: 30, cy: 16, c: "#22d3ee", delay: "0.2s" },
    { cx: 34, cy: 26, c: "#f59e0b", delay: "0.4s" },
    { cx: 28, cy: 34, c: "#34d399", delay: "0.6s" },
    { cx: 18, cy: 30, c: "#f87171", delay: "0.8s" },
  ];
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <style>{`
        @keyframes pal-dot { 0%,100%{r:4;opacity:0.7;} 50%{r:5.5;opacity:1;} }
        ${dots.map((d, i) => `.pd${i}{animation:pal-dot 1.6s ease-in-out infinite ${d.delay};}`).join("")}
      `}</style>
      <path d="M24 6 C14 6 6 14 6 24 C6 34 14 42 24 42 C26 42 28 40 28 38 C28 37 28.5 36 30 36 L38 36 C42 36 42 30 42 28 C42 16 34 6 24 6Z"
        fill={color} opacity="0.18" stroke={color} strokeWidth="1.5" />
      {dots.map((d, i) => (
        <circle key={i} className={`pd${i}`} cx={d.cx} cy={d.cy} r="4" fill={d.c} />
      ))}
    </svg>
  );
}

const LOTTIE_COMPONENTS: Record<string, React.ComponentType<{ color: string }>> = {
  solo:      SmokeRing,
  duo:       WaveIcon,
  squad:     FlameIcon,
  vip:       CrownAnim,
  rooftop:   SkyIcon,
  corporate: BriefcaseAnim,
  wedding:   DiamondAnim,
  custom:    PaletteAnim,
};

// ─── Session Detail Modal ─────────────────────────────────────────────────────

function SessionModal({
  session,
  onClose,
  onBook,
}: {
  session: SessionTier | null;
  onClose: () => void;
  onBook: (s: SessionTier) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRef.current || !contentRef.current) return;
    if (session) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.fromTo(contentRef.current, { y: 60, scale: 0.94 }, { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" });
    }
  }, [session]);

  const close = useCallback(() => {
    if (!modalRef.current || !contentRef.current) { onClose(); return; }
    gsap.to(contentRef.current, { y: 40, scale: 0.94, opacity: 0, duration: 0.25, ease: "power2.in" });
    gsap.to(modalRef.current, { opacity: 0, duration: 0.25, ease: "power2.in", onComplete: onClose });
  }, [onClose]);

  if (!session) return null;

  const LottieComp = LOTTIE_COMPONENTS[session.id] ?? SmokeRing;

  return (
    <div
      ref={modalRef}
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,3,10,0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 0 0",
      }}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 100%)",
          maxHeight: "88vh",
          overflowY: "auto",
          background: `linear-gradient(160deg, ${session.gradientFrom}33 0%, var(--nebula-mid) 40%)`,
          border: `1px solid ${session.color}55`,
          borderRadius: "24px 24px 0 0",
          padding: "0 0 40px",
          position: "relative",
        }}
      >
        {/* Hero strip */}
        <div style={{
          background: `linear-gradient(135deg, ${session.gradientFrom} 0%, ${session.gradientTo} 100%)`,
          padding: "28px 28px 20px",
          borderRadius: "24px 24px 0 0",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Large emoji watermark */}
          <div style={{
            position: "absolute",
            right: 20, top: 10,
            fontSize: 80,
            opacity: 0.15,
            lineHeight: 1,
            userSelect: "none",
          }}>
            {session.emoji}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, position: "relative", zIndex: 1 }}>
            <div style={{ flexShrink: 0 }}>
              <LottieComp color="white" />
            </div>
            <div>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.65)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}>
                {session.mood}
              </p>
              <h2 style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(36px, 5vw, 52px)",
                color: "white",
                letterSpacing: "0.04em",
                lineHeight: 0.95,
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                {session.name}
              </h2>
              <p style={{
                fontFamily: "var(--font-barlow)",
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.5,
              }}>
                {session.vibe}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px 0" }}>
          {/* Stats pills */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { icon: "⏱", label: session.duration },
              { icon: "👥", label: typeof session.people === "number" ? `${session.people} ${session.people === 1 ? "person" : "people"}` : "Custom size" },
              { icon: "🎯", label: session.mood },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                background: `${session.color}15`,
                border: `1px solid ${session.color}35`,
                borderRadius: 30,
                fontFamily: "var(--font-barlow)",
                fontWeight: 600,
                fontSize: 13,
                color: "rgba(255,255,255,0.85)",
              }}>
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>

          {/* Equipment */}
          {session.equipment.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                marginBottom: 12,
              }}>
                What's included
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {session.equipment.map((eq) => (
                  <div key={eq} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "var(--font-barlow)",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.72)",
                  }}>
                    <span style={{ color: session.color, fontSize: 14, flexShrink: 0 }}>✓</span>
                    {eq}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom pricing */}
          {session.isCustom && (
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                marginBottom: 12,
              }}>
                Starting rates
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "Base setup", value: kes(CUSTOM_PRICING.base) },
                  { label: "Per hookah", value: kes(CUSTOM_PRICING.perHookah) },
                  { label: "Per person", value: kes(CUSTOM_PRICING.perPerson) },
                  { label: "Per flavour", value: kes(CUSTOM_PRICING.perFlavour) },
                  { label: "Extra hour", value: kes(CUSTOM_PRICING.extraHour) },
                  { label: "Host/hr", value: kes(CUSTOM_PRICING.hostPerHour) },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: "7px 14px",
                    background: "rgba(255,107,53,0.09)",
                    border: "1px solid rgba(255,107,53,0.25)",
                    borderRadius: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                  }}>
                    <span style={{ color: "var(--orange)", fontWeight: 700 }}>{value}</span>
                    <span style={{ marginLeft: 4 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "20px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div>
              {!session.isCustom ? (
                <>
                  <p style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}>
                    starting from
                  </p>
                  <p style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: 40,
                    color: "var(--gold)",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}>
                    {kes(session.price)}
                  </p>
                </>
              ) : (
                <p style={{
                  fontFamily: "var(--font-barlow)",
                  fontSize: 14,
                  color: "var(--orange)",
                }}>
                  from {kes(CUSTOM_PRICING.base)} · built to your specs
                </p>
              )}
            </div>
            <button
              onClick={() => onBook(session)}
              className="btn-primary"
              style={{ fontSize: 14, padding: "14px 28px", flexShrink: 0 }}
            >
              {session.isCustom ? "Design My Vibe ↗" : "Book This Session ↗"}
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={close}
          style={{
            position: "absolute",
            top: 16, right: 16,
            width: 36, height: 36,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({
  session,
  onSelect,
  isMobile,
}: {
  session: SessionTier;
  onSelect: (s: SessionTier) => void;
  isMobile: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -8;
    const ry = ((x - cx) / cx) * 8;
    gsap.to(cardRef.current, {
      rotateX: rx, rotateY: ry,
      duration: 0.3, ease: "power2.out",
      transformPerspective: 900,
    });
    glowRef.current.style.background =
      `radial-gradient(circle at ${x}px ${y}px, ${session.color}22 0%, transparent 70%)`;
  }, [session.color, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current || !glowRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0, rotateY: 0,
      duration: 0.5, ease: "elastic.out(1, 0.5)",
    });
    glowRef.current.style.background = "none";
  }, []);

  const handleClick = useCallback(() => {
    if (!cardRef.current) { onSelect(session); return; }
    gsap.to(cardRef.current, {
      scale: 0.96, duration: 0.1, ease: "power2.out",
      onComplete: () => {
        gsap.to(cardRef.current, {
          scale: 1, duration: 0.3, ease: "elastic.out(1.2, 0.5)",
          onComplete: () => onSelect(session),
        });
      },
    });
  }, [onSelect, session]);

  const LottieComp = LOTTIE_COMPONENTS[session.id] ?? SmokeRing;
  const isCustom = session.isCustom;

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-session-card
      data-cursor-label={session.emoji}
      style={{
        width: isMobile ? "min(320px, 88vw)" : 300,
        flexShrink: 0,
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        background: "var(--nebula-mid)",
        border: `1px solid ${session.color}33`,
        willChange: "transform",
        transformStyle: "preserve-3d",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Mouse-follow glow */}
      <div ref={glowRef} style={{
        position: "absolute", inset: 0, zIndex: 0, borderRadius: 20, pointerEvents: "none",
      }} />

      {/* Gradient header */}
      <div style={{
        background: `linear-gradient(135deg, ${session.gradientFrom} 0%, ${session.gradientTo} 100%)`,
        padding: "22px 22px 16px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Emoji watermark */}
        <div style={{
          position: "absolute", right: 14, top: 10,
          fontSize: 56, opacity: 0.18, lineHeight: 1, userSelect: "none",
        }}>
          {session.emoji}
        </div>

        {/* Lottie icon */}
        <div style={{ marginBottom: 12, position: "relative", zIndex: 1 }}>
          <LottieComp color="rgba(255,255,255,0.9)" />
        </div>

        {/* Mood pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 30,
          padding: "3px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.75)",
          textTransform: "uppercase",
          position: "relative", zIndex: 1,
        }}>
          {session.mood}
        </div>
      </div>

      {/* Ticket perforation line */}
      <div style={{
        display: "flex", alignItems: "center",
        margin: "0 -1px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: "var(--nebula)",
          flexShrink: 0,
          marginLeft: -8,
          border: "1px solid rgba(255,255,255,0.06)",
        }} />
        <div style={{
          flex: 1,
          borderTop: `2px dashed ${session.color}44`,
          margin: "0 4px",
        }} />
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: "var(--nebula)",
          flexShrink: 0,
          marginRight: -8,
          border: "1px solid rgba(255,255,255,0.06)",
        }} />
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 22px 20px", position: "relative", zIndex: 1 }}>
        {/* Popular badge */}
        {session.popular && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.4)",
            borderRadius: 4,
            padding: "2px 8px",
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.12em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}>
            ★ Most loved
          </div>
        )}

        <h3 style={{
          fontFamily: "var(--font-bebas)",
          fontSize: 28,
          color: "#fff",
          letterSpacing: "0.04em",
          lineHeight: 1,
          textTransform: "uppercase",
          marginBottom: 4,
        }}>
          {session.name}
        </h3>

        <p style={{
          fontFamily: "var(--font-barlow)",
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.4,
          marginBottom: 14,
        }}>
          {session.tagline}
        </p>

        {/* Duration + capacity */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: session.color,
            background: `${session.color}18`,
            border: `1px solid ${session.color}33`,
            borderRadius: 4,
            padding: "3px 8px",
          }}>
            ⏱ {session.duration}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            padding: "3px 8px",
          }}>
            👥 {session.people}{typeof session.people === "number" && session.people === 1 ? " person" : typeof session.people === "number" ? " people" : ""}
          </span>
        </div>

        {/* Price + CTA */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 14,
          borderTop: `1px solid ${session.color}22`,
        }}>
          <div>
            {!isCustom ? (
              <>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  marginBottom: 1,
                }}>
                  from
                </p>
                <p style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: 28,
                  color: "var(--gold)",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}>
                  {kes(session.price)}
                </p>
              </>
            ) : (
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--orange)",
              }}>
                Custom pricing
              </p>
            )}
          </div>
          <div style={{
            fontFamily: "var(--font-barlow)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: session.color,
            display: "flex",
            alignItems: "center",
            gap: 4,
            paddingLeft: 12,
            borderLeft: `1px solid ${session.color}25`,
          }}>
            Tap to vibe →
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function SessionsSection() {
  const setBookingOpen    = useStore((s) => s.setBookingOpen);
  const setBookingSession = useStore((s) => s.setBookingSession);
  const isMobile = useIsMobile();

  const [selected, setSelected] = useState<SessionTier | null>(null);

  const sectionRef  = useRef<HTMLElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);

  // Drag-scroll state
  const dragRef    = useRef({ active: false, startX: 0, scrollLeft: 0 });

  // Update scroll progress indicator
  const updateProgress = useCallback(() => {
    if (!scrollRef.current || !progressRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const pct = scrollWidth <= clientWidth ? 0 : scrollLeft / (scrollWidth - clientWidth);
    progressRef.current.style.width = `${pct * 100}%`;

    // Active dot indicator
    if (!indicatorRef.current) return;
    const dots = indicatorRef.current.querySelectorAll<HTMLElement>(".sess-dot");
    const cardW = 316; // card 300 + gap 16
    const active = Math.round(scrollLeft / cardW);
    dots.forEach((d, i) => {
      d.style.width    = i === active ? "24px" : "8px";
      d.style.opacity  = i === active ? "1" : "0.35";
      d.style.background = i === active ? SESSIONS[i]?.color ?? "white" : "rgba(255,255,255,0.4)";
    });
  }, []);

  // Pointer drag-scroll (desktop)
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    dragRef.current = { active: true, startX: e.clientX, scrollLeft: scrollRef.current.scrollLeft };
    scrollRef.current.style.cursor = "grabbing";
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active || !scrollRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    scrollRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
    updateProgress();
  }, [updateProgress]);

  const onPointerUp = useCallback(() => {
    if (!scrollRef.current) return;
    dragRef.current.active = false;
    scrollRef.current.style.cursor = "grab";
  }, []);

  // Header entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true } }
      );

      // Stagger cards
      const cards = scrollRef.current?.querySelectorAll<HTMLElement>("[data-session-card]");
      if (cards?.length) {
        gsap.fromTo(
          Array.from(cards),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => el.removeEventListener("scroll", updateProgress);
  }, [updateProgress]);

  const handleSelect = useCallback((s: SessionTier) => {
    if (s.isCustom) { setBookingSession(s); setBookingOpen(true); }
    else setSelected(s);
  }, [setBookingOpen, setBookingSession]);

  const handleBook = useCallback((s: SessionTier) => {
    setBookingSession(s);
    setBookingOpen(true);
    setSelected(null);
  }, [setBookingSession, setBookingOpen]);

  const scrollTo = useCallback((dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amt = 320;
    scrollRef.current.scrollBy({ left: dir === "right" ? amt : -amt, behavior: "smooth" });
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="sessions"
        style={{
          background: "var(--nebula)",
          minHeight: "100vh",
          padding: "clamp(60px, 8vw, 100px) 0 80px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Ambient gradient blobs */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            top: "-10%", left: "-5%",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,121,249,0.08) 0%, transparent 70%)",
            bottom: "-5%", right: "-5%",
          }} />
        </div>

        {/* ── Header ── */}
        <div
          ref={headerRef}
          style={{
            padding: "0 clamp(20px, 6vw, 80px)",
            marginBottom: 48,
            position: "relative", zIndex: 1,
            opacity: 0,
          }}
        >
          <p className="section-label">Sessions</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(52px, 8vw, 110px)",
                color: "var(--text-primary)",
                letterSpacing: "0.04em",
                lineHeight: 0.9,
                textTransform: "uppercase",
              }}>
                Pick Your<br />
                <span style={{ color: "var(--gold)" }}>Vibe</span>
              </h2>
              <p style={{
                fontFamily: "var(--font-barlow)",
                fontSize: 16,
                color: "rgba(255,255,255,0.45)",
                marginTop: 14,
                maxWidth: 440,
              }}>
                Eight ways to enjoy the ritual. From solo unwinding to full send celebrations — we set it all up, you just show up.
              </p>
            </div>

            {/* Arrow nav — desktop */}
            {!isMobile && (
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                {(["left", "right"] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => scrollTo(dir)}
                    style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.2)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                  >
                    {dir === "left" ? "←" : "→"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Horizontal Scroll Track ── */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            ref={scrollRef}
            className="no-scrollbar"
            onPointerDown={isMobile ? undefined : onPointerDown}
            onPointerMove={isMobile ? undefined : onPointerMove}
            onPointerUp={isMobile ? undefined : onPointerUp}
            onPointerCancel={isMobile ? undefined : onPointerUp}
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              overflowY: "visible",
              padding: "24px clamp(20px, 6vw, 80px) 32px",
              cursor: isMobile ? "default" : "grab",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {SESSIONS.map((session) => (
              <div
                key={session.id}
                style={{ scrollSnapAlign: "start", flexShrink: 0 }}
              >
                <TicketCard
                  session={session}
                  onSelect={handleSelect}
                  isMobile={isMobile}
                />
              </div>
            ))}

            {/* End spacer */}
            <div style={{ width: "max(20px, calc(6vw - 16px))", flexShrink: 0 }} />
          </div>

          {/* Progress bar */}
          <div style={{
            margin: "0 clamp(20px, 6vw, 80px)",
            height: 2,
            background: "rgba(255,255,255,0.07)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div
              ref={progressRef}
              style={{
                height: "100%",
                width: "0%",
                background: "linear-gradient(90deg, var(--violet), var(--magenta))",
                borderRadius: 2,
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {/* Dot indicator */}
          <div
            ref={indicatorRef}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 16,
            }}
          >
            {SESSIONS.map((s, i) => (
              <button
                key={s.id}
                className="sess-dot"
                onClick={() => {
                  if (!scrollRef.current) return;
                  scrollRef.current.scrollTo({ left: i * 316, behavior: "smooth" });
                }}
                style={{
                  width: i === 0 ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === 0 ? (SESSIONS[0]?.color ?? "white") : "rgba(255,255,255,0.4)",
                  border: "none",
                  opacity: i === 0 ? 1 : 0.35,
                  transition: "width 0.3s ease, opacity 0.3s ease, background 0.3s ease",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Footer note ── */}
        <div style={{
          textAlign: "center",
          marginTop: 40,
          padding: "0 5vw",
          position: "relative", zIndex: 1,
        }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.18)",
            textTransform: "uppercase",
          }}>
            All sessions include setup · teardown · premium coal management · delivery within Nairobi
          </p>
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <SessionModal
          session={selected}
          onClose={() => setSelected(null)}
          onBook={handleBook}
        />
      )}
    </>
  );
}
