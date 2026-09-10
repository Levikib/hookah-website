"use client";
import { useRef, useState, useCallback, ReactNode } from "react";

interface CardRowProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onViewAll?: () => void;
}

// Netflix/DSTV-style horizontal scroll row. Reused by flavour and rental
// sections so the scroll/arrow logic lives in exactly one place.
export default function CardRow({ title, subtitle, children, onViewAll }: CardRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "0 5vw",
        marginBottom: 14,
      }}>
        <div>
          <h3 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(20px, 3vw, 28px)",
            letterSpacing: "0.04em",
            color: "var(--text-primary)",
          }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{
              fontFamily: "var(--font-barlow)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 2,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--sv-red-bright)",
              cursor: "pointer",
              minHeight: 44,
              padding: "0 4px",
            }}
          >
            View All →
          </button>
        )}
      </div>

      <div style={{ position: "relative" }}>
        {/* Left arrow — desktop only, hidden at scroll start */}
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          style={{
            display: canScrollLeft ? "flex" : "none",
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(10,5,8,0.8)",
            color: "#fff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
          }}
          className="cardrow-arrow"
        >
          ‹
        </button>

        <div
          ref={trackRef}
          onScroll={updateArrows}
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            scrollSnapType: "x proximity",
            padding: "4px 5vw 12px",
            scrollbarWidth: "none",
          }}
          className="cardrow-track"
        >
          {children}
        </div>

        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          style={{
            display: canScrollRight ? "flex" : "none",
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(10,5,8,0.8)",
            color: "#fff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
          }}
          className="cardrow-arrow"
        >
          ›
        </button>
      </div>

      <style>{`
        .cardrow-track::-webkit-scrollbar { display: none; }
        @media (max-width: 767px) {
          .cardrow-arrow { display: none !important; }
        }
      `}</style>
    </div>
  );
}
