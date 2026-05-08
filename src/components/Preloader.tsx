"use client";
import { useState, useEffect } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

const EMBER_COLORS = ["#f59e0b", "#e879f9", "#7c3aed"];

interface EmberStyle {
  left: string;
  bottom: string;
  width: string;
  height: string;
  background: string;
  animationDelay: string;
  animationDuration: string;
  offsetX: string;
}

const embers: EmberStyle[] = Array.from({ length: 12 }, (_, i) => {
  const size = 6 + Math.random() * 4;
  const color = EMBER_COLORS[i % EMBER_COLORS.length];
  const delay = Math.round(Math.random() * 800);
  const duration = 1.2 + Math.random() * 0.8;
  const offsetX = (Math.random() * 80 - 40).toFixed(0);
  return {
    left: `calc(50% + ${(Math.random() * 60 - 30).toFixed(0)}px)`,
    bottom: "8%",
    width: `${size.toFixed(0)}px`,
    height: `${size.toFixed(0)}px`,
    background: color,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration.toFixed(2)}s`,
    offsetX: `${offsetX}px`,
  };
});

export default function Preloader({ onComplete }: PreloaderProps) {
  const [done, setDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [progressActive, setProgressActive] = useState(false);

  useEffect(() => {
    // Start progress bar on next frame
    const raf = requestAnimationFrame(() => setProgressActive(true));

    const skipTimer = setTimeout(() => setShowSkip(true), 1500);
    const doneTimer = setTimeout(() => setDone(true), 2800);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(skipTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onComplete, 400);
    return () => clearTimeout(t);
  }, [done, onComplete]);

  const handleSkip = () => setDone(true);

  return (
    <>
      <style>{`
        @keyframes ember-rise {
          0%   { transform: translateY(0) translateX(0) scale(1);    opacity: 0.9; }
          100% { transform: translateY(-120px) translateX(var(--ember-drift)) scale(0.3); opacity: 0; }
        }
        @keyframes logo-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(124,58,237,0.4); }
          50%       { text-shadow: 0 0 60px rgba(124,58,237,0.9), 0 0 120px rgba(232,121,249,0.3); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#05030a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: done ? 0 : 1,
          pointerEvents: done ? "none" : "auto",
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Skip button */}
        {showSkip && (
          <button
            onClick={handleSkip}
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              background: "none",
              border: "none",
              fontFamily: "var(--font-mono, 'Space Mono', monospace)",
              fontSize: 11,
              color: "#06b6d4",
              letterSpacing: "0.15em",
              cursor: "pointer",
              padding: "10px 16px",
              minHeight: 44,
              opacity: showSkip ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            SKIP →
          </button>
        )}

        {/* Ember particles */}
        {embers.map((e, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: e.left,
              bottom: e.bottom,
              width: e.width,
              height: e.height,
              borderRadius: "50%",
              background: e.background,
              // @ts-expect-error -- CSS custom property for keyframe drift
              "--ember-drift": e.offsetX,
              animation: `ember-rise ${e.animationDuration} ease-out ${e.animationDelay} infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Brand name */}
          <h1
            style={{
              fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
              fontSize: "clamp(40px, 10vw, 80px)",
              color: "#f0f2fa",
              letterSpacing: "0.15em",
              margin: 0,
              lineHeight: 1,
              animation: "logo-pulse 2.5s ease-in-out infinite",
            }}
          >
            HOOKAH
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "var(--font-mono, 'Space Mono', monospace)",
              fontSize: "clamp(10px, 2vw, 11px)",
              color: "rgba(168,155,196,0.6)",
              letterSpacing: "0.2em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Premium Sessions · Curated Flavours · Delivered
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#f59e0b",
              width: progressActive ? "100%" : "0%",
              transition: "width 2.5s linear",
            }}
          />
        </div>
      </div>
    </>
  );
}
