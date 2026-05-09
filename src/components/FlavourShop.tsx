"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FLAVOURS, CATEGORIES, getStockStatus } from "@/data/flavours";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";
import gsap from "gsap";

type Size = "50g" | "100g" | "250g";

const SIZE_OPTIONS: { label: Size; mult: number }[] = [
  { label: "50g", mult: 1 },
  { label: "100g", mult: 1.7 },
  { label: "250g", mult: 3.8 },
];

function calcPrice(base: number, size: Size): number {
  const opt = SIZE_OPTIONS.find((s) => s.label === size)!;
  return Math.round(base * opt.mult);
}

function kes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

// ── Animated glass jar ──────────────────────────────────────────────────────
interface JarProps {
  color: string;
  stock: number;
  isSelected: boolean;
  isOut: boolean;
  flavourName: string;
}

function GlassJar({ color, stock, isSelected, isOut, flavourName }: JarProps) {
  const status = getStockStatus(stock);
  // Parse hex color to RGB for rgba usage
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  // Bubble positions — seeded by name to be consistent per flavour
  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + (i * 37) % 74, // spread across jar width
    size: 3 + (i * 13) % 6,
    delay: (i * 0.38) % 2.4,
    dur: 1.4 + (i * 0.23) % 1.2,
  }));

  return (
    <div style={{ position: "relative", width: 80, height: 104, margin: "0 auto 10px", flexShrink: 0 }}>

      {/* Glow halo behind jar */}
      <div style={{
        position: "absolute",
        inset: -10,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(${rgb},${isSelected ? 0.45 : 0.18}) 0%, transparent 70%)`,
        transition: "background 0.4s ease",
        pointerEvents: "none",
        filter: "blur(6px)",
      }} />

      {/* Lid */}
      <div style={{
        position: "absolute",
        top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: 42, height: 16,
        borderRadius: "6px 6px 3px 3px",
        background: isOut
          ? "rgba(50,50,60,0.7)"
          : `linear-gradient(to bottom, rgba(${rgb},0.9), rgba(${rgb},0.55))`,
        border: `1px solid rgba(${rgb},${isOut ? 0.2 : 0.8})`,
        boxShadow: isOut ? "none" : `0 0 12px rgba(${rgb},0.5), inset 0 1px 0 rgba(255,255,255,0.25)`,
        zIndex: 3,
        transition: "all 0.3s ease",
      }}>
        {/* Lid grip lines */}
        {!isOut && [0,1,2].map(i => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", transform: "translateY(-50%)",
            left: 8 + i * 9, width: 3, height: 8,
            borderRadius: 2,
            background: `rgba(255,255,255,0.3)`,
          }} />
        ))}
      </div>

      {/* Jar neck */}
      <div style={{
        position: "absolute",
        top: 13, left: "50%",
        transform: "translateX(-50%)",
        width: 34, height: 8,
        background: isOut ? "rgba(20,20,30,0.4)" : `rgba(${rgb},0.2)`,
        border: `1px solid rgba(${rgb},${isOut ? 0.1 : 0.6})`,
        borderBottom: "none",
        zIndex: 2,
      }} />

      {/* Jar body */}
      <div style={{
        position: "absolute",
        top: 18, left: "50%",
        transform: "translateX(-50%)",
        width: 66, height: 82,
        borderRadius: "6px 6px 16px 16px",
        background: isOut
          ? "rgba(20,20,30,0.35)"
          : `linear-gradient(165deg, rgba(${rgb},0.22) 0%, rgba(${rgb},0.12) 40%, rgba(${rgb},0.08) 100%)`,
        border: `2px solid rgba(${rgb},${isOut ? 0.12 : isSelected ? 0.9 : 0.65})`,
        boxShadow: isOut ? "none" : isSelected
          ? `0 0 32px rgba(${rgb},0.7), 0 0 60px rgba(${rgb},0.3), inset 0 0 30px rgba(${rgb},0.15)`
          : `0 0 18px rgba(${rgb},0.4), inset 0 0 16px rgba(${rgb},0.08)`,
        overflow: "hidden",
        zIndex: 1,
        transition: "all 0.35s ease",
      }}>

        {/* Liquid fill */}
        {!isOut && (
          <div className="jar-liquid" style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: status === "critical" ? "30%" : status === "low" ? "50%" : "72%",
            background: `linear-gradient(to top, rgba(${rgb},0.75) 0%, rgba(${rgb},0.45) 60%, rgba(${rgb},0.15) 100%)`,
            borderRadius: "0 0 14px 14px",
            transition: "height 0.6s ease",
          }}>

            {/* Surface shimmer */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: 4,
              background: `rgba(255,255,255,0.35)`,
              borderRadius: 2,
            }} />

            {/* Bubbles */}
            {bubbles.map(b => (
              <div
                key={b.id}
                className="jar-bubble"
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: b.x,
                  width: b.size,
                  height: b.size,
                  borderRadius: "50%",
                  background: `rgba(255,255,255,0.7)`,
                  border: `1px solid rgba(255,255,255,0.4)`,
                  animationDelay: `${b.delay}s`,
                  animationDuration: `${b.dur}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Glass shine — left vertical streak */}
        <div style={{
          position: "absolute",
          top: 8, left: 7,
          width: 5, height: 32,
          borderRadius: 3,
          background: "rgba(255,255,255,0.22)",
          pointerEvents: "none",
        }} />

        {/* Glass shine — small dot */}
        <div style={{
          position: "absolute",
          top: 10, right: 10,
          width: 3, height: 10,
          borderRadius: 2,
          background: "rgba(255,255,255,0.12)",
          pointerEvents: "none",
        }} />

        {/* Out of stock overlay */}
        {isOut && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-bebas)",
              fontSize: 13, letterSpacing: "0.12em",
              color: "rgba(120,110,140,0.55)",
              transform: "rotate(-25deg)",
              border: "2px solid rgba(120,110,140,0.2)",
              padding: "2px 6px", borderRadius: 2,
            }}>EMPTY</span>
          </div>
        )}

        {/* Low stock warning strip */}
        {(status === "critical") && !isOut && (
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,107,53,0.25)",
            borderTop: "1px solid rgba(255,107,53,0.5)",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 6,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#ff6b35",
            }}>ALMOST GONE</span>
          </div>
        )}
      </div>

      {/* Selection ring pulse */}
      {isSelected && !isOut && (
        <div style={{
          position: "absolute",
          inset: -4, borderRadius: 20,
          border: `2px solid rgba(${rgb},0.6)`,
          animation: "ring-pulse 1.4s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

// ── Individual shelf jar card ──────────────────────────────────────────────
interface JarCardProps {
  flavour: (typeof FLAVOURS)[0];
  isSelected: boolean;
  selectedSize: Size | null;
  onJarClick: (id: number) => void;
  onSizeSelect: (id: number, size: Size) => void;
  onAddToBag: (id: number) => void;
  isMobile: boolean;
}

function JarCard({
  flavour,
  isSelected,
  selectedSize,
  onJarClick,
  onSizeSelect,
  onAddToBag,
  isMobile,
}: JarCardProps) {
  const jarRef = useRef<HTMLDivElement>(null);
  const status = getStockStatus(flavour.stock);
  const isOut = status === "out";
  const price = selectedSize ? calcPrice(flavour.price, selectedSize) : flavour.price;

  const hex = flavour.color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  const handleMouseEnter = useCallback(() => {
    if (isOut || !jarRef.current) return;
    gsap.to(jarRef.current, { y: -14, duration: 0.3, ease: "power2.out" });
  }, [isOut]);

  const handleMouseLeave = useCallback(() => {
    if (!jarRef.current) return;
    gsap.to(jarRef.current, { y: 0, duration: 0.45, ease: "power2.inOut" });
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative",
      opacity: isOut ? 0.45 : 1,
      transition: "opacity 0.3s ease",
    }}>

      {/* Jar + hover tooltip */}
      <div
        style={{ position: "relative", width: "100%" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => !isOut && onJarClick(flavour.id)}
      >
        <div ref={jarRef} className="jar-breathe" style={{ willChange: "transform" }}>
          <GlassJar
            color={flavour.color}
            stock={flavour.stock}
            isSelected={isSelected}
            isOut={isOut}
            flavourName={flavour.name}
          />
        </div>

        {/* Desktop tooltip */}
        {!isMobile && !isOut && (
          <div className="jar-tooltip">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", color: flavour.color, textTransform: "uppercase" }}>
              {flavour.category}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>
              {flavour.intensity} intensity
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)", fontWeight: 700 }}>
              {kes(flavour.price)} / 50g
            </span>
          </div>
        )}
      </div>

      {/* Name + price */}
      <div style={{ textAlign: "center", marginBottom: 6, padding: "0 2px" }}>
        <div style={{
          fontFamily: "var(--font-bebas)",
          fontSize: isMobile ? 13 : 15,
          letterSpacing: "0.04em",
          color: isOut ? "rgba(140,130,160,0.5)" : "#f0f2fa",
          lineHeight: 1.1,
          maxWidth: isMobile ? 74 : 92,
          textShadow: isOut ? "none" : `0 0 12px rgba(${rgb},0.6)`,
        }}>
          {flavour.name}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: isOut ? "rgba(120,110,140,0.4)" : "var(--gold)",
          letterSpacing: "0.06em", marginTop: 2,
        }}>
          {kes(flavour.price)}
        </div>
      </div>

      {/* Expanded size selector — appears on click */}
      {isSelected && !isOut && (
        <div
          className="jar-size-panel"
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            background: `linear-gradient(145deg, rgba(8,5,22,0.98), rgba(16,10,36,0.98))`,
            border: `1px solid rgba(${rgb},0.6)`,
            borderTop: `2px solid rgba(${rgb},0.9)`,
            borderRadius: 12,
            padding: "12px 14px",
            width: isMobile ? 168 : 190,
            boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 30px rgba(${rgb},0.25)`,
            marginTop: 6,
          }}
        >
          {/* Flavour notes */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10 }}>
            {flavour.notes.slice(0, 3).map((note) => (
              <span key={note} style={{
                fontFamily: "var(--font-mono)", fontSize: 8,
                letterSpacing: "0.08em",
                padding: "2px 6px", borderRadius: 20,
                background: `rgba(${rgb},0.12)`,
                border: `1px solid rgba(${rgb},0.3)`,
                color: flavour.color,
                textTransform: "uppercase",
              }}>
                {note}
              </span>
            ))}
          </div>

          {/* Size pills */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {SIZE_OPTIONS.map(({ label }) => {
              const szPrice = calcPrice(flavour.price, label);
              const isActive = selectedSize === label;
              return (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); onSizeSelect(flavour.id, label); }}
                  style={{
                    flex: 1, padding: "5px 0", borderRadius: 20,
                    border: isActive ? `1px solid rgba(${rgb},0.9)` : "1px solid rgba(255,255,255,0.12)",
                    background: isActive ? `rgba(${rgb},0.22)` : "rgba(255,255,255,0.03)",
                    color: isActive ? flavour.color : "rgba(255,255,255,0.45)",
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    letterSpacing: "0.05em", cursor: "pointer",
                    transition: "all 0.15s ease", textAlign: "center",
                    boxShadow: isActive ? `0 0 10px rgba(${rgb},0.3)` : "none",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{label}</div>
                  <div style={{ opacity: 0.7, fontSize: 8 }}>{kes(szPrice)}</div>
                </button>
              );
            })}
          </div>

          {/* Add to bag CTA */}
          {selectedSize && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToBag(flavour.id); }}
              style={{
                width: "100%", padding: "9px 0", borderRadius: 8,
                border: `1px solid rgba(${rgb},0.7)`,
                background: `linear-gradient(135deg, rgba(${rgb},0.28), rgba(${rgb},0.14))`,
                color: flavour.color,
                fontFamily: "var(--font-bebas)", fontSize: 15,
                letterSpacing: "0.14em", cursor: "pointer",
                transition: "all 0.2s ease", textAlign: "center",
                boxShadow: `0 4px 20px rgba(${rgb},0.2)`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `rgba(${rgb},0.38)`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 24px rgba(${rgb},0.45)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, rgba(${rgb},0.28), rgba(${rgb},0.14))`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px rgba(${rgb},0.2)`;
              }}
            >
              DISPENSE {kes(price)} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shelf row ──────────────────────────────────────────────────────────────
interface ShelfRowProps {
  jars: (typeof FLAVOURS)[0][];
  rowIndex: number;
  selectedJar: number | null;
  selectedSizes: Record<number, Size>;
  onJarClick: (id: number) => void;
  onSizeSelect: (id: number, size: Size) => void;
  onAddToBag: (id: number) => void;
  isMobile: boolean;
}

function ShelfRow({ jars, rowIndex, selectedJar, selectedSizes, onJarClick, onSizeSelect, onAddToBag, isMobile }: ShelfRowProps) {
  const depthScale = 1 - rowIndex * 0.025;
  const depthOpacity = 1 - rowIndex * 0.04;

  return (
    <div
      className="shelf-row"
      data-row={rowIndex}
      style={{
        position: "relative",
        marginBottom: isMobile ? 52 : 68,
        transform: `scale(${depthScale})`,
        transformOrigin: "center bottom",
        opacity: depthOpacity,
      }}
    >
      {/* Under-shelf amber glow — simulates warm display lighting */}
      <div style={{
        position: "absolute",
        bottom: 18, left: "5%", right: "5%",
        height: 60,
        background: "radial-gradient(ellipse 90% 100% at 50% 100%, rgba(245,158,11,0.18) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 0,
        filter: "blur(8px)",
      }} />

      {/* Jars row */}
      <div style={{
        display: "flex", justifyContent: "center",
        gap: isMobile ? 10 : 20,
        paddingBottom: isMobile ? 20 : 28,
        paddingTop: isMobile ? 10 : 16,
        position: "relative", zIndex: 1,
        flexWrap: isMobile ? "wrap" : "nowrap",
        minHeight: isMobile ? undefined : 150,
      }}>
        {jars.map((f) => (
          <div
            key={f.id}
            className="jar-cell"
            data-flavour={f.id}
            style={{
              flex: isMobile ? "0 0 calc(33% - 8px)" : "1 1 0",
              maxWidth: isMobile ? "calc(33% - 8px)" : 116,
              minWidth: isMobile ? 80 : 84,
            }}
          >
            <JarCard
              flavour={f}
              isSelected={selectedJar === f.id}
              selectedSize={selectedJar === f.id ? (selectedSizes[f.id] ?? null) : null}
              onJarClick={onJarClick}
              onSizeSelect={onSizeSelect}
              onAddToBag={onAddToBag}
              isMobile={isMobile}
            />
          </div>
        ))}
      </div>

      {/* Wooden shelf plank */}
      <div style={{
        position: "relative",
        height: isMobile ? 14 : 20,
        borderRadius: "0 0 4px 4px",
        background: "repeating-linear-gradient(90deg, rgba(101,67,33,0.9) 0px, rgba(128,85,42,0.95) 40px, rgba(90,58,26,0.88) 80px, rgba(115,76,36,0.92) 120px)",
        borderTop: "2px solid rgba(180,130,60,0.6)",
        borderBottom: "1px solid rgba(40,22,6,0.9)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220,170,80,0.25)",
        zIndex: 2,
      }} />
    </div>
  );
}

// ── Dispensary counter bar ─────────────────────────────────────────────────
function CounterBar({ cartCount, cartTotal, onViewBag }: { cartCount: number; cartTotal: number; onViewBag: () => void }) {
  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: "14px 28px",
      background: "linear-gradient(to right, rgba(24,14,6,0.98), rgba(38,22,8,0.98), rgba(24,14,6,0.98))",
      borderTop: "1px solid rgba(180,130,60,0.45)",
      boxShadow: "0 -6px 32px rgba(0,0,0,0.75), inset 0 1px 0 rgba(220,170,80,0.15)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {/* Beaker */}
        <div className="counter-beaker" aria-hidden="true" />
        <div>
          <div style={{
            fontFamily: "var(--font-bebas)", fontSize: 10,
            letterSpacing: "0.25em", color: "rgba(200,150,70,0.55)",
            textTransform: "uppercase",
          }}>
            Formulary Counter · Premium Compounds
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 13,
            color: "#f0f2fa", letterSpacing: "0.04em",
          }}>
            {cartCount === 0
              ? "No compounds prescribed yet"
              : `${cartCount} compound${cartCount !== 1 ? "s" : ""} in your formula · `}
            {cartCount > 0 && (
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                {kes(cartTotal)}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={onViewBag}
        disabled={cartCount === 0}
        style={{
          padding: "9px 22px", borderRadius: 8,
          border: "1px solid rgba(200,150,70,0.55)",
          background: cartCount > 0
            ? "linear-gradient(135deg, rgba(200,150,50,0.22), rgba(160,110,30,0.16))"
            : "rgba(255,255,255,0.04)",
          color: cartCount > 0 ? "var(--gold)" : "rgba(140,130,150,0.5)",
          fontFamily: "var(--font-bebas)", fontSize: 14,
          letterSpacing: "0.14em", cursor: cartCount > 0 ? "pointer" : "not-allowed",
          opacity: cartCount > 0 ? 1 : 0.4,
          transition: "all 0.2s ease", flexShrink: 0, whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (cartCount > 0) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(200,150,50,0.35)";
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(200,150,50,0.32), rgba(160,110,30,0.24))";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          if (cartCount > 0) {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(200,150,50,0.22), rgba(160,110,30,0.16))";
          }
        }}
      >
        Review Formula →
      </button>
    </div>
  );
}

// ── Marketing header copy ──────────────────────────────────────────────────
const MARKETING_LINES = [
  "Every cloud starts with the right compound.",
  "Sourced globally. Dispensed precisely.",
  "36 rare blends. Zero compromises.",
  "The pharmacist never misses.",
];

// ── Main dispensary section ────────────────────────────────────────────────
export default function FlavourShop() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedJar, setSelectedJar] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, Size>>({});
  const [marketingIdx, setMarketingIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const shelvesAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const cartTotal = useStore((s) => s.cartTotal);
  const cartCount = useStore((s) => s.cartCount);

  const totalVal = cartTotal();
  const totalCount = cartCount();

  const filtered = activeCategory === "All" ? FLAVOURS : FLAVOURS.filter((f) => f.category === activeCategory);
  const shelves: (typeof FLAVOURS)[] = [];
  for (let i = 0; i < filtered.length; i += 6) shelves.push(filtered.slice(i, i + 6));

  // Cycle marketing taglines
  useEffect(() => {
    const t = setInterval(() => setMarketingIdx(i => (i + 1) % MARKETING_LINES.length), 3800);
    return () => clearInterval(t);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const shelfRows = sectionRef.current!.querySelectorAll(".shelf-row");
        gsap.fromTo(shelfRows, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.14, ease: "power3.out", delay: 0.1 });
        const jarCells = sectionRef.current!.querySelectorAll(".jar-cell");
        gsap.fromTo(jarCells, { y: -50, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.04, ease: "bounce.out", delay: 0.3 });
        setTimeout(() => {
          const jarWrappers = sectionRef.current!.querySelectorAll(".jar-breathe");
          jarWrappers.forEach((el) => {
            gsap.to(el, { scale: 1.025, duration: 2.5 + Math.random() * 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: Math.random() * 3 });
          });
        }, 900);
      });
    }, { threshold: 0.12 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Re-animate on category change
  useEffect(() => {
    if (!shelvesAreaRef.current) return;
    const jarCells = shelvesAreaRef.current.querySelectorAll(".jar-cell");
    gsap.fromTo(jarCells, { opacity: 0, scale: 0.8, y: -24 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" });
  }, [activeCategory]);

  const handleJarClick = useCallback((id: number) => {
    setSelectedJar((prev) => (prev === id ? null : id));
    setSelectedSizes((prev) => ({ ...prev, [id]: prev[id] ?? "50g" }));
  }, []);

  const handleSizeSelect = useCallback((id: number, size: Size) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  }, []);

  const handleAddToBag = useCallback((flavourId: number) => {
    const size = selectedSizes[flavourId] ?? "50g";
    const flavour = FLAVOURS.find((f) => f.id === flavourId);
    if (!flavour) return;
    const price = calcPrice(flavour.price, size);

    addToCart({
      id: `shop-${flavourId}-${size}`,
      type: "flavour",
      name: `${flavour.name} (${size})`,
      price,
      quantity: 1,
    });

    // Fly animation
    const jarEl = sectionRef.current?.querySelector(`.jar-cell[data-flavour="${flavourId}"] .jar-breathe`) ?? null;
    if (jarEl) {
      const rect = jarEl.getBoundingClientRect();
      const clone = jarEl.cloneNode(true) as HTMLElement;
      clone.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:9999;pointer-events:none;`;
      document.body.appendChild(clone);
      gsap.to(clone, { x: window.innerWidth - rect.left - rect.width - 20, y: -(rect.top - 20), scale: 0.18, opacity: 0, duration: 0.75, ease: "power3.in", onComplete: () => clone.remove() });
    }

    // Elastic bounce on jar
    const jarContainer = sectionRef.current?.querySelector(`.jar-cell[data-flavour="${flavourId}"] .jar-breathe`);
    if (jarContainer) {
      gsap.fromTo(jarContainer, { scale: 1.15 }, { scale: 1, duration: 0.55, ease: "elastic.out(1,0.45)" });
    }

    setSelectedJar(null);
  }, [selectedSizes, addToCart]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".jar-cell")) setSelectedJar(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <section id="shop" ref={sectionRef} style={{
      background: "var(--void)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* ── Injected styles ── */}
      <style>{`
        /* Bubble rise animation */
        .jar-bubble {
          animation: bubble-rise linear infinite;
        }
        @keyframes bubble-rise {
          0%   { transform: translateY(0) scale(1); opacity: 0.8; }
          70%  { transform: translateY(-55%) scale(1.15); opacity: 0.5; }
          100% { transform: translateY(-90%) scale(0.5); opacity: 0; }
        }

        /* Liquid sloshing */
        .jar-liquid {
          animation: liquid-slosh 3.8s ease-in-out infinite;
        }
        @keyframes liquid-slosh {
          0%,100% { transform: translateY(0) scaleX(1); }
          30%     { transform: translateY(-2px) scaleX(1.01); }
          60%     { transform: translateY(1px) scaleX(0.99); }
        }

        /* Jar hover tooltip */
        .jar-tooltip {
          display: none;
          flex-direction: column; gap: 3px;
          position: absolute;
          bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%);
          background: rgba(8,5,20,0.97);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          padding: 10px 12px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
          box-shadow: 0 6px 24px rgba(0,0,0,0.65);
        }
        .jar-cell > div:hover .jar-tooltip { display: flex; }

        /* Smoke wisp on hover */
        .jar-cell > div:hover .jar-wisp {
          animation: wisp-rise 1.8s ease-out infinite;
        }
        .jar-wisp {
          position: absolute; top: -16px; left: 50%;
          transform: translateX(-50%);
          width: 6px; height: 20px; border-radius: 50%;
          background: rgba(200,180,255,0);
          pointer-events: none; z-index: 10;
        }
        @keyframes wisp-rise {
          0%   { background: rgba(220,200,255,0.5); transform: translateX(-50%) translateY(0) scale(1); opacity: 0.65; }
          60%  { background: rgba(200,180,255,0.2); transform: translateX(-50%) translateY(-24px) scale(1.8); opacity: 0.3; }
          100% { background: rgba(200,180,255,0);   transform: translateX(-50%) translateY(-40px) scale(2.5); opacity: 0; }
        }

        /* Selection pulse ring */
        @keyframes ring-pulse {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 0.2; transform: scale(1.05); }
        }

        /* Counter beaker */
        .counter-beaker {
          width: 18px; height: 24px; position: relative;
          border: 2px solid rgba(200,150,70,0.55);
          border-top: none;
          border-radius: 0 0 6px 6px;
          background: rgba(200,150,50,0.12);
          animation: beaker-glow 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        .counter-beaker::before {
          content: '';
          position: absolute; top: -7px; left: -4px; right: -4px; height: 7px;
          border: 2px solid rgba(200,150,70,0.55); border-bottom: none; border-radius: 3px 3px 0 0;
        }
        .counter-beaker::after {
          content: '';
          position: absolute; bottom: 3px; left: 2px; right: 2px; height: 8px;
          background: rgba(200,150,50,0.35); border-radius: 3px;
          animation: beaker-fill 2.4s ease-in-out infinite;
        }
        @keyframes beaker-glow {
          0%,100% { box-shadow: inset 0 0 6px rgba(200,150,50,0.15); }
          50%      { box-shadow: inset 0 0 16px rgba(200,150,50,0.4); }
        }
        @keyframes beaker-fill {
          0%,100% { opacity: 0.5; transform: scaleY(1); }
          50%      { opacity: 1; transform: scaleY(1.18); }
        }

        /* Size panel entrance */
        .jar-size-panel {
          animation: panel-pop 0.24s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes panel-pop {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.94); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        /* Wall tile texture */
        .dispensary-wall {
          background:
            repeating-linear-gradient(0deg,   rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 1px, transparent 1px, transparent 32px),
            repeating-linear-gradient(90deg,  rgba(255,255,255,0.009) 0px, rgba(255,255,255,0.009) 1px, transparent 1px, transparent 32px);
        }

        /* Marketing tagline fade */
        .marketing-tag { transition: opacity 0.6s ease; }

        /* Filter scrollbar hide */
        .shop-filter-bar::-webkit-scrollbar { display: none; }

        /* Shelf entrance */
        .shelf-row { opacity: 0; }
      `}</style>

      {/* Wall texture */}
      <div className="dispensary-wall" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Amber warmth from below */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", height: 400,
        background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(160,90,10,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Violet tint top-left */}
      <div style={{
        position: "absolute", top: "-5%", left: "-5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Main content ── */}
      <div style={{
        maxWidth: 1220, width: "100%", margin: "0 auto",
        padding: isMobile ? "clamp(40px,6vw,80px) 16px 0" : "clamp(60px,8vw,120px) 40px 0",
        position: "relative", zIndex: 1, flex: 1,
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: isMobile ? 28 : 40 }}>
          <span className="section-label" style={{ color: "rgba(200,150,70,0.85)" }}>
            <span style={{ width: 24, height: 1, background: "rgba(200,150,70,0.65)", display: "inline-block", marginRight: 8 }} />
            Rare Compounds · Dispensary Est. 2024
          </span>

          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: isMobile ? "clamp(48px,11vw,72px)" : "clamp(64px,7.5vw,108px)",
            lineHeight: 0.88, letterSpacing: "0.04em",
            color: "#f0f2fa", marginBottom: 10,
          }}>
            THE<br />
            <span style={{ color: "rgba(200,150,70,0.95)", textShadow: "0 0 60px rgba(200,150,50,0.4)" }}>
              DISPENSARY
            </span>
          </h2>

          {/* Cycling marketing line */}
          <p style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: isMobile ? 14 : 18,
            color: "rgba(220,190,120,0.7)",
            marginTop: 8, letterSpacing: "0.02em",
          }}>
            {MARKETING_LINES[marketingIdx]}
          </p>

          <p style={{
            fontFamily: "var(--font-mono)", fontSize: isMobile ? 9 : 10,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(200,150,70,0.5)", marginTop: 10,
          }}>
            {FLAVOURS.length} active compounds · Click a jar to open your prescription
          </p>
        </div>

        {/* ── Category filter ── */}
        <div
          className="shop-filter-bar"
          style={{
            display: "flex", gap: 6,
            flexWrap: isMobile ? "nowrap" : "wrap",
            overflowX: isMobile ? "auto" : "visible",
            scrollbarWidth: "none",
            paddingBottom: isMobile ? 8 : 0,
            marginBottom: isMobile ? 28 : 40,
          } as React.CSSProperties}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSelectedJar(null); }}
                style={{
                  flex: "0 0 auto",
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  padding: isMobile ? "6px 12px" : "7px 16px",
                  minHeight: 34, whiteSpace: "nowrap", borderRadius: 20,
                  border: isActive ? "1px solid rgba(200,150,70,0.75)" : "1px solid rgba(180,140,80,0.18)",
                  background: isActive ? "rgba(180,120,40,0.22)" : "rgba(140,90,20,0.06)",
                  color: isActive ? "rgba(230,180,90,0.95)" : "rgba(160,120,60,0.55)",
                  cursor: "pointer", transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 0 14px rgba(200,150,50,0.22), inset 0 1px 0 rgba(220,170,80,0.12)" : "none",
                }}
              >
                {cat === "All" ? "ALL COMPOUNDS" : cat.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* ── Shelves ── */}
        <div ref={shelvesAreaRef}>
          {shelves.map((shelfJars, rowIdx) => (
            <ShelfRow
              key={rowIdx}
              jars={shelfJars}
              rowIndex={rowIdx}
              selectedJar={selectedJar}
              selectedSizes={selectedSizes}
              onJarClick={handleJarClick}
              onSizeSelect={handleSizeSelect}
              onAddToBag={handleAddToBag}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* ── Sticky counter bar ── */}
      <CounterBar
        cartCount={totalCount}
        cartTotal={totalVal}
        onViewBag={() => setCartOpen(true)}
      />
    </section>
  );
}
