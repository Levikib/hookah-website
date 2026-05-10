"use client";
import { useEffect, useRef, useCallback } from "react";
import type { Application } from "@splinetool/runtime";

// ─── DROP YOUR SCENE URL HERE ONCE PUBLISHED ────────────────────────────────
// 1. Open Spline → File → Publish → Copy URL
// 2. Replace the placeholder below with your scene URL
const SCENE_URL = "https://prod.spline.design/REPLACE_WITH_YOUR_SCENE_ID/scene.splinecode";
// ─────────────────────────────────────────────────────────────────────────────

interface SplineHeroProps {
  onLoad?: () => void;
}

export default function SplineHero({ onLoad }: SplineHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef   = useRef<Application | null>(null);
  const rafRef   = useRef<number>(0);

  // Mouse parallax — drives Spline variables "mouseX" and "mouseY" (-1 to 1)
  const onMouseMove = useCallback((e: MouseEvent) => {
    const app = appRef.current;
    if (!app) return;
    const mx = (e.clientX / window.innerWidth)  * 2 - 1;
    const my = (e.clientY / window.innerHeight) * 2 - 1;
    // These variable names must match what you create in Spline's editor
    try {
      app.setVariable("mouseX", mx);
      app.setVariable("mouseY", my);
    } catch {
      // Variables not yet ready — safe to ignore
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let destroyed = false;

    (async () => {
      // Lazy-load the runtime so it never touches SSR
      const { Application } = await import("@splinetool/runtime");
      if (destroyed) return;

      const app = new Application(canvasRef.current!);
      appRef.current = app;

      await app.load(SCENE_URL);
      if (destroyed) return;

      onLoad?.();

      // Trigger the idle/ambient animation if you set one up in Spline
      try {
        app.emitEvent("mouseHover", "HookahRoot");
      } catch {
        // Event may not exist yet — safe to ignore
      }
    })();

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      try { appRef.current?.dispose(); } catch { /* ignore */ }
      appRef.current = null;
    };
  }, [onMouseMove, onLoad]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        // Spline canvas background must be transparent so our nebula shows through
        background: "transparent",
      }}
    />
  );
}
