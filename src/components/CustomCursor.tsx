"use client";
import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/context/MobileContext";

// Selectors that trigger the "pointer" hover state
const INTERACTIVE_SELECTOR =
  "button, a, [role='button'], input, select, textarea, [data-cursor='pointer']";

// Selectors for cards that show a label inside the ring
const CARD_SELECTOR =
  "[data-cursor='view'], [data-flavour-card], [data-session-card], [data-rental-pedestal]";

export default function CustomCursor() {
  const isMobile = useIsMobile();

  const outerRef  = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const labelRef  = useRef<HTMLSpanElement>(null);

  // Raw mouse position (instant)
  const mouse = useRef({ x: -200, y: -200 });
  // Lerped outer position
  const outerPos = useRef({ x: -200, y: -200 });

  const isHover   = useRef(false);
  const isCard    = useRef(false);
  const cardLabel = useRef("VIEW");
  const frameRef  = useRef<number>(0);

  // ---------- event handlers ----------
  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const cardEl = target.closest(CARD_SELECTOR);
    if (cardEl) {
      isCard.current = true;
      cardLabel.current =
        (cardEl as HTMLElement).dataset.cursorLabel ?? "VIEW";
      isHover.current = false;
      return;
    }
    isCard.current = false;

    const interactiveEl = target.closest(INTERACTIVE_SELECTOR);
    isHover.current = !!interactiveEl;
  }, []);

  const onMouseLeave = useCallback(() => {
    isHover.current = false;
    isCard.current  = false;
  }, []);

  const onMouseDown = useCallback(() => {
    const outer = outerRef.current;
    if (!outer) return;
    // squish click effect
    outer.style.transition = "transform 0.08s ease";
    outer.style.transform  = `translate(${outerPos.current.x - 16}px, ${
      outerPos.current.y - 16
    }px) scaleX(0.6) scaleY(1.4)`;
    setTimeout(() => {
      if (!outer) return;
      outer.style.transform = `translate(${outerPos.current.x - 16}px, ${
        outerPos.current.y - 16
      }px) scaleX(1) scaleY(1)`;
      setTimeout(() => {
        outer.style.transition = "";
      }, 150);
    }, 80);
  }, []);

  // ---------- rAF loop ----------
  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const label = labelRef.current;
    if (!outer || !inner) return;

    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);

      // Lerp outer toward mouse (0.12 factor)
      outerPos.current.x += (mouse.current.x - outerPos.current.x) * 0.12;
      outerPos.current.y += (mouse.current.y - outerPos.current.y) * 0.12;

      const ox = outerPos.current.x;
      const oy = outerPos.current.y;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Outer ring — 32px so offset by 16
      const OUTER_SIZE = 32;
      outer.style.transform = `translate(${ox - OUTER_SIZE / 2}px, ${
        oy - OUTER_SIZE / 2
      }px)`;

      if (isCard.current) {
        // Card hover — ring scales 2.5x, inner hides, show label
        outer.style.width           = `${OUTER_SIZE * 2.5}px`;
        outer.style.height          = `${OUTER_SIZE * 2.5}px`;
        outer.style.background      = "rgba(34,211,238,0.08)";
        outer.style.borderColor     = "rgba(34,211,238,0.6)";
        if (inner) inner.style.opacity = "0";
        if (label) {
          label.style.opacity = "1";
          label.textContent   = cardLabel.current;
        }
      } else if (isHover.current) {
        // Interactive hover — ring scales 2.5x, inner hides
        outer.style.width           = `${OUTER_SIZE * 2.5}px`;
        outer.style.height          = `${OUTER_SIZE * 2.5}px`;
        outer.style.background      = "rgba(34,211,238,0.08)";
        outer.style.borderColor     = "rgba(34,211,238,0.5)";
        if (inner) inner.style.opacity = "0";
        if (label) label.style.opacity = "0";
      } else {
        // Default state
        outer.style.width           = `${OUTER_SIZE}px`;
        outer.style.height          = `${OUTER_SIZE}px`;
        outer.style.background      = "transparent";
        outer.style.borderColor     = "rgba(255,255,255,0.4)";
        if (inner) inner.style.opacity = "1";
        if (label) label.style.opacity = "0";
      }

      // Inner dot — follows mouse directly, no lag (6px, offset by 3)
      inner.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    };

    loop();

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // ---------- event listeners ----------
  useEffect(() => {
    window.addEventListener("mousemove",  onMouseMove,  { passive: true });
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown",  onMouseDown);

    return () => {
      window.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown",  onMouseDown);
    };
  }, [onMouseMove, onMouseOver, onMouseLeave, onMouseDown]);

  // Touch / mobile devices don't have cursors
  if (isMobile) return null;

  return (
    <>
      {/* Lagging outer ring */}
      <div
        ref={outerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.4)",
          pointerEvents: "none",
          willChange: "transform, width, height",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "width 0.18s ease, height 0.18s ease, background 0.18s ease, border-color 0.18s ease",
        }}
      >
        {/* Label inside ring for card hovers */}
        <span
          ref={labelRef}
          style={{
            fontFamily: "var(--font-mono, 'Space Mono', monospace)",
            fontSize: 9,
            letterSpacing: "0.15em",
            color: "var(--cyan-bright, #22d3ee)",
            opacity: 0,
            transition: "opacity 0.15s ease",
            userSelect: "none",
            pointerEvents: "none",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          VIEW
        </span>
      </div>

      {/* Instant inner dot */}
      <div
        ref={innerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          zIndex: 9999,
          borderRadius: "50%",
          background: "var(--cyan-bright, #22d3ee)",
          pointerEvents: "none",
          willChange: "transform",
          transition: "opacity 0.15s ease",
        }}
      />
    </>
  );
}
