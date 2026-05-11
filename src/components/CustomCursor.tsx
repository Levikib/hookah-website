"use client";
import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/context/MobileContext";

const INTERACTIVE_SELECTOR =
  "button, a, [role='button'], input, select, textarea, [data-cursor='pointer']";
const CARD_SELECTOR =
  "[data-cursor='view'], [data-flavour-card], [data-session-card], [data-rental-pedestal]";

const OUTER_DEFAULT = 32;
const OUTER_LARGE   = 72;

export default function CustomCursor() {
  const isMobile = useIsMobile();

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const mouse    = useRef({ x: -200, y: -200 });
  const lerpPos  = useRef({ x: -200, y: -200 });
  const curSize  = useRef(OUTER_DEFAULT);
  const state    = useRef<"default" | "hover" | "card">("default");
  const cardLabel = useRef("VIEW");
  const frameRef  = useRef<number>(0);
  const clickAnim = useRef(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cardEl = target.closest(CARD_SELECTOR);
    if (cardEl) {
      state.current = "card";
      cardLabel.current = (cardEl as HTMLElement).dataset.cursorLabel ?? "VIEW";
      return;
    }
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    state.current = interactive ? "hover" : "default";
  }, []);

  const onMouseLeave = useCallback(() => {
    state.current = "default";
  }, []);

  const onMouseDown = useCallback(() => {
    clickAnim.current = true;
  }, []);

  const onMouseUp = useCallback(() => {
    clickAnim.current = false;
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const label = labelRef.current;
    if (!outer || !inner) return;

    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Lerp position
      lerpPos.current.x += (mx - lerpPos.current.x) * 0.12;
      lerpPos.current.y += (my - lerpPos.current.y) * 0.12;

      const lx = lerpPos.current.x;
      const ly = lerpPos.current.y;

      // Lerp size — no CSS transition needed
      const targSize = state.current === "default" ? OUTER_DEFAULT : OUTER_LARGE;
      curSize.current += (targSize - curSize.current) * 0.18;
      const s = curSize.current;
      const half = s / 2;

      // Set transform + size in one frame, no CSS transitions fighting this
      outer.style.transform = `translate(${lx - half}px,${ly - half}px)`;
      outer.style.width     = `${s}px`;
      outer.style.height    = `${s}px`;

      // Click squish via scale only (no layout thrash)
      if (clickAnim.current) {
        outer.style.transform = `translate(${lx - half}px,${ly - half}px) scaleX(0.65) scaleY(1.3)`;
      }

      if (state.current === "card") {
        outer.style.background   = "rgba(34,211,238,0.08)";
        outer.style.borderColor  = "rgba(34,211,238,0.65)";
        inner.style.opacity      = "0";
        if (label) {
          label.style.opacity  = "1";
          label.textContent    = cardLabel.current;
        }
      } else if (state.current === "hover") {
        outer.style.background   = "rgba(124,58,237,0.1)";
        outer.style.borderColor  = "rgba(157,92,245,0.7)";
        inner.style.opacity      = "0";
        if (label) label.style.opacity = "0";
      } else {
        outer.style.background   = "transparent";
        outer.style.borderColor  = "rgba(255,255,255,0.4)";
        inner.style.opacity      = "1";
        if (label) label.style.opacity = "0";
      }

      // Inner dot — instant, no lag
      inner.style.transform = `translate(${mx - 3}px,${my - 3}px)`;
    };

    loop();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove",  onMouseMove,  { passive: true });
    document.addEventListener("mouseover",  onMouseOver,  { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("mousedown",  onMouseDown, { passive: true });
    window.addEventListener("mouseup",    onMouseUp,   { passive: true });
    return () => {
      window.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener("mouseup",    onMouseUp);
    };
  }, [onMouseMove, onMouseOver, onMouseLeave, onMouseDown, onMouseUp]);

  if (isMobile) return null;

  return (
    <>
      {/* Outer ring — NO CSS transition, all size/position done in RAF */}
      <div
        ref={outerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          width: OUTER_DEFAULT,
          height: OUTER_DEFAULT,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.4)",
          pointerEvents: "none",
          willChange: "transform, width, height",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          ref={labelRef}
          style={{
            fontFamily: "var(--font-mono, 'Space Mono', monospace)",
            fontSize: 9,
            letterSpacing: "0.15em",
            color: "var(--cyan-bright, #22d3ee)",
            opacity: 0,
            userSelect: "none",
            pointerEvents: "none",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            transition: "opacity 0.12s ease",
          }}
        >
          VIEW
        </span>
      </div>

      {/* Inner dot — instant */}
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
          transition: "opacity 0.12s ease",
        }}
      />
    </>
  );
}
