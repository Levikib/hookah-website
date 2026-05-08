"use client";
import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HookahModel from "./HookahModel";
import SmokeParticles from "./SmokeParticles";

gsap.registerPlugin(ScrollTrigger);

const CTA_DATA = [
  {
    name: "hookah_bowl",
    tag: "25 flavours",
    title: "Choose Your Flavour",
    desc: "From Double Apple to Midnight Blueberry — 25 premium shisha blends for every mood.",
    cta: "Browse Flavours",
    href: "#flavours",
    accent: "var(--teal)",
    side: "right" as const,
    top: "10%",
  },
  {
    name: "hookah_shaft",
    tag: "8 session tiers",
    title: "Book a Session",
    desc: "Solo, squad, VIP, or corporate — pick the setup that fits your crew and your night.",
    cta: "View Sessions",
    href: "#sessions",
    accent: "var(--gold)",
    side: "left" as const,
    top: "25%",
  },
  {
    name: "hookah_hose_port",
    tag: "6 models",
    title: "Choose Your Hookah",
    desc: "From The Classic to The Colossus — rent the piece that matches your vibe.",
    cta: "See The Showroom",
    href: "#rentals",
    accent: "var(--purple)",
    side: "right" as const,
    top: "45%",
  },
  {
    name: "hookah_hose",
    tag: "custom build",
    title: "Design Your Setup",
    desc: "Pick every detail — hookahs, people, flavours, hours, host, catering. Price updates live.",
    cta: "Build Custom Session",
    href: "#sessions",
    accent: "var(--orange)",
    side: "left" as const,
    top: "63%",
  },
  {
    name: "hookah_base",
    tag: "buy to keep",
    title: "Shop Flavours",
    desc: "Take your favourite blends home. Available in 50g, 100g, and 250g — delivered to you.",
    cta: "Visit The Shop",
    href: "#shop",
    accent: "var(--teal)",
    side: "right" as const,
    top: "80%",
  },
];

export default function DisassemblySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [explode, setExplode] = useState(0);
  const [progress, setProgress] = useState(0);
  const ITEMS = CTA_DATA;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=300%",
          pin: pinRef.current,
          scrub: 1.5,
          onUpdate: (self) => {
            setExplode(self.progress);
            setProgress(self.progress);
          },
        },
      });
      tl.to({}, { duration: 1 }); // placeholder for scrub
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: "400vh", background: "var(--nebula)" }}
    >
      {/* Pinned viewport */}
      <div
        ref={pinRef}
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Top label */}
        <div
          style={{
            position: "absolute",
            top: "6%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--teal)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Scroll to explore
          </p>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(40px, 5vw, 64px)",
              color: "#fff",
              letterSpacing: "0.04em",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            Everything you need.
            <br />
            <span style={{ color: "var(--gold)" }}>All in one session.</span>
          </h2>
        </div>

        {/* 3D Canvas */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Canvas
            camera={{ position: [0, 1.2, 5], fov: 38 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true }}
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <pointLight position={[4, 5, 4]} intensity={4} color="#ffd700" />
              <pointLight position={[-4, 3, -3]} intensity={2.5} color="#00f5d4" />
              <pointLight position={[0, -3, 4]} intensity={1.5} color="#9d4edd" />
              <HookahModel
                explode={explode}
                scale={1.0}
                position={[0, -1.6, 0]}
              />
              <SmokeParticles bowlY={explode > 0.1 ? 99 : 1.65} />
              <ContactShadows
                position={[0, -1.62, 0]}
                opacity={Math.max(0, 0.3 - explode * 0.3)}
                scale={3}
                blur={3}
                color="#00f5d4"
              />
            </Suspense>
          </Canvas>
        </div>

        {/* CTA cards — appear progressively as hookah disassembles */}
        {ITEMS.map((item, i) => {
          const threshold = (i + 1) / (ITEMS.length + 1);
          const opacity = Math.min(1, Math.max(0, (progress - threshold + 0.12) / 0.12));
          const translateY = (1 - opacity) * 24;
          return (
            <div
              key={item.name}
              style={{
                position: "absolute",
                top: item.top,
                ...(item.side === "left" ? { left: "3vw" } : { right: "3vw" }),
                zIndex: 20,
                opacity,
                transform: `translateY(${translateY}px)`,
                transition: "none",
                maxWidth: 260,
                pointerEvents: opacity > 0.5 ? "auto" : "none",
              }}
            >
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  className="glass"
                  style={{
                    padding: "18px 22px",
                    borderLeft: item.side === "left" ? `2px solid ${item.accent}` : "none",
                    borderRight: item.side === "right" ? `2px solid ${item.accent}` : "none",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `inset 0 0 24px ${item.accent}22, 0 8px 32px rgba(0,0,0,0.5)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  }}
                >
                  {/* Tag */}
                  <p style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    color: item.accent,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}>
                    {item.tag}
                  </p>
                  {/* Title */}
                  <p style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: 22,
                    letterSpacing: "0.05em",
                    color: "#fff",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    lineHeight: 1,
                  }}>
                    {item.title}
                  </p>
                  {/* Description */}
                  <p style={{
                    fontFamily: "var(--font-barlow)",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.72)",
                    lineHeight: 1.5,
                    marginBottom: 14,
                  }}>
                    {item.desc}
                  </p>
                  {/* CTA link */}
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: item.accent,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    {item.cta} →
                  </span>
                </div>
              </a>
            </div>
          );
        })}

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 120,
              height: 2,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 1,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: "var(--teal)",
                borderRadius: 1,
                transition: "width 0.1s linear",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
            }}
          >
            {Math.min(ITEMS.length, Math.round(progress * ITEMS.length + 0.5))}/{ITEMS.length} options
          </span>
        </div>
      </div>
    </section>
  );
}
