"use client";
import { useState, useEffect, useRef } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [done, setDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const [brandVisible, setBrandVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start progress bar on next frame
    const raf = requestAnimationFrame(() => setProgressActive(true));

    const brandTimer = setTimeout(() => setBrandVisible(true), 1000);
    const skipTimer = setTimeout(() => setShowSkip(true), 1500);
    const doneTimer = setTimeout(() => setDone(true), 3000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(brandTimer);
      clearTimeout(skipTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onComplete, 500);
    return () => clearTimeout(t);
  }, [done, onComplete]);

  const handleSkip = () => setDone(true);

  return (
    <>
      <style>{`
        @keyframes hookah-draw {
          0%   { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes brand-fadein {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes skip-fadein {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes preloader-exit {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.05); }
        }
        .hookah-svg-path {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: hookah-draw 1.8s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .brand-text {
          opacity: 0;
          animation: brand-fadein 0.6s ease forwards;
          animation-delay: 1s;
        }
        .skip-btn {
          opacity: 0;
          animation: skip-fadein 0.4s ease forwards;
          animation-delay: 1.5s;
        }
        .preloader-exit {
          animation: preloader-exit 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>

      <div
        ref={containerRef}
        className={done ? "preloader-exit" : ""}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: done ? "none" : "auto",
        }}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="skip-btn"
          style={{
            position: "absolute",
            bottom: 32,
            right: 32,
            background: "none",
            border: "none",
            fontFamily: "var(--font-mono, 'Space Mono', monospace)",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.15em",
            cursor: "pointer",
            padding: "10px 16px",
            minHeight: 44,
          }}
        >
          SKIP →
        </button>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Hookah SVG silhouette — draws itself */}
          <svg
            viewBox="0 0 80 200"
            width="80"
            height="200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            {/* Bowl — ellipse at top */}
            <ellipse
              cx="40" cy="15" rx="18" ry="8"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              className="hookah-svg-path"
              style={{ animationDelay: "0s" }}
            />
            {/* Bowl inner detail */}
            <ellipse
              cx="40" cy="15" rx="12" ry="5"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              opacity="0.5"
              className="hookah-svg-path"
              style={{ animationDelay: "0.1s" }}
            />
            {/* Shaft — tapered vertical from bowl to base */}
            <path
              d="M37 23 L37 115 Q37 120 40 120 Q43 120 43 115 L43 23"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="hookah-svg-path"
              style={{ animationDelay: "0.15s" }}
            />
            {/* Plate — ellipse at shaft mid */}
            <ellipse
              cx="40" cy="115" rx="14" ry="4"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              className="hookah-svg-path"
              style={{ animationDelay: "0.3s" }}
            />
            {/* Base — ornate trapezoid */}
            <path
              d="M30 120 Q26 128 22 140 L58 140 Q54 128 50 120 Z"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="hookah-svg-path"
              style={{ animationDelay: "0.4s" }}
            />
            {/* Base bottom ring */}
            <ellipse
              cx="40" cy="140" rx="18" ry="5"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              className="hookah-svg-path"
              style={{ animationDelay: "0.5s" }}
            />
            {/* Base foot detail */}
            <path
              d="M24 145 Q22 150 20 155 L60 155 Q58 150 56 145"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="hookah-svg-path"
              style={{ animationDelay: "0.55s" }}
            />
            <ellipse
              cx="40" cy="155" rx="20" ry="5"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              className="hookah-svg-path"
              style={{ animationDelay: "0.6s" }}
            />
            {/* Hose port — small rect at shaft mid-point */}
            <rect
              x="43" y="68" width="8" height="5" rx="1"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              className="hookah-svg-path"
              style={{ animationDelay: "0.65s" }}
            />
            {/* Hose — S-curve from port going right and down */}
            <path
              d="M51 70.5 C62 70 68 80 65 90 C62 100 75 108 78 118"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              className="hookah-svg-path"
              style={{ animationDelay: "0.75s" }}
            />
            {/* Mouthpiece circle at hose end */}
            <circle
              cx="78" cy="121" r="4"
              stroke="var(--cyan-bright)"
              strokeWidth="1.5"
              className="hookah-svg-path"
              style={{ animationDelay: "0.9s" }}
            />
          </svg>

          {/* Brand name */}
          <div
            className="brand-text"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                fontSize: 72,
                color: "#fff",
                letterSpacing: "0.3em",
                margin: 0,
                lineHeight: 1,
              }}
            >
              HKH
            </h1>

            {/* Progress line */}
            <div
              style={{
                width: "100%",
                height: 1,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--gold, #f59e0b)",
                  width: progressActive ? "100%" : "0%",
                  transition: "width 2.5s linear",
                  borderRadius: 1,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
