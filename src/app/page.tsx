"use client";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Sparkles } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HookahModel from "@/components/HookahModel";
import SmokeParticles from "@/components/SmokeParticles";
import DisassemblySection from "@/components/DisassemblySection";
import FlavourWall from "@/components/FlavourWall";
import SessionsSection from "@/components/SessionsSection";
import RentalsSection from "@/components/RentalsSection";
import Footer from "@/components/Footer";
import AnimatedTitle from "@/components/AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

function HeroScene({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  return (
    <>
      {/* Richer lighting rig */}
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 5, 3]}   intensity={5}  color="#7c3aed" />
      <pointLight position={[-4, 2, -2]} intensity={3}  color="#06b6d4" />
      <pointLight position={[0, -2, 4]}  intensity={2}  color="#e879f9" />
      <pointLight position={[0, 8, 0]}   intensity={1.5} color="#f59e0b" />

      <HookahModel
        mouseX={mouseX}
        mouseY={mouseY}
        scale={1.2}
        position={[0.6, -1.8, 0]}
      />

      {/* Cosmic sparkles orbiting the model */}
      <Sparkles
        count={120}
        scale={[2.5, 4, 2.5]}
        size={2}
        speed={0.25}
        color="#e879f9"
        opacity={0.6}
        position={[0.6, 0, 0]}
      />
      <Sparkles
        count={60}
        scale={[3.5, 5, 3.5]}
        size={1.5}
        speed={0.15}
        color="#06b6d4"
        opacity={0.5}
        position={[0.6, 0.5, 0]}
      />
      <Sparkles
        count={40}
        scale={[1.5, 2.5, 1.5]}
        size={3}
        speed={0.4}
        color="#f59e0b"
        opacity={0.7}
        position={[0.6, 1, 0]}
      />

      <SmokeParticles bowlY={1.65} />

      <ContactShadows
        position={[0.6, -1.82, 0]}
        opacity={0.5}
        scale={4}
        blur={3}
        color="#7c3aed"
      />
    </>
  );
}

export default function Home() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const heroFrameRef = useRef<HTMLDivElement>(null);

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

  // Clip-path morph on hero scroll (Zentry-style)
  useEffect(() => {
    if (!heroFrameRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set(heroFrameRef.current, {
        clipPath: "polygon(3% 0%, 97% 0%, 100% 97%, 0% 100%)",
        borderRadius: "0 0 30% 10%",
      });
      gsap.from(heroFrameRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        borderRadius: "0",
        scrollTrigger: {
          trigger: heroFrameRef.current,
          start: "center center",
          end: "bottom center",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [mounted]);

  return (
    <main style={{ background: "var(--void)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════════════════════════
          HERO — full viewport, nebula background, 3D hookah
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        ref={heroFrameRef}
        className="nebula-bg"
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated nebula gradient orbs */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 700, height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
            top: "-20%", right: "-10%",
            animation: "float-y 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
            bottom: "-10%", left: "5%",
            animation: "float-y 10s ease-in-out infinite reverse",
          }} />
          <div style={{
            position: "absolute", width: 300, height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,121,249,0.12) 0%, transparent 70%)",
            top: "40%", left: "40%",
            animation: "float-y 12s ease-in-out infinite",
          }} />
        </div>

        {/* 3D Canvas — fills hero */}
        {mounted && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <Canvas
              camera={{ position: [0, 0.5, 4.5], fov: 42 }}
              dpr={[1, 1.5]}
              gl={{ alpha: true, antialias: true }}
              style={{ background: "transparent" }}
            >
              <Suspense fallback={null}>
                <HeroScene mouseX={mouse.x} mouseY={mouse.y} />
              </Suspense>
            </Canvas>
          </div>
        )}

        {/* Left-side gradient scrim — legibility */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
          background: "linear-gradient(to right, rgba(5,3,10,0.95) 0%, rgba(5,3,10,0.75) 38%, rgba(5,3,10,0.2) 60%, transparent 100%)",
        }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 20, maxWidth: 620, padding: "0 6vw" }}>

          {/* Tag */}
          <div className="section-label" style={{ marginBottom: 24 }}>
            Est. 2024 · Premium Hookah Experience
          </div>

          {/* Animated headline */}
          <AnimatedTitle
            text={"The Session\nStarts\nHere."}
            as="h1"
            start="top 90%"
            style={{
              fontSize: "clamp(60px, 9vw, 110px)",
              lineHeight: 0.92,
              letterSpacing: "0.02em",
              marginBottom: 28,
              color: "var(--text-primary)",
            }}
          />

          {/* Highlight word — override last line color */}
          <style>{`
            .animated-title div:last-child .animated-word:last-child {
              color: var(--electric);
              -webkit-text-stroke: 1px rgba(237,255,102,0.3);
            }
          `}</style>

          <p style={{
            fontFamily: "var(--font-barlow)",
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            marginBottom: 40,
            maxWidth: 420,
            fontWeight: 400,
          }}>
            Premium hookah rentals, curated flavour sessions, and unforgettable
            experiences — delivered to your door or venue.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button className="btn-teal" style={{ fontSize: 14 }}>
              Book a Session ↗
            </button>
            <button className="btn-ghost" style={{ fontSize: 14 }}>
              Explore Flavours
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: 32, marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { value: "25+", label: "Premium Blends" },
              { value: "6",   label: "Hookah Models" },
              { value: "8",   label: "Session Tiers" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: 36,
                  color: "var(--electric)",
                  lineHeight: 1,
                  marginBottom: 4,
                  letterSpacing: "0.04em",
                }}>
                  {value}
                </p>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--text-dim)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute",
          bottom: 36, left: "50%",
          zIndex: 20,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 10,
          opacity: scrolled ? 0 : 1,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
          animation: "scrollBounce 2s ease-in-out infinite",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.3em",
            color: "rgba(160,139,196,0.7)", textTransform: "uppercase",
          }}>
            Scroll
          </span>
          <div style={{
            width: 1, height: 48,
            background: "linear-gradient(to bottom, rgba(124,58,237,0.8), transparent)",
          }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          S2: DISASSEMBLY
      ══════════════════════════════════════════════════════════════ */}
      <DisassemblySection />

      {/* ══════════════════════════════════════════════════════════════
          S3: FLAVOUR WALL
      ══════════════════════════════════════════════════════════════ */}
      <section id="flavours">
        <FlavourWall />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          S4: SESSIONS
      ══════════════════════════════════════════════════════════════ */}
      <section id="sessions">
        <SessionsSection />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          S5: RENTALS
      ══════════════════════════════════════════════════════════════ */}
      <RentalsSection />

      {/* ══════════════════════════════════════════════════════════════
          S6: FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <Footer />

    </main>
  );
}
