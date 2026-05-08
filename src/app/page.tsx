"use client";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Sparkles } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import HookahModel from "@/components/HookahModel";
import SmokeParticles from "@/components/SmokeParticles";
import Navigation from "@/components/Navigation";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

const DisassemblySection = dynamic(() => import("@/components/DisassemblySection"), { ssr: false });
const FlavourWall = dynamic(() => import("@/components/FlavourWall"), { ssr: false });
const SessionsSection = dynamic(() => import("@/components/SessionsSection"), { ssr: false });
const RentalsSection = dynamic(() => import("@/components/RentalsSection"), { ssr: false });
const FlavourShop = dynamic(() => import("@/components/FlavourShop"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const BookingModal = dynamic(() => import("@/components/BookingModal"), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

function HeroScene({ mouseX, mouseY, isMobile }: { mouseX: number; mouseY: number; isMobile: boolean }) {
  return (
    <>
      {/* Lighting — bright enough to read against dark bg, warm on brass/gold parts */}
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 6, 5]}   intensity={8}  color="#ffffff" />
      <pointLight position={[-4, 4, 3]}  intensity={5}  color="#00f5d4" />
      <pointLight position={[2, -2, 4]}  intensity={3}  color="#ffd700" />
      <pointLight position={[0, 10, 2]}  intensity={3}  color="#ffffff" />

      <HookahModel
        mouseX={mouseX}
        mouseY={mouseY}
        scale={isMobile ? 0.75 : 1.0}
        position={isMobile ? [0, -1.2, 0] : [0.8, -1.2, 0]}
      />

      {/* Cosmic sparkles orbiting the model — desktop only */}
      {!isMobile && <Sparkles
        count={120}
        scale={[2.5, 4, 2.5]}
        size={2}
        speed={0.25}
        color="#e879f9"
        opacity={0.6}
        position={[0.6, 0, 0]}
      />}
      {!isMobile && <Sparkles
        count={60}
        scale={[3.5, 5, 3.5]}
        size={1.5}
        speed={0.15}
        color="#06b6d4"
        opacity={0.5}
        position={[0.6, 0.5, 0]}
      />}
      {!isMobile && <Sparkles
        count={40}
        scale={[1.5, 2.5, 1.5]}
        size={3}
        speed={0.4}
        color="#f59e0b"
        opacity={0.7}
        position={[0.6, 1, 0]}
      />}

      {!isMobile && <SmokeParticles bowlY={1.65} />}

      <ContactShadows
        position={[0.8, -1.25, 0]}
        opacity={0.4}
        scale={4}
        blur={3}
        color="#00f5d4"
      />
    </>
  );
}

export default function Home() {
  const { setBookingOpen } = useStore();
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
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
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      });
    });
    return () => ctx.revert();
  }, [mounted]);

  return (
    <main style={{ background: "var(--void)", minHeight: "100vh", overflowX: "hidden" }}>
      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}
      <Navigation />
      <CustomCursor />

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
          alignItems: isMobile ? "flex-end" : "center",
          paddingBottom: isMobile ? 60 : 0,
          overflow: "hidden",
          willChange: "clip-path",
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
            display: isMobile ? "none" : "block",
          }} />
          <div style={{
            position: "absolute",
            width: isMobile ? 300 : 500,
            height: isMobile ? 300 : 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
            bottom: "-10%", left: "5%",
            animation: "float-y 10s ease-in-out infinite reverse",
          }} />
          <div style={{
            position: "absolute",
            width: isMobile ? 180 : 300,
            height: isMobile ? 180 : 300,
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
              camera={{ position: [0, 0, 6.5], fov: 52 }}
              dpr={isMobile ? [1, 1] : [1, 1.5]}
              gl={{ alpha: true, antialias: true }}
              style={{ background: "transparent" }}
            >
              <Suspense fallback={null}>
                <HeroScene mouseX={mouse.x} mouseY={mouse.y} isMobile={isMobile} />
              </Suspense>
            </Canvas>
          </div>
        )}

        {/* Left-side gradient scrim — legibility */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
          background: isMobile
            ? "linear-gradient(to top, rgba(5,3,10,0.97) 0%, rgba(5,3,10,0.8) 35%, rgba(5,3,10,0.2) 60%, transparent 100%)"
            : "linear-gradient(to right, rgba(5,3,10,0.95) 0%, rgba(5,3,10,0.7) 32%, rgba(5,3,10,0.05) 50%, transparent 100%)",
        }} />

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 20,
          maxWidth: isMobile ? "100%" : 560,
          padding: isMobile ? "0 6vw" : "0 7vw",
          display: "flex", flexDirection: "column", gap: 0,
        }}>

          {/* Tag */}
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--cyan-bright)",
            marginBottom: 20,
            opacity: 0.85,
          }}>
            Est. 2024 · Premium Hookah
          </p>

          {/* Headline — 2 lines */}
          <h1 style={{
            fontFamily: "var(--font-sora)",
            fontWeight: 800,
            fontSize: isMobile ? "clamp(44px, 11vw, 64px)" : "clamp(52px, 6vw, 80px)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            marginBottom: 32,
          }}>
            The Session Starts<br />
            <span style={{ color: "var(--cyan-bright)" }}>Here.</span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontFamily: "var(--font-grotesk)",
            fontWeight: 400,
            fontSize: isMobile ? 15 : 17,
            lineHeight: 1.7,
            color: "rgba(240,242,250,0.65)",
            marginBottom: 36,
            maxWidth: 400,
            paddingTop: 4,
          }}>
            Premium hookah rentals, curated flavour sessions,
            and unforgettable experiences — delivered to you.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="btn-teal"
              style={{ fontSize: 13, letterSpacing: "0.08em" }}
              onClick={() => setBookingOpen(true)}
            >
              Book a Session ↗
            </button>
            <button className="btn-ghost" style={{ fontSize: 13, letterSpacing: "0.08em" }}>
              Explore Flavours
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: isMobile ? 24 : 36,
            marginTop: 44, paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexWrap: "wrap",
          }}>
            {[
              { value: "25+", label: "Blends" },
              { value: "6",   label: "Models" },
              { value: "8",   label: "Tiers" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p style={{
                  fontFamily: "var(--font-sora)",
                  fontWeight: 700,
                  fontSize: isMobile ? 28 : 32,
                  color: "var(--cyan-bright)",
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {value}
                </p>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "rgba(240,242,250,0.35)",
                  letterSpacing: "0.2em",
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
          S6: SHOP
      ══════════════════════════════════════════════════════════════ */}
      <FlavourShop />

      {/* ══════════════════════════════════════════════════════════════
          S7: FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <Footer />

      <CartDrawer />
      <BookingModal />
    </main>
  );
}
