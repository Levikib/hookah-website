"use client";
import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HookahModel from "./HookahModel";
import SmokeParticles from "./SmokeParticles";

gsap.registerPlugin(ScrollTrigger);

const LABEL_DATA = [
  {
    name: "hookah_bowl",
    title: "The Bowl",
    desc: "Hand-thrown clay bowl. Porous walls slow-cook the shisha for thick, smooth smoke.",
    side: "right" as const,
    top: "12%",
  },
  {
    name: "hookah_shaft",
    title: "The Shaft",
    desc: "Brushed brass centre pole. 60cm tall for optimal smoke cooling distance.",
    side: "left" as const,
    top: "22%",
  },
  {
    name: "hookah_hose_port",
    title: "Hose Port",
    desc: "Triple-threaded brass connector. Accepts 1–4 hoses simultaneously.",
    side: "right" as const,
    top: "42%",
  },
  {
    name: "hookah_hose",
    title: "The Hose",
    desc: "Washable silicone hose. 1.5m reach, zero draw resistance.",
    side: "left" as const,
    top: "52%",
  },
  {
    name: "hookah_base",
    title: "The Base",
    desc: "Borosilicate glass vase. Fills with water to filter and cool every draw.",
    side: "right" as const,
    top: "65%",
  },
  {
    name: "hookah_plate",
    title: "The Tray",
    desc: "Deep-dish brass coal tray. Catches ash so your session stays clean.",
    side: "left" as const,
    top: "78%",
  },
  {
    name: "hookah_mouthpiece",
    title: "Mouthpiece",
    desc: "Individually sanitised hygienic tip. New tip, every session.",
    side: "right" as const,
    top: "88%",
  },
];

export default function DisassemblySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [explode, setExplode] = useState(0);
  const [progress, setProgress] = useState(0);

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
      style={{ height: "400vh", background: "var(--black)" }}
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
            Built for the session.
            <br />
            <span style={{ color: "var(--gold)" }}>Part by part.</span>
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

        {/* Label cards — appear progressively */}
        {LABEL_DATA.map((item, i) => {
          const threshold = (i + 1) / (LABEL_DATA.length + 1);
          const opacity = Math.min(1, Math.max(0, (progress - threshold + 0.1) / 0.1));
          return (
            <div
              key={item.name}
              style={{
                position: "absolute",
                top: item.top,
                ...(item.side === "left"
                  ? { left: "3vw" }
                  : { right: "3vw" }),
                zIndex: 20,
                opacity,
                transform: `translateY(${(1 - opacity) * 20}px)`,
                transition: "none",
                maxWidth: 220,
                pointerEvents: "none",
              }}
            >
              <div
                className="glass"
                style={{
                  padding: "16px 20px",
                  borderLeft: item.side === "left"
                    ? "2px solid var(--teal)"
                    : "none",
                  borderRight: item.side === "right"
                    ? "2px solid var(--gold)"
                    : "none",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: item.side === "left" ? "var(--teal)" : "var(--gold)",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {item.side === "left" ? "◀ " : ""}{item.title}{item.side === "right" ? " ▶" : ""}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-barlow)",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
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
            {Math.round(progress * 7)}/7 parts
          </span>
        </div>
      </div>
    </section>
  );
}
