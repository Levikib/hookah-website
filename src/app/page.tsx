"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, Sparkles } from "@react-three/drei";
import Navigation from "@/components/Navigation";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import HookahModel from "@/components/HookahModel";
import SmokeParticles from "@/components/SmokeParticles";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

const CursorCharacter   = dynamic(() => import("@/components/CursorCharacter"),   { ssr: false });
const DisassemblySection = dynamic(() => import("@/components/DisassemblySection"), { ssr: false });
const FlavourWall     = dynamic(() => import("@/components/FlavourWall"),     { ssr: false });
const SessionsSection = dynamic(() => import("@/components/SessionsSection"), { ssr: false });
const RentalsSection  = dynamic(() => import("@/components/RentalsSection"),  { ssr: false });
const FlavourShop     = dynamic(() => import("@/components/FlavourShop"),     { ssr: false });
const PackageWizard   = dynamic(() => import("@/components/PackageWizard"),   { ssr: false });
const Footer          = dynamic(() => import("@/components/Footer"),          { ssr: false });
const BookingModal    = dynamic(() => import("@/components/BookingModal"),    { ssr: false });
const CartDrawer      = dynamic(() => import("@/components/CartDrawer"),      { ssr: false });

gsap.registerPlugin(ScrollTrigger);

function HeroScene({ mouseX, mouseY, isMobile }: { mouseX: number; mouseY: number; isMobile: boolean }) {
  return (
    <>
      {/* Ambient base */}
      <ambientLight intensity={0.3} />

      {/* Key light — warm white from top-left */}
      <pointLight position={[-3, 6, 4]}  intensity={12} color="#fff8f0" />

      {/* Cyan fill — right side, lights up teal glass beautifully */}
      <pointLight position={[4, 2, 3]}   intensity={18} color="#06b6d4" />

      {/* Violet rim — back left, gives the brass a purple edge glow */}
      <pointLight position={[-4, 0, -3]} intensity={10} color="#7c3aed" />

      {/* Gold under-light — makes the base glow upward */}
      <pointLight position={[0, -3, 2]}  intensity={8}  color="#f59e0b" />

      {/* Magenta accent — upper right pop */}
      <pointLight position={[3, 5, -2]}  intensity={6}  color="#e879f9" />

      {/* IBL environment for PBR reflections — studio preset */}
      <Environment preset="studio" />

      <HookahModel
        mouseX={mouseX}
        mouseY={mouseY}
        scale={isMobile ? 0.9 : 1.7}
        position={isMobile ? [0, -0.1, 0] : [1.8, 0.1, 0]}
      />

      {/* Smoke + embers rising from bowl — bowl top at world Y≈1.5, X≈1.8 */}
      {!isMobile && (
        <SmokeParticles bowlY={1.71} bowlX={1.8} bowlZ={0} radius={0.09} />
      )}

      {/* Sparkles orbiting — desktop only */}
      {!isMobile && (
        <>
          <Sparkles count={80}  scale={[3, 5, 3]} size={1.8} speed={0.18} color="#e879f9" opacity={0.45} position={[1.8, 0, 0]} />
          <Sparkles count={50}  scale={[4, 6, 4]} size={1.4} speed={0.10} color="#06b6d4" opacity={0.35} position={[1.8, 0.5, 0]} />
          <Sparkles count={25}  scale={[2, 3, 2]} size={2.5} speed={0.30} color="#f59e0b" opacity={0.55} position={[1.8, 1.2, 0]} />
        </>
      )}

      <ContactShadows
        position={[1.0, -1.6, 0]}
        opacity={0.5}
        scale={5}
        blur={2.5}
        color="#06b6d4"
      />
    </>
  );
}

export default function Home() {
  const { setBookingOpen } = useStore();
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [mouse, setMouse]   = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const isMobile    = useIsMobile();
  const heroFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onMove  = (e: MouseEvent) => setMouse({
      x: (e.clientX / window.innerWidth)  * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    });
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("mousemove", onMove,   { passive: true });
    window.addEventListener("scroll",    onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll",    onScroll);
    };
  }, []);

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
      <CursorCharacter />

      {/* ══════════════════════════════════════════════════════════════
          HERO — full viewport, nebula background, 3D hookah
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        ref={heroFrameRef}
        className="nebula-bg"
        style={{
          position: "relative",
          height: isMobile ? "100vh" : "112vh",
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

        {/* R3F canvas — Meshy GLB hookah, mouse parallax, neon lights */}
        {mounted && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <Canvas
              camera={{ position: [0, -0.4, 5.2], fov: 58 }}
              dpr={isMobile ? [1, 1] : [1, 1.5]}
              gl={{ alpha: true, antialias: true, toneMapping: 4, powerPreference: "high-performance" }}
              style={{ background: "transparent" }}
              onCreated={() => setPreloaderDone(true)}
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
          maxWidth: isMobile ? "100%" : 580,
          padding: isMobile ? "0 6vw" : "0 7vw",
          display: "flex", flexDirection: "column", gap: 0,
          paddingTop: isMobile ? 100 : 120,
        }}>

          {/* Tag */}
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--cyan-bright)",
            marginBottom: 24,
            opacity: 0.85,
          }}>
            Est. 2026 · Premium Hookah
          </p>

          {/* Headline — 2 lines with clear break */}
          <h1 style={{
            fontFamily: "var(--font-bebas)",
            fontWeight: 400,
            fontSize: isMobile ? "clamp(52px, 13vw, 80px)" : "clamp(72px, 8vw, 112px)",
            lineHeight: 0.95,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#ffffff",
            marginBottom: 32,
          }}>
            The Session<br />
            Starts <span style={{ color: "var(--cyan-bright)" }}>Here.</span>
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
          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <button
              className="btn-teal"
              style={{ fontSize: 13, letterSpacing: "0.08em" }}
              onClick={() => setBookingOpen(true)}
            >
              Book a Session ↗
            </button>
            <button
              className="btn-ghost"
              style={{ fontSize: 13, letterSpacing: "0.08em" }}
              onClick={() => { const el = document.getElementById("flavours"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
            >
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
          S3: FLAVOUR WALL — section id="flavours" is inside component
      ══════════════════════════════════════════════════════════════ */}
      <FlavourWall />

      {/* ══════════════════════════════════════════════════════════════
          S4: SESSIONS — section id="sessions" is inside component
      ══════════════════════════════════════════════════════════════ */}
      <SessionsSection />

      {/* ══════════════════════════════════════════════════════════════
          S5: RENTALS
      ══════════════════════════════════════════════════════════════ */}
      <RentalsSection />

      {/* ══════════════════════════════════════════════════════════════
          S6: SHOP
      ══════════════════════════════════════════════════════════════ */}
      <FlavourShop />

      {/* ══════════════════════════════════════════════════════════════
          S7: PACKAGE WIZARD
      ══════════════════════════════════════════════════════════════ */}
      <PackageWizard />

      {/* ══════════════════════════════════════════════════════════════
          S8: FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <Footer />

      <CartDrawer />
      <BookingModal />
    </main>
  );
}
