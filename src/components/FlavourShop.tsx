"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FLAVOURS, CATEGORIES, getStockStatus } from "@/data/flavours";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";
import gsap from "gsap";

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

// ─── hex → rgb string ────────────────────────────────────────────────────────
function hexRgb(hex: string) {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

// ─── Animated jar SVG ────────────────────────────────────────────────────────
function JarSVG({ color, stock, isSelected, isOut }: {
  color: string; stock: number; isSelected: boolean; isOut: boolean;
}) {
  const rgb    = hexRgb(color);
  const status = getStockStatus(stock);
  const fillH  = isOut ? 0 : status === "critical" ? 28 : status === "low" ? 46 : 68;

  const bubbles = [
    { cx: 22, r: 2.5, delay: 0 },
    { cx: 38, r: 1.8, delay: 0.6 },
    { cx: 14, r: 1.5, delay: 1.1 },
    { cx: 50, r: 2.2, delay: 0.3 },
    { cx: 30, r: 1.4, delay: 1.7 },
    { cx: 44, r: 1.8, delay: 0.9 },
  ];

  return (
    <svg
      viewBox="0 0 66 100"
      width="66" height="100"
      style={{ overflow: "visible", filter: isSelected ? `drop-shadow(0 0 14px rgba(${rgb},0.8)) drop-shadow(0 0 28px rgba(${rgb},0.4))` : `drop-shadow(0 0 6px rgba(${rgb},0.35))`, transition: "filter 0.35s ease" }}
    >
      <defs>
        <clipPath id={`jar-clip-${color.slice(1)}`}>
          <rect x="5" y="30" width="56" height="66" rx="8" />
        </clipPath>
        <linearGradient id={`glass-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="40%"  stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
        <linearGradient id={`liquid-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={`rgba(${rgb},0.55)`} />
          <stop offset="100%" stopColor={`rgba(${rgb},0.85)`} />
        </linearGradient>
      </defs>

      {/* Lid */}
      <rect x="18" y="6" width="30" height="14" rx="5"
        fill={isOut ? "rgba(60,55,75,0.8)" : `rgba(${rgb},0.9)`}
        stroke={`rgba(${rgb},${isOut ? 0.2 : 0.6})`} strokeWidth="1"
      />
      {/* Lid grip lines */}
      {!isOut && [22,27,32,37].map(x => (
        <rect key={x} x={x} y="9" width="2" height="8" rx="1" fill="rgba(255,255,255,0.28)" />
      ))}

      {/* Neck */}
      <rect x="20" y="18" width="26" height="12" rx="2"
        fill={`rgba(${rgb},${isOut ? 0.08 : 0.15})`}
        stroke={`rgba(${rgb},${isOut ? 0.1 : 0.5})`} strokeWidth="1"
      />

      {/* Jar body */}
      <rect x="5" y="28" width="56" height="68" rx="9"
        fill={`rgba(${rgb},${isOut ? 0.05 : 0.1})`}
        stroke={`rgba(${rgb},${isOut ? 0.15 : isSelected ? 0.95 : 0.7})`}
        strokeWidth={isSelected ? 2 : 1.5}
      />

      {/* Liquid fill */}
      {!isOut && (
        <g clipPath={`url(#jar-clip-${color.slice(1)})`}>
          <rect
            x="5" y={96 - fillH} width="56" height={fillH}
            fill={`url(#liquid-${color.slice(1)})`}
            style={{ transition: "all 0.6s ease" }}
          >
            {/* Slosh animation */}
            <animate
              attributeName="y"
              values={`${96 - fillH};${96 - fillH - 2};${96 - fillH + 1};${96 - fillH}`}
              dur="3.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
            />
          </rect>

          {/* Surface shimmer */}
          <rect x="5" y={95 - fillH} width="56" height="3" fill="rgba(255,255,255,0.3)" rx="1">
            <animate attributeName="y" values={`${95 - fillH};${93 - fillH};${96 - fillH};${95 - fillH}`} dur="3.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1" />
          </rect>

          {/* Bubbles */}
          {bubbles.map((b, i) => (
            <circle key={i} cx={b.cx} cy="88" r={b.r} fill="rgba(255,255,255,0.75)">
              <animate
                attributeName="cy"
                values={`96;${96 - fillH - 4};96`}
                dur={`${1.6 + i * 0.22}s`}
                begin={`${b.delay}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
              />
              <animate
                attributeName="opacity"
                values="0.8;0.2;0"
                dur={`${1.6 + i * 0.22}s`}
                begin={`${b.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${b.r};${b.r * 0.6};0`}
                dur={`${1.6 + i * 0.22}s`}
                begin={`${b.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      )}

      {/* Glass shine */}
      <rect x="10" y="34" width="6" height="36" rx="3" fill="rgba(255,255,255,0.18)" />
      <rect x="18" y="34" width="2" height="16" rx="1" fill="rgba(255,255,255,0.1)" />

      {/* Glass body overlay (subtle depth) */}
      <rect x="5" y="28" width="56" height="68" rx="9"
        fill={`url(#glass-${color.slice(1)})`}
        pointerEvents="none"
      />

      {/* Out of stock stamp */}
      {isOut && (
        <g transform="translate(33,62) rotate(-22)">
          <rect x="-18" y="-10" width="36" height="20" rx="3" fill="none" stroke="rgba(140,130,160,0.3)" strokeWidth="1.5" />
          <text textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-bebas)" fontSize="9" fill="rgba(140,130,160,0.4)" letterSpacing="1.5">EMPTY</text>
        </g>
      )}

      {/* Low stock bar */}
      {status === "critical" && !isOut && (
        <rect x="5" y="90" width="56" height="6" rx="0 0 9 9" fill="rgba(255,107,53,0.4)" />
      )}
    </svg>
  );
}

// ─── Jar Detail Modal ─────────────────────────────────────────────────────────
function JarModal({
  flavour,
  onClose,
  onAdd,
}: {
  flavour: (typeof FLAVOURS)[0];
  onClose: () => void;
  onAdd: (id: number, size: Size, price: number) => void;
}) {
  const rgb    = hexRgb(flavour.color);
  const status = getStockStatus(flavour.stock);
  const isOut  = status === "out";
  const [size, setSize] = useState<Size>("50g");
  const [added, setAdded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(panelRef.current, { y: 48, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" });
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(panelRef.current, { y: 32, opacity: 0, scale: 0.95, duration: 0.2, onComplete: onClose });
  }, [onClose]);

  const handleAdd = () => {
    if (isOut || added) return;
    const price = calcPrice(flavour.price, size);
    onAdd(flavour.id, size, price);
    setAdded(true);
    setTimeout(() => { setAdded(false); close(); }, 1000);
  };

  const price = calcPrice(flavour.price, size);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && close()}
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(4,2,10,0.82)",
        backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "min(580px, 96vw)",
          background: "linear-gradient(160deg, #0d0a1e 0%, #110d28 60%, #0a0818 100%)",
          border: `1.5px solid rgba(${rgb},0.5)`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 0 0 1px rgba(${rgb},0.15), 0 32px 80px rgba(0,0,0,0.85), 0 0 60px rgba(${rgb},0.12)`,
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 3, background: `linear-gradient(to right, transparent, rgba(${rgb},1), transparent)` }} />

        {/* Close */}
        <button
          onClick={close}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.6)", fontSize: 20, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >×</button>

        {/* Hero row — jar + identity */}
        <div style={{
          display: "flex", alignItems: "center", gap: 24,
          padding: "28px 32px 20px",
          borderBottom: `1px solid rgba(${rgb},0.15)`,
        }}>
          <div style={{ flexShrink: 0 }}>
            <JarSVG color={flavour.color} stock={flavour.stock} isSelected={true} isOut={isOut} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category + intensity badges */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em",
                padding: "3px 10px", borderRadius: 20,
                border: `1px solid rgba(${rgb},0.6)`, color: flavour.color,
                background: `rgba(${rgb},0.12)`, textTransform: "uppercase",
              }}>{flavour.category}</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
                padding: "3px 10px", borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
              }}>{flavour.intensity}</span>
              {status !== "normal" && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
                  padding: "3px 10px", borderRadius: 20, textTransform: "uppercase",
                  border: `1px solid ${isOut ? "rgba(255,255,255,0.1)" : "rgba(255,107,53,0.5)"}`,
                  color: isOut ? "rgba(180,170,200,0.4)" : "#ff6b35",
                  background: isOut ? "transparent" : "rgba(255,107,53,0.08)",
                }}>{isOut ? "Sold Out" : status === "critical" ? "Almost Gone" : "Low Stock"}</span>
              )}
            </div>
            <h2 style={{
              fontFamily: "var(--font-bebas)", fontSize: 38,
              letterSpacing: "0.04em", textTransform: "uppercase",
              color: "#f0f2fa", lineHeight: 1, marginBottom: 8,
            }}>{flavour.name} <span style={{ fontSize: 32 }}>{flavour.emoji}</span></h2>
            <p style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: 15, lineHeight: 1.6,
              color: "rgba(240,235,255,0.65)",
            }}>{flavour.description}</p>
          </div>
        </div>

        {/* Flavour notes */}
        <div style={{ padding: "18px 32px", borderBottom: `1px solid rgba(${rgb},0.1)` }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10,
          }}>Tasting Notes</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {flavour.notes.map(n => (
              <span key={n} style={{
                fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 13,
                padding: "5px 14px", borderRadius: 24,
                background: `rgba(${rgb},0.1)`,
                border: `1px solid rgba(${rgb},0.28)`,
                color: "#e8e4f4",
              }}>{n}</span>
            ))}
          </div>
          {flavour.pairsWith.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Pairs with</span>
              {flavour.pairsWith.map(p => (
                <span key={p} style={{
                  fontFamily: "var(--font-barlow)", fontSize: 11,
                  padding: "3px 10px", borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(220,215,240,0.5)",
                }}>+ {p}</span>
              ))}
            </div>
          )}
        </div>

        {/* Size + CTA */}
        <div style={{ padding: "20px 32px 28px" }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12,
          }}>Choose your quantity</p>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {SIZE_OPTIONS.map(({ label, desc }) => {
              const szPrice = calcPrice(flavour.price, label);
              const active  = size === label;
              return (
                <button
                  key={label}
                  onClick={() => setSize(label)}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 12,
                    border: active ? `1.5px solid rgba(${rgb},0.9)` : "1.5px solid rgba(255,255,255,0.1)",
                    background: active ? `rgba(${rgb},0.16)` : "rgba(255,255,255,0.03)",
                    cursor: "pointer", transition: "all 0.18s ease",
                    boxShadow: active ? `0 0 18px rgba(${rgb},0.25)` : "none",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: "0.08em", color: active ? flavour.color : "rgba(255,255,255,0.5)" }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 3 }}>{desc}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: active ? flavour.color : "rgba(255,255,255,0.35)", marginTop: 4 }}>{kes(szPrice)}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={close}
              style={{
                padding: "13px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12,
                letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
              }}
            >Back</button>
            <button
              onClick={handleAdd}
              disabled={isOut}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 10,
                border: `1.5px solid rgba(${rgb},${isOut ? 0.2 : 0.8})`,
                background: added
                  ? `rgba(${rgb},0.9)`
                  : isOut
                  ? "rgba(255,255,255,0.04)"
                  : `rgba(${rgb},0.18)`,
                color: added ? "#0a0818" : isOut ? "rgba(180,170,200,0.3)" : flavour.color,
                fontFamily: "var(--font-bebas)", fontSize: 18,
                letterSpacing: "0.12em", cursor: isOut ? "not-allowed" : "pointer",
                transition: "all 0.22s ease",
                boxShadow: added ? `0 0 28px rgba(${rgb},0.6)` : `0 0 0px rgba(${rgb},0)`,
              }}
            >
              {isOut ? "OUT OF STOCK" : added ? `✓ ADDED — ${kes(price)}` : `ADD TO BAG — ${kes(price)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Jar card on shelf ────────────────────────────────────────────────────────
function JarCard({ flavour, onOpen, isMobile }: {
  flavour: (typeof FLAVOURS)[0];
  onOpen: () => void;
  isMobile: boolean;
}) {
  const jarRef = useRef<HTMLDivElement>(null);
  const status = getStockStatus(flavour.stock);
  const isOut  = status === "out";
  const rgb    = hexRgb(flavour.color);

  const onEnter = useCallback(() => {
    if (isOut || !jarRef.current) return;
    gsap.to(jarRef.current, { y: -14, duration: 0.3, ease: "power2.out" });
  }, [isOut]);
  const onLeave = useCallback(() => {
    if (!jarRef.current) return;
    gsap.to(jarRef.current, { y: 0, duration: 0.4, ease: "power2.inOut" });
  }, []);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: isOut ? 0.42 : 1, transition: "opacity 0.3s ease",
        cursor: isOut ? "not-allowed" : "pointer",
      }}
    >
      <div
        style={{ position: "relative" }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={() => !isOut && onOpen()}
      >
        <div ref={jarRef} className="jar-breathe" style={{ willChange: "transform" }}>
          <JarSVG color={flavour.color} stock={flavour.stock} isSelected={false} isOut={isOut} />
        </div>

        {/* Desktop tooltip */}
        {!isMobile && !isOut && (
          <div className="jar-tooltip">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: flavour.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{flavour.category}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.55)" }}>{flavour.intensity} intensity</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)", fontWeight: 700 }}>{kes(flavour.price)} / 50g</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>click to select →</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: "var(--font-bebas)", fontSize: isMobile ? 12 : 14,
        letterSpacing: "0.04em", textAlign: "center",
        color: isOut ? "rgba(140,130,160,0.4)" : "#f0f2fa",
        lineHeight: 1.1, maxWidth: isMobile ? 72 : 90,
        marginTop: 4,
        textShadow: isOut ? "none" : `0 0 10px rgba(${rgb},0.5)`,
      }}>{flavour.name}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: isOut ? "rgba(120,110,140,0.35)" : "rgba(200,150,70,0.8)",
        letterSpacing: "0.06em", marginTop: 3,
      }}>{kes(flavour.price)}</div>
    </div>
  );
}

// ─── Shelf row ────────────────────────────────────────────────────────────────
function ShelfRow({ jars, rowIndex, onOpen, isMobile }: {
  jars: (typeof FLAVOURS)[0][];
  rowIndex: number;
  onOpen: (f: (typeof FLAVOURS)[0]) => void;
  isMobile: boolean;
}) {
  const scale   = 1 - rowIndex * 0.025;
  const opacity = 1 - rowIndex * 0.04;

  return (
    <div className="shelf-row" data-row={rowIndex} style={{
      position: "relative",
      marginBottom: isMobile ? 52 : 64,
      transform: `scale(${scale})`,
      transformOrigin: "center bottom",
      opacity,
    }}>
      {/* Amber under-shelf glow */}
      <div style={{
        position: "absolute", bottom: 18, left: "8%", right: "8%", height: 50,
        background: "radial-gradient(ellipse 90% 100% at 50% 100%, rgba(245,158,11,0.16) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 0, filter: "blur(6px)",
      }} />

      {/* Jar row */}
      <div style={{
        display: "flex", justifyContent: "center",
        gap: isMobile ? 10 : 22,
        paddingBottom: isMobile ? 20 : 26, paddingTop: isMobile ? 10 : 16,
        position: "relative", zIndex: 1,
        flexWrap: isMobile ? "wrap" : "nowrap",
        minHeight: isMobile ? undefined : 150,
      }}>
        {jars.map(f => (
          <div
            key={f.id}
            className="jar-cell"
            data-flavour={f.id}
            style={{
              flex: isMobile ? "0 0 calc(33% - 8px)" : "1 1 0",
              maxWidth: isMobile ? "calc(33% - 8px)" : 120,
              minWidth: isMobile ? 80 : 84,
            }}
          >
            <JarCard flavour={f} onOpen={() => onOpen(f)} isMobile={isMobile} />
          </div>
        ))}
      </div>

      {/* Wooden shelf */}
      <div style={{
        height: isMobile ? 14 : 20,
        borderRadius: "0 0 4px 4px",
        background: "repeating-linear-gradient(90deg, rgba(101,67,33,0.9) 0px, rgba(128,85,42,0.95) 40px, rgba(90,58,26,0.88) 80px, rgba(115,76,36,0.92) 120px)",
        borderTop: "2px solid rgba(180,130,60,0.6)",
        borderBottom: "1px solid rgba(40,22,6,0.9)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.65), inset 0 1px 0 rgba(220,170,80,0.25)",
        position: "relative", zIndex: 2,
      }} />
    </div>
  );
}

// ─── Counter bar ──────────────────────────────────────────────────────────────
function CounterBar({ count, total, onView }: { count: number; total: number; onView: () => void }) {
  return (
    <div style={{
      position: "sticky", bottom: 0, zIndex: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: "14px 28px",
      background: "linear-gradient(to right, rgba(18,10,5,0.98), rgba(32,20,8,0.98), rgba(18,10,5,0.98))",
      borderTop: "1px solid rgba(180,130,60,0.4)",
      boxShadow: "0 -6px 32px rgba(0,0,0,0.8)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="counter-beaker" />
        <div>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: 10, letterSpacing: "0.25em", color: "rgba(200,150,70,0.5)", textTransform: "uppercase" }}>
            The Lab Counter · Sourced Globally
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#f0f2fa", letterSpacing: "0.04em" }}>
            {count === 0 ? "No compounds selected yet" : `${count} compound${count !== 1 ? "s" : ""} in your bag · `}
            {count > 0 && <span style={{ color: "var(--gold)", fontWeight: 700 }}>{kes(total)}</span>}
          </div>
        </div>
      </div>
      <button
        onClick={onView}
        disabled={count === 0}
        style={{
          padding: "9px 22px", borderRadius: 8,
          border: "1px solid rgba(200,150,70,0.5)",
          background: count > 0 ? "rgba(180,120,40,0.22)" : "rgba(255,255,255,0.03)",
          color: count > 0 ? "var(--gold)" : "rgba(140,130,150,0.4)",
          fontFamily: "var(--font-bebas)", fontSize: 14, letterSpacing: "0.14em",
          cursor: count > 0 ? "pointer" : "not-allowed",
          opacity: count > 0 ? 1 : 0.4, transition: "all 0.2s ease", whiteSpace: "nowrap",
        }}
      >
        View Bag →
      </button>
    </div>
  );
}

// ─── Cycling taglines ─────────────────────────────────────────────────────────
const TAGLINES = [
  "Every session deserves the right compound.",
  "36 rare blends. Zero compromises.",
  "Sourced globally. Stocked for you.",
  "The perfect blend doesn't find itself.",
];

// ─── Main section ─────────────────────────────────────────────────────────────
export default function FlavourShop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalFlavour, setModalFlavour]     = useState<(typeof FLAVOURS)[0] | null>(null);
  const [taglineIdx, setTaglineIdx]         = useState(0);
  const sectionRef    = useRef<HTMLDivElement>(null);
  const shelvesRef    = useRef<HTMLDivElement>(null);
  const isMobile      = useIsMobile();
  const addToCart     = useStore(s => s.addToCart);
  const setCartOpen   = useStore(s => s.setCartOpen);
  const cartTotal     = useStore(s => s.cartTotal);
  const cartCount     = useStore(s => s.cartCount);

  const totalVal   = cartTotal();
  const totalCount = cartCount();

  const filtered = activeCategory === "All" ? FLAVOURS : FLAVOURS.filter(f => f.category === activeCategory);
  const shelves: (typeof FLAVOURS)[] = [];
  for (let i = 0; i < filtered.length; i += 6) shelves.push(filtered.slice(i, i + 6));

  // Tagline cycle
  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3800);
    return () => clearInterval(t);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const rows = sectionRef.current!.querySelectorAll(".shelf-row");
        gsap.fromTo(rows, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.13, ease: "power3.out", delay: 0.1 });
        const cells = sectionRef.current!.querySelectorAll(".jar-cell");
        gsap.fromTo(cells, { y: -50, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.04, ease: "bounce.out", delay: 0.28 });
        setTimeout(() => {
          sectionRef.current!.querySelectorAll(".jar-breathe").forEach(el => {
            gsap.to(el, { scale: 1.022, duration: 2.5 + Math.random() * 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: Math.random() * 3 });
          });
        }, 900);
      });
    }, { threshold: 0.1 });
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Re-animate on category change
  useEffect(() => {
    if (!shelvesRef.current) return;
    const cells = shelvesRef.current.querySelectorAll(".jar-cell");
    gsap.fromTo(cells, { opacity: 0, scale: 0.8, y: -22 }, { opacity: 1, scale: 1, y: 0, duration: 0.38, stagger: 0.035, ease: "power2.out" });
  }, [activeCategory]);

  const handleAdd = useCallback((id: number, sz: Size, price: number) => {
    const f = FLAVOURS.find(x => x.id === id);
    if (!f) return;
    addToCart({ id: `shop-${id}-${sz}`, type: "flavour", name: `${f.name} (${sz})`, price, quantity: 1 });
    // Fly animation
    const jarEl = sectionRef.current?.querySelector(`.jar-cell[data-flavour="${id}"] .jar-breathe`);
    if (jarEl) {
      const rect  = jarEl.getBoundingClientRect();
      const clone = jarEl.cloneNode(true) as HTMLElement;
      clone.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:9999;pointer-events:none;`;
      document.body.appendChild(clone);
      gsap.to(clone, { x: window.innerWidth - rect.left - rect.width - 20, y: -(rect.top - 20), scale: 0.2, opacity: 0, duration: 0.75, ease: "power3.in", onComplete: () => clone.remove() });
    }
  }, [addToCart]);

  return (
    <section id="shop" ref={sectionRef} style={{
      background: "var(--void)", minHeight: "100vh",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        /* Jar tooltip */
        .jar-tooltip {
          display:none; flex-direction:column; gap:3px;
          position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%);
          background:rgba(6,3,18,0.97); border:1px solid rgba(255,255,255,0.14);
          border-radius:10px; padding:10px 14px; white-space:nowrap;
          pointer-events:none; z-index:50;
          box-shadow:0 8px 28px rgba(0,0,0,0.7);
        }
        .jar-cell > div:hover .jar-tooltip { display:flex; }

        /* Breathing */
        .jar-breathe { display:block; }

        /* Counter beaker */
        .counter-beaker { width:18px; height:24px; position:relative; border:2px solid rgba(200,150,70,0.55); border-top:none; border-radius:0 0 6px 6px; background:rgba(200,150,50,0.1); flex-shrink:0; animation:beaker-glow 2.4s ease-in-out infinite; }
        .counter-beaker::before { content:''; position:absolute; top:-7px; left:-4px; right:-4px; height:7px; border:2px solid rgba(200,150,70,0.55); border-bottom:none; border-radius:3px 3px 0 0; }
        .counter-beaker::after  { content:''; position:absolute; bottom:3px; left:2px; right:2px; height:8px; background:rgba(200,150,50,0.35); border-radius:3px; animation:beaker-fill 2.4s ease-in-out infinite; }
        @keyframes beaker-glow { 0%,100%{box-shadow:inset 0 0 6px rgba(200,150,50,0.15)} 50%{box-shadow:inset 0 0 16px rgba(200,150,50,0.4)} }
        @keyframes beaker-fill { 0%,100%{opacity:.5;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.18)} }

        /* Wall tile texture */
        .dispensary-wall { background: repeating-linear-gradient(0deg,rgba(255,255,255,0.013) 0px,rgba(255,255,255,0.013) 1px,transparent 1px,transparent 32px), repeating-linear-gradient(90deg,rgba(255,255,255,0.008) 0px,rgba(255,255,255,0.008) 1px,transparent 1px,transparent 32px); }

        /* Filter scrollbar hide */
        .shop-filter-bar::-webkit-scrollbar { display:none; }

        /* Shelf entrance */
        .shelf-row { opacity:0; }
      `}</style>

      <div className="dispensary-wall" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: 400, background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(140,80,10,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{
        maxWidth: 1220, width: "100%", margin: "0 auto",
        padding: isMobile ? "clamp(40px,6vw,80px) 16px 0" : "clamp(60px,8vw,120px) 40px 0",
        position: "relative", zIndex: 1, flex: 1,
      }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? 28 : 40 }}>
          <span className="section-label" style={{ color: "rgba(200,150,70,0.85)" }}>
            <span style={{ width: 24, height: 1, background: "rgba(200,150,70,0.65)", display: "inline-block", marginRight: 8 }} />
            The Lab · {FLAVOURS.length} Active Compounds
          </span>
          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: isMobile ? "clamp(52px,12vw,80px)" : "clamp(68px,7.5vw,110px)",
            lineHeight: 0.88, letterSpacing: "0.04em", color: "#f0f2fa", marginBottom: 10,
          }}>
            FLAVOUR<br />
            <span style={{ color: "rgba(200,150,70,0.95)", textShadow: "0 0 60px rgba(200,150,50,0.35)" }}>
              SHOP
            </span>
          </h2>
          <p style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: isMobile ? 14 : 18, color: "rgba(220,190,120,0.65)",
            marginTop: 8, letterSpacing: "0.02em",
            transition: "opacity 0.5s ease",
          }}>{TAGLINES[taglineIdx]}</p>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(200,150,70,0.4)", marginTop: 10,
          }}>Click any jar to open it · choose your size · add to bag</p>
        </div>

        {/* Category filter */}
        <div
          className="shop-filter-bar"
          style={{ display: "flex", gap: 6, flexWrap: isMobile ? "nowrap" : "wrap", overflowX: isMobile ? "auto" : "visible", scrollbarWidth: "none", paddingBottom: isMobile ? 8 : 0, marginBottom: isMobile ? 28 : 40 } as React.CSSProperties}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flex: "0 0 auto", fontFamily: "var(--font-mono)", fontSize: 9,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  padding: isMobile ? "6px 12px" : "7px 16px",
                  minHeight: 34, whiteSpace: "nowrap", borderRadius: 20,
                  border: isActive ? "1px solid rgba(200,150,70,0.75)" : "1px solid rgba(180,140,80,0.15)",
                  background: isActive ? "rgba(180,120,40,0.2)" : "rgba(140,90,20,0.05)",
                  color: isActive ? "rgba(230,180,90,0.95)" : "rgba(160,120,60,0.5)",
                  cursor: "pointer", transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 0 14px rgba(200,150,50,0.2)" : "none",
                }}
              >
                {cat === "All" ? "ALL" : cat.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Shelves */}
        <div ref={shelvesRef}>
          {shelves.map((shelfJars, rowIdx) => (
            <ShelfRow
              key={rowIdx}
              jars={shelfJars}
              rowIndex={rowIdx}
              onOpen={setModalFlavour}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      <CounterBar count={totalCount} total={totalVal} onView={() => setCartOpen(true)} />

      {/* Jar detail modal */}
      {modalFlavour && (
        <JarModal
          flavour={modalFlavour}
          onClose={() => setModalFlavour(null)}
          onAdd={handleAdd}
        />
      )}
    </section>
  );
}
