"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Application } from "@splinetool/runtime";
import { useIsMobile } from "@/context/MobileContext";

gsap.registerPlugin(ScrollTrigger);

// ─── DROP YOUR DISASSEMBLY SCENE URL HERE ────────────────────────────────────
// This can be a separate Spline scene from the hero, OR the same scene
// with a different camera + animation timeline.
// In Spline, create a named animation called "disassemble" that:
//   - Frame 0:   hookah fully assembled, centred
//   - Frame 50:  parts separating, drifting outward
//   - Frame 100: fully exploded, each part at its final orbit position
// GSAP will scrub this timeline frame-by-frame as the user scrolls.
const SCENE_URL = "https://prod.spline.design/REPLACE_WITH_DISASSEMBLY_SCENE_ID/scene.splinecode";
// ─────────────────────────────────────────────────────────────────────────────

// Named animation in Spline to scrub
const ANIM_NAME = "disassemble";

const CTA_DATA = [
  { tag: "25 flavours",   title: "Choose Your Flavour", desc: "From Double Apple to Midnight Blueberry — 25 premium shisha blends for every mood.", cta: "Browse Flavours", href: "#flavours", accent: "#22d3ee", progress: 0.15 },
  { tag: "8 session tiers", title: "Book a Session",   desc: "Solo, squad, VIP, or corporate — pick the setup that fits your crew and your night.", cta: "View Sessions",   href: "#sessions", accent: "#f59e0b", progress: 0.35 },
  { tag: "6 models",      title: "Choose Your Hookah", desc: "From The Classic to The Colossus — rent the piece that matches your vibe.", cta: "See The Showroom", href: "#rentals",  accent: "#7c3aed", progress: 0.55 },
  { tag: "custom build",  title: "Design Your Setup",  desc: "Pick every detail — hookahs, flavours, hours, host. Price updates live.", cta: "Build Package",    href: "#builder",  accent: "#e879f9", progress: 0.75 },
  { tag: "buy to keep",   title: "Shop Flavours",       desc: "Take your favourite blends home. 50g, 100g, 250g — delivered to you.", cta: "Visit The Shop",  href: "#shop",     accent: "#22d3ee", progress: 0.92 },
];

// ─── Mobile fallback — clean vertical list, no 3D ────────────────────────────
function MobileDisassembly() {
  return (
    <section style={{ background: "var(--nebula)", padding: "60px 5vw" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.22em", color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 12 }}>
        What we offer
      </p>
      <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px,10vw,56px)", color: "#fff", lineHeight: 1, textTransform: "uppercase", marginBottom: 36 }}>
        Everything you need.<br />
        <span style={{ color: "var(--gold)" }}>All in one session.</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CTA_DATA.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => { e.preventDefault(); document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" }); }}
            style={{ textDecoration: "none" }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 18px", borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${item.accent}33`,
              borderLeft: `3px solid ${item.accent}`,
              minHeight: 72,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: item.accent, textTransform: "uppercase", marginBottom: 4 }}>{item.tag}</p>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: "0.04em", color: "#fff", textTransform: "uppercase", lineHeight: 1 }}>{item.title}</p>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: item.accent }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── CTA callout card ─────────────────────────────────────────────────────────
function CalloutCard({ item, visible }: { item: typeof CTA_DATA[number]; visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 20,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(480px, 88vw)",
        opacity: 0,
        pointerEvents: visible ? "auto" : "none",
        zIndex: 30,
      }}
    >
      <div style={{
        background: "rgba(5,3,10,0.88)",
        border: `1px solid ${item.accent}44`,
        borderTop: `2px solid ${item.accent}`,
        borderRadius: 20,
        padding: "24px 28px",
        backdropFilter: "blur(20px)",
        boxShadow: `0 0 60px ${item.accent}18, 0 24px 60px rgba(0,0,0,0.7)`,
      }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: item.accent, textTransform: "uppercase", marginBottom: 8 }}>{item.tag}</p>
        <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,4vw,44px)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 10 }}>{item.title}</h3>
        <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 20 }}>{item.desc}</p>
        <a
          href={item.href}
          onClick={(e) => { e.preventDefault(); document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" }); }}
          style={{
            display: "inline-block",
            fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.1em",
            padding: "12px 28px", borderRadius: 10,
            background: item.accent, color: "#05030a",
            textDecoration: "none",
          }}
        >
          {item.cta} →
        </a>
      </div>
    </div>
  );
}

// ─── Desktop 3D disassembly ───────────────────────────────────────────────────
function DesktopDisassembly() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const pinRef      = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const appRef      = useRef<Application | null>(null);
  const progressRef = useRef(0);
  const loadedRef   = useRef(false);

  // Which CTA card is currently visible based on scroll progress
  const activeIdx = CTA_DATA.findIndex((_, i) => {
    const next = CTA_DATA[i + 1];
    return progressRef.current >= CTA_DATA[i].progress && (!next || progressRef.current < next.progress);
  });

  // Load Spline runtime
  useEffect(() => {
    if (!canvasRef.current) return;
    let destroyed = false;

    (async () => {
      const { Application } = await import("@splinetool/runtime");
      if (destroyed) return;

      const app = new Application(canvasRef.current!);
      appRef.current = app;
      await app.load(SCENE_URL);
      if (destroyed) return;
      loadedRef.current = true;

      // Pause the Spline animation — GSAP will scrub it manually
      try { app.stop(); } catch { /* ignore */ }
    })();

    return () => {
      destroyed = true;
      try { appRef.current?.dispose(); } catch { /* ignore */ }
      appRef.current = null;
    };
  }, []);

  // GSAP ScrollTrigger scrubs Spline timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrubProxy = { p: 0 };

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=400%",
        pin: pinRef.current,
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress;
          progressRef.current = p;

          // Drive Spline animation time (0–100 maps to your animation frames)
          if (appRef.current && loadedRef.current) {
            try {
              // "progress" variable must be created in Spline editor (Number, 0–100)
              appRef.current.setVariable("progress", p * 100);
            } catch { /* ignore if variable not ready */ }
          }
        },
      });

      // Animate progress proxy for smooth scrub label updates
      gsap.to(scrubProxy, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=400%",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: "500vh", background: "var(--nebula)", position: "relative" }}
    >
      <div
        ref={pinRef}
        style={{ position: "relative", height: "100vh", overflow: "hidden" }}
      >
        {/* Spline canvas — fills the pinned viewport */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            background: "transparent",
          }}
        />

        {/* Ambient gradient overlay — matches site palette */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(5,3,10,0.85) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 0%,   rgba(5,3,10,0.5)  0%, transparent 60%)
          `,
        }} />

        {/* Top label */}
        <div style={{
          position: "absolute", top: "6%", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20, textAlign: "center", pointerEvents: "none",
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 10 }}>
            Scroll to explore
          </p>
          <h2 style={{
            fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,5vw,64px)",
            color: "#fff", letterSpacing: "0.04em", lineHeight: 1,
          }}>
            Everything you need.<br />
            <span style={{ color: "var(--gold)" }}>All in one session.</span>
          </h2>
        </div>

        {/* CTA callout cards — one fades in at each scroll milestone */}
        {CTA_DATA.map((item, i) => (
          <CalloutCard key={item.href} item={item} visible={i === activeIdx} />
        ))}

        {/* Scroll progress bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2, zIndex: 40,
          background: "rgba(255,255,255,0.06)",
        }}>
          <div
            id="disassembly-progress-bar"
            style={{
              height: "100%",
              background: "linear-gradient(to right, var(--violet), var(--cyan-bright))",
              width: "0%",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default function SplineDisassembly() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileDisassembly /> : <DesktopDisassembly />;
}
