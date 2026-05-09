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
  if (opt.mult === 1) return base;
  const raw = base * opt.mult;
  return Math.floor(raw) + 0.99;
}

// ── CSS-only glass jar SVG-free component ──────────────────────────────────
interface JarProps {
  color: string;
  stock: number;
  isSelected: boolean;
  isOut: boolean;
}

function GlassJar({ color, stock, isSelected, isOut }: JarProps) {
  const status = getStockStatus(stock);
  const liquidOpacity = isOut ? 0 : 0.42;
  const lidColor = isOut ? "#2a2a2a" : "#1a1a2e";

  return (
    <div
      style={{
        position: "relative",
        width: 72,
        height: 88,
        margin: "0 auto 8px",
        flexShrink: 0,
      }}
    >
      {/* Smoke wisp — appears on hover via CSS */}
      <div className="jar-wisp" />

      {/* Jar lid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 36,
          height: 14,
          borderRadius: "6px 6px 3px 3px",
          background: isOut
            ? "rgba(60,60,60,0.6)"
            : `linear-gradient(to bottom, ${lidColor}, rgba(20,18,40,0.9))`,
          border: `1px solid ${isOut ? "rgba(100,100,100,0.3)" : `${color}55`}`,
          boxShadow: isSelected
            ? `0 0 12px ${color}88`
            : "none",
          zIndex: 2,
          transition: "box-shadow 0.3s ease",
        }}
      />

      {/* Jar body */}
      <div
        style={{
          position: "absolute",
          top: 11,
          left: "50%",
          transform: "translateX(-50%)",
          width: 60,
          height: 74,
          borderRadius: "8px 8px 14px 14px",
          background: isOut
            ? "rgba(30,30,40,0.4)"
            : "rgba(10,8,28,0.55)",
          border: `1px solid ${isOut ? "rgba(80,80,80,0.25)" : `${color}44`}`,
          boxShadow: isSelected
            ? `0 0 24px ${color}66, inset 0 0 20px ${color}11`
            : `inset 0 0 10px ${color}08`,
          overflow: "hidden",
          backdropFilter: "blur(4px)",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
          zIndex: 1,
        }}
      >
        {/* Liquid fill */}
        {!isOut && (
          <div
            className="jar-liquid"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "70%",
              background: `linear-gradient(to top, ${color}${Math.round(liquidOpacity * 255).toString(16).padStart(2, "0")}, ${color}22 80%, transparent)`,
              borderRadius: "0 0 13px 13px",
            }}
          />
        )}
        {/* Glass shine */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            width: 8,
            height: 26,
            borderRadius: 4,
            background: "rgba(255,255,255,0.12)",
          }}
        />
        {/* Stock label on jar body */}
        {(status === "low" || status === "critical") && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "var(--font-mono)",
              fontSize: 7,
              letterSpacing: "0.08em",
              color: status === "critical" ? "#ff6b35" : "var(--gold)",
              background: "rgba(0,0,0,0.65)",
              padding: "2px 5px",
              borderRadius: 3,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              border: `1px solid ${status === "critical" ? "rgba(255,107,53,0.5)" : "rgba(245,158,11,0.4)"}`,
            }}
          >
            {status === "critical" ? "ALMOST EMPTY" : "LOW STOCK"}
          </div>
        )}
        {status === "out" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: 14,
                letterSpacing: "0.12em",
                color: "rgba(150,140,170,0.5)",
                transform: "rotate(-20deg)",
                border: "2px solid rgba(150,140,170,0.25)",
                padding: "2px 8px",
                borderRadius: 2,
              }}
            >
              EMPTY
            </span>
          </div>
        )}
      </div>
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

  const handleMouseEnter = useCallback(() => {
    if (isOut || !jarRef.current) return;
    gsap.to(jarRef.current, { y: -12, duration: 0.35, ease: "power2.out" });
  }, [isOut]);

  const handleMouseLeave = useCallback(() => {
    if (!jarRef.current) return;
    gsap.to(jarRef.current, { y: 0, duration: 0.4, ease: "power2.inOut" });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        opacity: isOut ? 0.5 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Jar with hover tooltip */}
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
          />
        </div>

        {/* Hover tooltip */}
        {!isMobile && !isOut && (
          <div className="jar-tooltip">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.12em",
                color: flavour.color,
                textTransform: "uppercase",
              }}
            >
              {flavour.category}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.06em",
              }}
            >
              {flavour.intensity} intensity
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--gold)",
                fontWeight: 700,
              }}
            >
              ${flavour.price.toFixed(2)} / 50g
            </span>
          </div>
        )}
      </div>

      {/* Flavour name + price */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: isMobile ? 13 : 15,
            letterSpacing: "0.04em",
            color: isOut ? "var(--text-dim)" : "var(--text-primary)",
            lineHeight: 1.1,
            maxWidth: isMobile ? 70 : 88,
          }}
        >
          {flavour.name}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--gold)",
            letterSpacing: "0.06em",
            marginTop: 2,
          }}
        >
          ${flavour.price.toFixed(2)}
        </div>
      </div>

      {/* Size selector + add button — expands when jar is selected */}
      {isSelected && !isOut && (
        <div
          className="jar-size-panel"
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            background: "linear-gradient(135deg, rgba(18,12,36,0.97), rgba(26,18,48,0.97))",
            border: `1px solid ${flavour.color}55`,
            borderRadius: 10,
            padding: "10px 12px",
            width: isMobile ? 160 : 180,
            boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 20px ${flavour.color}33`,
            marginTop: 4,
          }}
        >
          {/* Note chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
            {flavour.notes.slice(0, 3).map((note) => (
              <span
                key={note}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "0.08em",
                  padding: "2px 5px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                {note}
              </span>
            ))}
          </div>

          {/* Size pills */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {SIZE_OPTIONS.map(({ label }) => {
              const szPrice = calcPrice(flavour.price, label);
              const isActive = selectedSize === label;
              return (
                <button
                  key={label}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSizeSelect(flavour.id, label);
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    borderRadius: 20,
                    border: isActive
                      ? `1px solid ${flavour.color}`
                      : "1px solid rgba(255,255,255,0.15)",
                    background: isActive
                      ? `${flavour.color}22`
                      : "rgba(255,255,255,0.04)",
                    color: isActive ? flavour.color : "rgba(255,255,255,0.45)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{label}</div>
                  <div style={{ opacity: 0.75, fontSize: 8 }}>${szPrice.toFixed(0)}</div>
                </button>
              );
            })}
          </div>

          {/* Add to bag button */}
          {selectedSize && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToBag(flavour.id);
              }}
              style={{
                width: "100%",
                padding: "7px 0",
                borderRadius: 8,
                border: `1px solid ${flavour.color}88`,
                background: `linear-gradient(135deg, ${flavour.color}22, ${flavour.color}11)`,
                color: flavour.color,
                fontFamily: "var(--font-bebas)",
                fontSize: 14,
                letterSpacing: "0.12em",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${flavour.color}33`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${flavour.color}44`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${flavour.color}22, ${flavour.color}11)`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              ADD TO BAG +
            </button>
          )}
          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--gold)",
              marginTop: 6,
              fontWeight: 700,
            }}
          >
            ${price.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── A single shelf row ─────────────────────────────────────────────────────
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

function ShelfRow({
  jars,
  rowIndex,
  selectedJar,
  selectedSizes,
  onJarClick,
  onSizeSelect,
  onAddToBag,
  isMobile,
}: ShelfRowProps) {
  const shelfRef = useRef<HTMLDivElement>(null);
  // Subtle depth perspective: top shelves slightly smaller
  const depthScale = 1 - rowIndex * 0.03;
  const depthOpacity = 1 - rowIndex * 0.06;

  return (
    <div
      ref={shelfRef}
      className="shelf-row"
      data-row={rowIndex}
      style={{
        position: "relative",
        marginBottom: isMobile ? 48 : 64,
        transform: `scale(${depthScale})`,
        transformOrigin: "center bottom",
        opacity: depthOpacity,
      }}
    >
      {/* Warm amber lighting glow behind shelf */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 40,
          background: "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(245,158,11,0.12) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Jar row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: isMobile ? 10 : 18,
          paddingBottom: isMobile ? 18 : 24,
          paddingTop: isMobile ? 10 : 14,
          position: "relative",
          zIndex: 1,
          flexWrap: isMobile ? "wrap" : "nowrap",
          minHeight: isMobile ? undefined : 140,
        }}
      >
        {jars.map((f) => (
          <div
            key={f.id}
            className="jar-cell"
            data-flavour={f.id}
            style={{
              flex: isMobile ? "0 0 calc(33% - 8px)" : "1 1 0",
              maxWidth: isMobile ? "calc(33% - 8px)" : 110,
              minWidth: isMobile ? 80 : 80,
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
      <div
        style={{
          position: "relative",
          height: isMobile ? 14 : 18,
          borderRadius: "0 0 4px 4px",
          background:
            "repeating-linear-gradient(90deg, rgba(101,67,33,0.85) 0px, rgba(120,80,40,0.9) 40px, rgba(90,58,26,0.85) 80px, rgba(110,72,34,0.9) 120px)",
          borderTop: "2px solid rgba(160,110,50,0.5)",
          borderBottom: "1px solid rgba(50,28,8,0.8)",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(200,150,70,0.2)",
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ── Dispensary counter bar ─────────────────────────────────────────────────
interface CounterBarProps {
  cartCount: number;
  cartTotal: number;
  onViewBag: () => void;
}

function CounterBar({ cartCount, cartTotal, onViewBag }: CounterBarProps) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 24px",
        background:
          "linear-gradient(to right, rgba(30,18,8,0.97), rgba(40,24,10,0.97), rgba(30,18,8,0.97))",
        borderTop: "1px solid rgba(160,110,50,0.4)",
        borderBottom: "1px solid rgba(0,0,0,0.6)",
        boxShadow:
          "0 -4px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200,150,70,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Beaker icon (pure CSS) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div className="counter-beaker" aria-hidden="true" />
        <div>
          <div
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "rgba(200,150,70,0.6)",
              textTransform: "uppercase",
            }}
          >
            The Dispensary Counter
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--text-primary)",
              letterSpacing: "0.04em",
            }}
          >
            {cartCount === 0
              ? "No compounds selected"
              : `${cartCount} compound${cartCount !== 1 ? "s" : ""} selected · `}
            {cartCount > 0 && (
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                Total: ${cartTotal.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onViewBag}
        disabled={cartCount === 0}
        style={{
          padding: "8px 20px",
          borderRadius: 8,
          border: "1px solid rgba(200,150,70,0.5)",
          background:
            cartCount > 0
              ? "linear-gradient(135deg, rgba(200,150,50,0.2), rgba(160,110,30,0.15))"
              : "rgba(255,255,255,0.04)",
          color: cartCount > 0 ? "var(--gold)" : "var(--text-dim)",
          fontFamily: "var(--font-bebas)",
          fontSize: 14,
          letterSpacing: "0.14em",
          cursor: cartCount > 0 ? "pointer" : "not-allowed",
          opacity: cartCount > 0 ? 1 : 0.4,
          transition: "all 0.2s ease",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (cartCount > 0) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(200,150,50,0.3)";
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(200,150,50,0.3), rgba(160,110,30,0.25))";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          if (cartCount > 0) {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(200,150,50,0.2), rgba(160,110,30,0.15))";
          }
        }}
      >
        View Bag →
      </button>
    </div>
  );
}

// ── Main dispensary section ────────────────────────────────────────────────
export default function FlavourShop() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedJar, setSelectedJar] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, Size>>({});
  const sectionRef = useRef<HTMLDivElement>(null);
  const shelvesAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const cartTotal = useStore((s) => s.cartTotal);
  const cartCount = useStore((s) => s.cartCount);

  const totalVal = cartTotal();
  const totalCount = cartCount();

  // Filter flavours
  const filtered =
    activeCategory === "All"
      ? FLAVOURS
      : FLAVOURS.filter((f) => f.category === activeCategory);

  // Split into shelf rows of up to 6
  const shelves: (typeof FLAVOURS)[] = [];
  for (let i = 0; i < filtered.length; i += 6) {
    shelves.push(filtered.slice(i, i + 6));
  }

  // ── Section entrance animation ─────────────────────────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();

          // Animate shelves sliding in from left
          const shelfRows = sectionRef.current!.querySelectorAll(".shelf-row");
          gsap.fromTo(
            shelfRows,
            { x: -60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              delay: 0.1,
            }
          );

          // Animate jars dropping onto shelves
          const jarCells = sectionRef.current!.querySelectorAll(".jar-cell");
          gsap.fromTo(
            jarCells,
            { y: -40, opacity: 0, scale: 0.85 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.55,
              stagger: 0.05,
              ease: "bounce.out",
              delay: 0.25,
            }
          );

          // Idle breathing pulse on each jar (subtle scale yoyo)
          setTimeout(() => {
            const jarWrappers = sectionRef.current!.querySelectorAll(".jar-breathe");
            jarWrappers.forEach((el) => {
              gsap.to(el, {
                scale: 1.022,
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 3,
              });
            });
          }, 800);
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Re-animate jars when category changes ─────────────────────────────
  useEffect(() => {
    if (!shelvesAreaRef.current) return;
    const jarCells = shelvesAreaRef.current.querySelectorAll(".jar-cell");
    gsap.fromTo(
      jarCells,
      { opacity: 0, scale: 0.85, y: -20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: "power2.out",
      }
    );
  }, [activeCategory]);

  // ── Jar click handler ──────────────────────────────────────────────────
  const handleJarClick = useCallback(
    (id: number) => {
      setSelectedJar((prev) => (prev === id ? null : id));
      // Auto-select 50g as default
      setSelectedSizes((prev) => ({
        ...prev,
        [id]: prev[id] ?? "50g",
      }));
    },
    []
  );

  const handleSizeSelect = useCallback((id: number, size: Size) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  }, []);

  // ── Add to bag handler (with fly animation) ────────────────────────────
  const handleAddToBag = useCallback(
    (flavourId: number) => {
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

      // Cart fly animation — clone flies to top-right
      const jarEl = sectionRef.current?.querySelector(
        `.jar-cell[data-flavour="${flavourId}"] .jar-breathe`
      ) ?? null;
      if (jarEl) {
        const rect = jarEl.getBoundingClientRect();
        const clone = jarEl.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          position: fixed;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          z-index: 9999;
          pointer-events: none;
          border-radius: 8px;
          overflow: hidden;
        `;
        document.body.appendChild(clone);

        gsap.to(clone, {
          x: window.innerWidth - rect.left - rect.width - 20,
          y: -(rect.top - 20),
          scale: 0.2,
          opacity: 0,
          duration: 0.8,
          ease: "power3.in",
          onComplete: () => clone.remove(),
        });
      }

      // Glow flash on jar
      const jarContainer = sectionRef.current?.querySelector(
        `.jar-cell[data-flavour="${flavourId}"] .jar-breathe`
      );
      if (jarContainer) {
        gsap.fromTo(
          jarContainer,
          { scale: 1.12 },
          { scale: 1, duration: 0.5, ease: "elastic.out(1,0.5)" }
        );
      }

      setSelectedJar(null);
    },
    [selectedSizes, addToCart]
  );

  // Close selected jar when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".jar-cell")) {
        setSelectedJar(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <section
      id="shop"
      ref={sectionRef}
      style={{
        background: "var(--void)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Injected keyframe styles ── */}
      <style>{`
        /* Smoke wisp */
        .jar-wisp {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 18px;
          border-radius: 50%;
          background: rgba(200,180,255,0.0);
          pointer-events: none;
          z-index: 10;
        }
        .jar-cell > div:hover .jar-wisp {
          animation: wisp-rise 1.6s ease-out infinite;
        }
        @keyframes wisp-rise {
          0%   { background: rgba(200,180,255,0.55); transform: translateX(-50%) translateY(0) scale(1); opacity: 0.7; }
          60%  { background: rgba(200,180,255,0.2);  transform: translateX(-50%) translateY(-22px) scale(1.6); opacity: 0.3; }
          100% { background: rgba(200,180,255,0);    transform: translateX(-50%) translateY(-36px) scale(2.2); opacity: 0; }
        }

        /* Liquid bob */
        .jar-liquid {
          animation: liquid-bob 3.5s ease-in-out infinite;
        }
        @keyframes liquid-bob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-2px); }
        }

        /* Jar tooltip */
        .jar-tooltip {
          display: none;
          flex-direction: column;
          gap: 3px;
          position: absolute;
          bottom: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(14,10,30,0.96);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 8px 10px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6);
        }
        .jar-cell > div:hover .jar-tooltip {
          display: flex;
        }

        /* Counter beaker */
        .counter-beaker {
          width: 18px;
          height: 24px;
          position: relative;
          border: 2px solid rgba(200,150,70,0.5);
          border-top: none;
          border-radius: 0 0 6px 6px;
          background: rgba(200,150,50,0.1);
          animation: beaker-bubble 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .counter-beaker::before {
          content: '';
          position: absolute;
          top: -7px;
          left: -4px;
          right: -4px;
          height: 7px;
          border: 2px solid rgba(200,150,70,0.5);
          border-bottom: none;
          border-radius: 3px 3px 0 0;
        }
        .counter-beaker::after {
          content: '';
          position: absolute;
          bottom: 3px;
          left: 2px;
          right: 2px;
          height: 6px;
          background: rgba(200,150,50,0.3);
          border-radius: 3px;
          animation: beaker-fill 2.5s ease-in-out infinite;
        }
        @keyframes beaker-bubble {
          0%, 100% { box-shadow: inset 0 0 6px rgba(200,150,50,0.15); }
          50%       { box-shadow: inset 0 0 14px rgba(200,150,50,0.35); }
        }
        @keyframes beaker-fill {
          0%, 100% { opacity: 0.5; transform: scaleY(1); }
          50%       { opacity: 0.9; transform: scaleY(1.15); }
        }

        /* Size panel entrance */
        .jar-size-panel {
          animation: panel-appear 0.22s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes panel-appear {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        /* Wall texture behind shelves */
        .dispensary-wall {
          background:
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.012) 0px,
              rgba(255,255,255,0.012) 1px,
              transparent 1px,
              transparent 28px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.008) 0px,
              rgba(255,255,255,0.008) 1px,
              transparent 1px,
              transparent 28px
            );
        }

        /* Filter scrollbar hide */
        .shop-filter-bar::-webkit-scrollbar { display: none; }

        /* Shelf row entrance — starts hidden, JS reveals */
        .shelf-row { opacity: 0; }
      `}</style>

      {/* ── Wall texture background ── */}
      <div
        className="dispensary-wall"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Ambient amber warmth glow ── */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: 300,
          background:
            "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(180,100,20,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Main content ── */}
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: isMobile
            ? "clamp(40px,6vw,80px) 16px 0"
            : "clamp(60px,8vw,120px) 40px 0",
          position: "relative",
          zIndex: 1,
          flex: 1,
        }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: isMobile ? 32 : 48 }}>
          <span className="section-label" style={{ color: "rgba(200,150,70,0.8)" }}>
            <span
              style={{
                width: 24,
                height: 1,
                background: "rgba(200,150,70,0.6)",
                display: "inline-block",
                marginRight: 8,
              }}
            />
            Rare Compounds · Est. 2024
          </span>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: isMobile ? "clamp(44px,10vw,64px)" : "clamp(56px,7vw,96px)",
              lineHeight: 0.9,
              letterSpacing: "0.04em",
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            THE DISPENSARY
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: isMobile ? 10 : 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(200,150,70,0.65)",
              marginTop: 6,
            }}
          >
            Select Your Compounds
          </p>
        </div>

        {/* ── Filter bar ── */}
        <div
          className="shop-filter-bar"
          style={{
            display: "flex",
            gap: 6,
            flexWrap: isMobile ? "nowrap" : "wrap",
            overflowX: isMobile ? "auto" : "visible",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            paddingBottom: isMobile ? 8 : 0,
            marginBottom: isMobile ? 28 : 36,
          } as React.CSSProperties}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const label = cat === "All" ? "ALL COMPOUNDS" : cat.toUpperCase();
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedJar(null);
                }}
                style={{
                  flex: "0 0 auto",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: isMobile ? "6px 12px" : "6px 14px",
                  minHeight: 32,
                  whiteSpace: "nowrap",
                  borderRadius: 20,
                  border: isActive
                    ? "1px solid rgba(200,150,70,0.7)"
                    : "1px solid rgba(180,140,80,0.2)",
                  background: isActive
                    ? "rgba(180,120,40,0.2)"
                    : "rgba(140,90,20,0.08)",
                  color: isActive ? "rgba(220,170,80,0.95)" : "rgba(160,120,60,0.6)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isActive
                    ? "0 0 12px rgba(200,150,50,0.2), inset 0 1px 0 rgba(220,170,80,0.15)"
                    : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Shelves area ── */}
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

      {/* ── Dispensary Counter Bar ── */}
      <CounterBar
        cartCount={totalCount}
        cartTotal={totalVal}
        onViewBag={() => setCartOpen(true)}
      />
    </section>
  );
}
