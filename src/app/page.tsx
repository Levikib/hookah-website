"use client";
import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import HookahModel from "@/components/HookahModel";
import SmokeParticles from "@/components/SmokeParticles";

function Scene({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 4, 3]} intensity={3} color="#ffd700" />
      <pointLight position={[-3, 2, -2]} intensity={2} color="#00f5d4" />
      <pointLight position={[0, -2, 3]} intensity={1.2} color="#9d4edd" />

      <HookahModel
        mouseX={mouseX}
        mouseY={mouseY}
        scale={1.1}
        position={[0, -1.8, 0]}
      />
      <SmokeParticles bowlY={1.65} />
      <ContactShadows
        position={[0, -1.82, 0]}
        opacity={0.35}
        scale={3}
        blur={2.5}
        color="#00f5d4"
      />
    </>
  );
}

export default function Home() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [handleMouseMove]);

  return (
    <main style={{ background: "var(--black)", minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* 3D Canvas — z-index 0 */}
        {mounted && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Canvas
              camera={{ position: [0, 0.5, 4.5], fov: 42 }}
              dpr={[1, 1.5]}
              gl={{ alpha: true, antialias: true }}
              style={{ background: "transparent" }}
            >
              <Suspense fallback={null}>
                <Scene mouseX={mouse.x} mouseY={mouse.y} />
              </Suspense>
            </Canvas>
          </div>
        )}

        {/* Gradient scrim — z-index 10 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 42%, rgba(0,0,0,0.1) 65%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Content — z-index 20 */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            maxWidth: 560,
            padding: "0 5vw",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--teal)",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Est. 2024 · Premium Hookah Experience
          </p>

          <h1
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(64px, 8vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              color: "#fff",
              marginBottom: 24,
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
            }}
          >
            The Session
            <br />
            Starts
            <br />
            <span style={{ color: "var(--teal)" }}>Here.</span>
          </h1>

          <p
            style={{
              fontFamily: "var(--font-barlow)",
              fontSize: 20,
              fontWeight: 400,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.78)",
              marginBottom: 36,
              maxWidth: 420,
            }}
          >
            Premium hookah rentals, curated flavour sessions, and unforgettable
            experiences — delivered to your door or venue.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button className="btn-teal" style={{ fontSize: 15 }}>
              Book a Session
            </button>
            <button className="btn-ghost" style={{ fontSize: 15 }}>
              Explore Flavours
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: scrolled ? 0 : 1,
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--teal)",
              textTransform: "uppercase",
            }}
          >
            Scroll to Explore
          </span>
          <svg
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill="none"
            style={{ animation: "scrollBounce 1.8s ease-in-out infinite" }}
          >
            <path
              d="M2 2L10 10L18 2"
              stroke="var(--teal)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <style>{`
          @keyframes scrollBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
        `}</style>
      </section>

      {/* ── PLACEHOLDER SECTIONS ─────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--black)",
        }}
      >
        <div className="glass" style={{ padding: "48px 64px", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: 56,
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            Section 2 — Disassembly
          </h2>
          <p
            style={{
              fontFamily: "var(--font-barlow)",
              color: "rgba(255,255,255,0.55)",
              marginTop: 12,
              fontSize: 18,
            }}
          >
            Coming in Step 3
          </p>
        </div>
      </section>

      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
        }}
      >
        <div className="glass" style={{ padding: "48px 64px", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: 56,
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            Section 3 — Flavour Wall
          </h2>
          <p
            style={{
              fontFamily: "var(--font-barlow)",
              color: "rgba(255,255,255,0.55)",
              marginTop: 12,
              fontSize: 18,
            }}
          >
            Coming in Step 4
          </p>
        </div>
      </section>
    </main>
  );
}
