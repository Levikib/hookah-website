"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { RENTAL_MODELS } from "@/data/rentals";
import type { RentalModel } from "@/data/rentals";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

// ─── Per-model config ─────────────────────────────────────────────────────────
// bgFrom/bgTo: very dark, muted — hookah is always the hero, bg is secondary
const MODEL_CONFIG: Record<string, {
  path: string;
  keyColor: string; keyIntensity: number;
  fillColor: string; fillIntensity: number;
  rimColor: string; rimIntensity: number;
  underlightColor: string; underlightIntensity: number; // 4th light from below
  ambientIntensity: number;
  scale: number;
  positionY: number;
  bgFrom: string; bgTo: string;
  spotColor: string;
}> = {
  // Classic — brass/gold. Dark warm mahogany bg makes gold POP. Very bright cool key
  // carves engraving shadows. Magenta rim gives it drama. Orange underlight warms base.
  classic:  { path: "/models/hookah_classic.glb",
              keyColor: "#ffffff", keyIntensity: 80,        // pure white key — carves every engraving shadow
              fillColor: "#ff9500", fillIntensity: 35,      // warm orange fill — golden warmth from the side
              rimColor: "#e879f9", rimIntensity: 28,        // magenta rim — dramatic silhouette pop
              underlightColor: "#ffd060", underlightIntensity: 24,
              ambientIntensity: 0.55, scale: 1.0, positionY: 0.2,
              bgFrom: "#180800", bgTo: "#220b00", spotColor: "#f59e0b" },

  // Sultan — 24k gold-plated. Gold-on-gold washes out. Cool daylight key reveals every engraving.
  // Teal fill from opposite side creates strong colour split that reveals goldwork detail.
  sultan:   { path: "/models/hookah_sultan.glb",
              keyColor: "#d4eeff", keyIntensity: 60,       // cool daylight key — stark contrast on gold plate
              fillColor: "#06c9b0", fillIntensity: 32,     // teal fill — opposite of gold, pops all engraving
              rimColor: "#fbbf24", rimIntensity: 22,       // gold rim — frames the silhouette
              underlightColor: "#ff9500", underlightIntensity: 20, // deep orange underlight — warms base glow
              ambientIntensity: 0.65, scale: 0.95, positionY: 0.2,
              bgFrom: "#0e0900", bgTo: "#180e00", spotColor: "#fbbf24" },

  // Street King — orange/steel. Punchy white key, orange fill, violet neon rim.
  // Scale back up — 0.82 was too small.
  street:   { path: "/models/hookah_street.glb",
              keyColor: "#ffffff", keyIntensity: 75,       // harsh white key — urban, raw
              fillColor: "#ff6b35", fillIntensity: 42,     // orange fill — warm glow on steel surfaces
              rimColor: "#7c3aed", rimIntensity: 38,       // violet neon rim — street edge
              underlightColor: "#ff3a00", underlightIntensity: 28, // deep red underlight
              ambientIntensity: 0.75, scale: 1.0, positionY: 0.2,
              bgFrom: "#060a06", bgTo: "#0a1008", spotColor: "#ff6b35" },

  // Crystal — already excellent. Keep, minor scale nudge.
  crystal:  { path: "/models/hookah_crystal.glb",
              keyColor: "#ffffff", keyIntensity: 58,
              fillColor: "#22d3ee", fillIntensity: 40,
              rimColor: "#06b6d4", rimIntensity: 26,
              underlightColor: "#7dd3fc", underlightIntensity: 22,
              ambientIntensity: 1.0, scale: 1.0, positionY: 0.2,
              bgFrom: "#020308", bgTo: "#05060f", spotColor: "#22d3ee" },

  // Colossus — already excellent. Keep, minor scale nudge.
  colossus: { path: "/models/hookah_colossus.glb",
              keyColor: "#f0f8ff", keyIntensity: 32,
              fillColor: "#a855f7", fillIntensity: 22,
              rimColor: "#7c3aed", rimIntensity: 20,
              underlightColor: "#c084fc", underlightIntensity: 18,
              ambientIntensity: 0.65, scale: 0.98, positionY: 0.2,
              bgFrom: "#06040e", bgTo: "#0c0818", spotColor: "#a855f7" },
};

// No module-level preloads — all loading deferred until section enters viewport

// ─── Orbit controller ─────────────────────────────────────────────────────────
function OrbitController({ dragOrbit, autoRotRef }: {
  dragOrbit: React.MutableRefObject<{ x: number; y: number }>;
  autoRotRef: React.MutableRefObject<boolean>;
}) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false, lastX = 0, lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      autoRotRef.current = false;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      dragOrbit.current.y += (e.clientX - lastX) * 0.008;
      dragOrbit.current.x += (e.clientY - lastY) * 0.006;
      dragOrbit.current.x = Math.max(-0.55, Math.min(0.55, dragOrbit.current.x));
      lastX = e.clientX; lastY = e.clientY;
      invalidate();
    };
    const onUp = () => {
      dragging = false;
      setTimeout(() => { autoRotRef.current = true; invalidate(); }, 2000);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [gl, dragOrbit, autoRotRef, invalidate]);
  return null;
}

// ─── Auto-rotate ticker — throttled to ~28fps via RAF + setTimeout ────────────
// useFrame on "demand" canvas still fires every frame while R3F is awake.
// Instead we drive rotation via a native RAF loop that calls invalidate() only
// when actually moving, so the GPU stays idle while the user scrolls.
function AutoRotateTicker({ autoRotRef, dragOrbit, groupRef }: {
  autoRotRef: React.MutableRefObject<boolean>;
  dragOrbit: React.MutableRefObject<{ x: number; y: number }>;
  groupRef: React.MutableRefObject<THREE.Group | null>;
}) {
  const { invalidate } = useThree();
  const autoAngle = useRef(0);
  const lastTs = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const now = performance.now();
    // Throttle to ~28fps — skip frames to save GPU
    if (now - lastTs.current < 35) return;
    lastTs.current = now;

    if (autoRotRef.current) {
      autoAngle.current += delta * 0.22;
      invalidate();
    }
    const targetY = autoAngle.current + dragOrbit.current.y;
    const targetX = dragOrbit.current.x;
    const dy = targetY - groupRef.current.rotation.y;
    const dx = targetX - groupRef.current.rotation.x;
    groupRef.current.rotation.y += dy * 0.1;
    groupRef.current.rotation.x += dx * 0.1;
    // Keep invalidating if still lerping
    if (Math.abs(dy) > 0.001 || Math.abs(dx) > 0.001) invalidate();
  });
  return null;
}

// ─── Hookah model ─────────────────────────────────────────────────────────────
function HookahModel({ modelId, dragOrbit, autoRotRef }: {
  modelId: string;
  dragOrbit: React.MutableRefObject<{ x: number; y: number }>;
  autoRotRef: React.MutableRefObject<boolean>;
}) {
  const cfg = MODEL_CONFIG[modelId];
  const { scene } = useGLTF(cfg.path);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    // Normalize to 2.6 units — fills frame with breathing room top/bottom
    const norm = 2.6 / maxDim;
    clone.scale.setScalar(norm * cfg.scale);
    const center = new THREE.Vector3();
    box.getCenter(center);
    // Center exactly on X and Z; positionY shifts vertical anchor
    clone.position.set(
      -center.x * norm * cfg.scale,
      -center.y * norm * cfg.scale + cfg.positionY,
      -center.z * norm * cfg.scale
    );
    clone.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(m => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.envMapIntensity = 1.2;
            m.needsUpdate = true;
          }
        });
      }
    });
    if (groupRef.current) {
      while (groupRef.current.children.length) groupRef.current.remove(groupRef.current.children[0]);
      groupRef.current.add(clone);
    }
  }, [modelId, scene, cfg]);

  return (
    <>
      <group ref={groupRef} />
      <AutoRotateTicker autoRotRef={autoRotRef} dragOrbit={dragOrbit} groupRef={groupRef} />
    </>
  );
}

// ─── Lightweight scene — 3 lights only, no HDRI, demand rendering ────────────
function InspectionScene({ modelId, accentColor }: { modelId: string; accentColor: string }) {
  const cfg = MODEL_CONFIG[modelId];
  const dragOrbit = useRef({ x: 0, y: 0 });
  const autoRotRef = useRef(true);

  return (
    <>
      <ambientLight intensity={cfg.ambientIntensity} />
      {/* Key from top-left */}
      <pointLight position={[-3, 5, 4]}  intensity={cfg.keyIntensity}           color={cfg.keyColor}           decay={2} />
      {/* Fill from right — opposite colour to key for surface contrast */}
      <pointLight position={[4, 1, 3]}   intensity={cfg.fillIntensity}          color={cfg.fillColor}          decay={2} />
      {/* Rim from back — separates silhouette */}
      <pointLight position={[-2, 0, -4]} intensity={cfg.rimIntensity}           color={cfg.rimColor}           decay={2} />
      {/* Underlight from below — lifts engravings, warms/cools base glass */}
      <pointLight position={[0, -3, 2]}  intensity={cfg.underlightIntensity}    color={cfg.underlightColor}    decay={2} />
      <Suspense fallback={null}>
        <HookahModel modelId={modelId} dragOrbit={dragOrbit} autoRotRef={autoRotRef} />
      </Suspense>
      <ContactShadows position={[0, cfg.positionY - 1.1, 0]} opacity={0.45} scale={3.5} blur={2} color={accentColor} frames={1} />
      <OrbitController dragOrbit={dragOrbit} autoRotRef={autoRotRef} />
    </>
  );
}

// ─── Rarity config ────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; glow: string }> = {
  Standard: { label: "STANDARD",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)", glow: "rgba(148,163,184,0.3)" },
  Premium:  { label: "RARE",      color: "#22d3ee", bg: "rgba(34,211,238,0.12)",  glow: "rgba(34,211,238,0.4)"  },
  Luxury:   { label: "LEGENDARY", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  glow: "rgba(245,158,11,0.45)" },
  Event:    { label: "EXOTIC",    color: "#a855f7", bg: "rgba(168,85,247,0.12)",  glow: "rgba(168,85,247,0.5)"  },
};

// ─── Stat bar ─────────────────────────────────────────────────────────────────
function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const blocks = Math.round((value / max) * 7);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color }}>{"█".repeat(blocks)}{"░".repeat(7 - blocks)}</span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.round((value / max) * 100)}%`, background: `linear-gradient(to right, ${color}88, ${color})`, borderRadius: 2, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

const MODEL_STATS: Record<string, { style: number; presence: number; portability: number; capacity: number }> = {
  classic:  { style: 78, presence: 72, portability: 68, capacity: 65 },
  sultan:   { style: 99, presence: 97, portability: 40, capacity: 85 },
  street:   { style: 70, presence: 65, portability: 95, capacity: 62 },
  crystal:  { style: 95, presence: 90, portability: 60, capacity: 65 },
  colossus: { style: 82, presence: 99, portability: 20, capacity: 99 },
};

// ─── Desktop ──────────────────────────────────────────────────────────────────
function DesktopInspection({ onReserve }: { onReserve: (model: RentalModel) => void }) {
  const [activeId, setActiveId] = useState(RENTAL_MODELS[0].id);
  const [canvasReady, setCanvasReady] = useState(false);
  const statsRef  = useRef<HTMLDivElement>(null);
  const titleRef  = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prevId    = useRef(activeId);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCanvasReady(true);
          // Preload classic first, then others staggered
          useGLTF.preload(MODEL_CONFIG["classic"].path);
          setTimeout(() => {
            ["sultan","street","crystal","colossus"].forEach((id, i) => {
              setTimeout(() => useGLTF.preload(MODEL_CONFIG[id].path), i * 600);
            });
          }, 800);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const model = RENTAL_MODELS.find(m => m.id === activeId) ?? RENTAL_MODELS[0];
  const tier  = TIER_CONFIG[model.tier];
  const stats = MODEL_STATS[model.id];
  const cfg   = MODEL_CONFIG[model.id];

  const handleSelect = useCallback((id: string) => {
    if (id === prevId.current) return;
    prevId.current = id;
    if (statsRef.current && titleRef.current) {
      gsap.to([statsRef.current, titleRef.current], {
        opacity: 0, x: 16, duration: 0.16, ease: "power2.in",
        onComplete: () => {
          setActiveId(id);
          gsap.fromTo([statsRef.current, titleRef.current],
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.28, ease: "power3.out" }
          );
        }
      });
    } else {
      setActiveId(id);
    }
  }, []);

  return (
    <div ref={sectionRef} style={{ display: "grid", gridTemplateColumns: "1fr 360px", minHeight: "100vh", height: "100vh", position: "relative" }}>

      {/* ── LEFT: 3D canvas ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Muted model-specific bg — hookah is always foreground hero */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: `linear-gradient(180deg, ${cfg.bgFrom} 0%, ${cfg.bgTo} 100%)`,
          transition: "background 0.7s ease",
        }} />
        {/* Stage spotlight — tight radial behind hookah center */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%", height: "85%",
          zIndex: 1, pointerEvents: "none",
          background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${cfg.spotColor}26 0%, ${cfg.spotColor}06 50%, transparent 72%)`,
          transition: "background 0.6s ease",
        }} />
        {/* Ground bloom — accent pools under the base */}
        <div style={{
          position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)",
          width: "55%", height: "28%",
          zIndex: 1, pointerEvents: "none",
          background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${cfg.spotColor}35 0%, transparent 70%)`,
          transition: "background 0.6s ease",
        }} />
        {/* Top vignette — keeps eye on hookah */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "30%",
          zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }} />
        {/* Corner brackets */}
        {[
          { top: 20, left: 20, borderTop: "2px solid", borderLeft: "2px solid" },
          { top: 20, right: 20, borderTop: "2px solid", borderRight: "2px solid" },
          { bottom: 20, left: 20, borderBottom: "2px solid", borderLeft: "2px solid" },
          { bottom: 20, right: 20, borderBottom: "2px solid", borderRight: "2px solid" },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", ...s, zIndex: 3, width: 28, height: 28,
            borderColor: `${model.accentColor}44`, pointerEvents: "none", transition: "border-color 0.6s ease",
          }} />
        ))}
        {/* Smoke + ember particles rising from bowl — pure CSS, zero GPU cost */}
        {[
          { left: "49%",  delay: "0s",    dur: "3.2s", size: 22, blur: 8  },
          { left: "51%",  delay: "0.9s",  dur: "3.8s", size: 18, blur: 6  },
          { left: "47%",  delay: "1.6s",  dur: "4.1s", size: 26, blur: 10 },
          { left: "53%",  delay: "2.4s",  dur: "3.5s", size: 16, blur: 7  },
          { left: "50%",  delay: "3.1s",  dur: "4.4s", size: 20, blur: 9  },
        ].map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: p.left,
            top: "26%",
            zIndex: 5,
            pointerEvents: "none",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${model.accentColor}55 0%, ${model.accentColor}11 60%, transparent 100%)`,
            filter: `blur(${p.blur}px)`,
            animation: `smokeRise ${p.dur} ${p.delay} ease-out infinite`,
            transform: "translateX(-50%)",
          }} />
        ))}
        {/* Embers — tiny bright sparks */}
        {[
          { left: "48%", delay: "0.4s",  dur: "2.1s" },
          { left: "52%", delay: "1.3s",  dur: "2.6s" },
          { left: "50%", delay: "2.2s",  dur: "1.9s" },
        ].map((p, i) => (
          <div key={`ember-${i}`} style={{
            position: "absolute",
            left: p.left,
            top: "27%",
            zIndex: 5,
            pointerEvents: "none",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: model.accentColor,
            boxShadow: `0 0 6px 2px ${model.accentColor}`,
            animation: `emberFloat ${p.dur} ${p.delay} ease-out infinite`,
            transform: "translateX(-50%)",
          }} />
        ))}
        {/* Drag hint */}
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, pointerEvents: "none",
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>⟳</span> DRAG TO INSPECT
        </div>
        {/* Canvas — only mounts when section enters viewport */}
        {canvasReady && (
          <Canvas
            camera={{ position: [0, 0.15, 4.4], fov: 44 }}
            dpr={[1, 1.2]}
            frameloop="demand"
            gl={{
              alpha: true,
              antialias: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
              powerPreference: "high-performance",
            }}
            style={{ position: "absolute", inset: 0, zIndex: 4, background: "transparent" }}
          >
            <InspectionScene key={activeId} modelId={activeId} accentColor={model.accentColor} />
          </Canvas>
        )}
      </div>

      {/* ── RIGHT: Stats panel ── */}
      <div style={{
        background: "rgba(5,3,10,0.97)",
        borderLeft: `1px solid ${model.accentColor}22`,
        display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "border-color 0.6s ease",
      }}>
        <div style={{ height: 2, background: `linear-gradient(to right, ${model.accentColor}, transparent)`, transition: "background 0.6s ease" }} />

        {/* Name + tier */}
        <div ref={titleRef} style={{ padding: "24px 24px 0" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: tier.bg, border: `1px solid ${tier.color}44`,
            borderRadius: 4, padding: "4px 10px", marginBottom: 12,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color, boxShadow: `0 0 8px ${tier.glow}` }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.24em", color: tier.color }}>{tier.label}</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: 40, letterSpacing: "0.04em", color: "#fff", lineHeight: 0.95, marginBottom: 6 }}>
            {model.name}
          </h2>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.5, marginBottom: 20 }}>
            {model.tagline}
          </p>
        </div>

        {/* Stats + specs */}
        <div ref={statsRef} style={{ padding: "0 24px", flex: 1, overflowY: "auto" }}>
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>PERFORMANCE</p>
            <StatBar label="Style"       value={stats.style}       max={100} color={model.accentColor} />
            <StatBar label="Presence"    value={stats.presence}    max={100} color={model.accentColor} />
            <StatBar label="Portability" value={stats.portability} max={100} color={model.accentColor} />
            <StatBar label="Capacity"    value={stats.capacity}    max={100} color={model.accentColor} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>SPECIFICATIONS</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Height",   value: model.height },
                { label: "Material", value: model.material.split(" + ")[0] },
                { label: "Hose",     value: model.hoseType },
                { label: "Units",    value: `${model.available} in stock` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
            padding: "10px 14px", background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: model.available > 2 ? "#22d3ee" : model.available === 1 ? "#fbbf24" : "#6b5f88",
              boxShadow: model.available > 0 ? `0 0 8px ${model.available > 2 ? "#22d3ee" : "#fbbf24"}` : "none",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: model.available > 2 ? "#22d3ee" : "#fbbf24" }}>
              {model.available > 2 ? `${model.available} UNITS AVAILABLE` : model.available === 1 ? "LAST UNIT — ACT FAST" : `${model.available} UNITS LEFT`}
            </span>
          </div>

          {/* Pricing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            <div style={{ background: `${model.accentColor}14`, border: `1px solid ${model.accentColor}33`, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>SESSION</p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 22, color: model.accentColor, letterSpacing: "0.04em" }}>{kes(model.sessionRate)}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>DAILY</p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 22, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{kes(model.dailyRate)}</p>
            </div>
          </div>
        </div>

        {/* Reserve CTA */}
        <div style={{ padding: "14px 24px 22px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => onReserve(model)}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${model.accentColor}, ${model.accentColor}cc)`,
              color: "#05030a", fontFamily: "var(--font-bebas)", fontSize: 17,
              letterSpacing: "0.12em", cursor: "pointer",
              boxShadow: `0 6px 28px ${model.accentColor}44`,
              transition: "all 0.22s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 36px ${model.accentColor}66`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 28px ${model.accentColor}44`; }}
          >
            RESERVE {model.name.toUpperCase()} →
          </button>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", textAlign: "center", marginTop: 8 }}>
            Added to package · complete booking at checkout
          </p>
        </div>

        {/* Loadout list */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginBottom: 6, paddingLeft: 6 }}>LOADOUT</p>
          {RENTAL_MODELS.map((m, i) => {
            const isActive = m.id === activeId;
            const t = TIER_CONFIG[m.tier];
            return (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 10px", borderRadius: 6, border: "none",
                  background: isActive ? `${m.accentColor}18` : "transparent",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  outline: isActive ? `1px solid ${m.accentColor}44` : "1px solid transparent",
                  transition: "all 0.18s ease",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: isActive ? m.accentColor : "rgba(255,255,255,0.2)", minWidth: 16 }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, boxShadow: isActive ? `0 0 6px ${t.glow}` : "none", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-bebas)", fontSize: 14, letterSpacing: "0.06em", color: isActive ? "#fff" : "rgba(255,255,255,0.4)", flex: 1 }}>{m.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: isActive ? m.accentColor : "rgba(255,255,255,0.2)" }}>{kes(m.sessionRate)}</span>
                {isActive && <div style={{ width: 3, height: 16, borderRadius: 2, background: m.accentColor, boxShadow: `0 0 8px ${m.accentColor}` }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile ───────────────────────────────────────────────────────────────────
function MobileInspection({ onReserve }: { onReserve: (model: RentalModel) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const model = RENTAL_MODELS[activeIdx];
  const tier  = TIER_CONFIG[model.tier];
  const stats = MODEL_STATS[model.id];
  const cfg   = MODEL_CONFIG[model.id];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCanvasReady(true);
          useGLTF.preload(MODEL_CONFIG["classic"].path);
          setTimeout(() => {
            ["sultan","street","crystal","colossus"].forEach((id, i) => {
              setTimeout(() => useGLTF.preload(MODEL_CONFIG[id].path), i * 600);
            });
          }, 800);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={sectionRef} style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ height: "65vw", minHeight: 280, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: `linear-gradient(180deg, ${cfg.bgFrom} 0%, ${cfg.bgTo} 100%)`, transition: "background 0.6s ease" }} />
        {/* Stage spotlight mobile */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80%", height: "85%", zIndex: 1, pointerEvents: "none", background: `radial-gradient(ellipse 55% 60% at 50% 50%, ${cfg.spotColor}26 0%, transparent 72%)`, transition: "background 0.6s ease" }} />
        <div style={{ position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)", width: "55%", height: "28%", zIndex: 1, pointerEvents: "none", background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${cfg.spotColor}35 0%, transparent 70%)`, transition: "background 0.6s ease" }} />
        {canvasReady && (
          <Canvas
            camera={{ position: [0, 0.1, 4.4], fov: 46 }}
            dpr={[1, 1]}
            frameloop="demand"
            gl={{ alpha: true, antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1, powerPreference: "high-performance" }}
            style={{ position: "absolute", inset: 0, zIndex: 2, background: "transparent" }}
          >
            <InspectionScene key={model.id} modelId={model.id} accentColor={model.accentColor} />
          </Canvas>
        )}
        {[{ top: 10, left: 10, borderTop: "1.5px solid", borderLeft: "1.5px solid" }, { top: 10, right: 10, borderTop: "1.5px solid", borderRight: "1.5px solid" }, { bottom: 10, left: 10, borderBottom: "1.5px solid", borderLeft: "1.5px solid" }, { bottom: 10, right: 10, borderBottom: "1.5px solid", borderRight: "1.5px solid" }].map((s, i) => (
          <div key={i} style={{ position: "absolute", ...s, zIndex: 3, width: 18, height: 18, borderColor: `${model.accentColor}55`, pointerEvents: "none", transition: "border-color 0.5s ease" }} />
        ))}
      </div>

      {/* Model selector */}
      <div style={{ display: "flex", gap: 6, padding: "12px 16px", overflowX: "auto", background: "rgba(5,3,10,0.95)", borderTop: `1px solid ${model.accentColor}22` }}>
        {RENTAL_MODELS.map((m, i) => {
          const isActive = i === activeIdx;
          const t = TIER_CONFIG[m.tier];
          return (
            <button key={m.id} onClick={() => setActiveIdx(i)} style={{
              flexShrink: 0, padding: "6px 12px", borderRadius: 6, border: "none",
              background: isActive ? `${m.accentColor}20` : "rgba(255,255,255,0.04)",
              outline: isActive ? `1px solid ${m.accentColor}55` : "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer", minHeight: 44,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, margin: "0 auto 4px", boxShadow: isActive ? `0 0 6px ${t.glow}` : "none" }} />
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 11, letterSpacing: "0.06em", color: isActive ? "#fff" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{m.name.replace("The ", "")}</p>
            </button>
          );
        })}
      </div>

      <div style={{ padding: "20px 20px 32px", background: "rgba(5,3,10,0.98)", flex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: tier.bg, border: `1px solid ${tier.color}44`, borderRadius: 4, padding: "3px 8px", marginBottom: 10 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: tier.color, boxShadow: `0 0 6px ${tier.glow}` }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: tier.color }}>{tier.label}</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: 34, letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: 4 }}>{model.name}</h2>
        <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 18 }}>{model.tagline}</p>
        <div style={{ marginBottom: 18 }}>
          <StatBar label="Style"       value={stats.style}       max={100} color={model.accentColor} />
          <StatBar label="Presence"    value={stats.presence}    max={100} color={model.accentColor} />
          <StatBar label="Portability" value={stats.portability} max={100} color={model.accentColor} />
          <StatBar label="Capacity"    value={stats.capacity}    max={100} color={model.accentColor} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <div style={{ flex: 1, background: `${model.accentColor}14`, border: `1px solid ${model.accentColor}33`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2 }}>Session</p>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: model.accentColor }}>{kes(model.sessionRate)}</p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2 }}>Daily</p>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: "rgba(255,255,255,0.45)" }}>{kes(model.dailyRate)}</p>
          </div>
        </div>
        <button onClick={() => onReserve(model)} style={{
          width: "100%", padding: "14px 0", borderRadius: 8, border: "none",
          background: `linear-gradient(135deg, ${model.accentColor}, ${model.accentColor}cc)`,
          color: "#05030a", fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.1em",
          cursor: "pointer", boxShadow: `0 6px 24px ${model.accentColor}44`, minHeight: 44,
        }}>
          RESERVE {model.name.toUpperCase()} →
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RentalsSection() {
  const isMobile = useIsMobile();
  const { setBookingHookah, addToCart, setBookingOpen, setBookingStep } = useStore();

  const handleReserve = useCallback((model: RentalModel) => {
    setBookingHookah(model);
    addToCart({ id: `rental-${model.id}`, type: "rental", name: `${model.name} Hookah`, price: model.sessionRate, quantity: 1 });
    // Open the booking modal at step 1 so user picks session, then date, then flavours
    setBookingStep(1);
    setBookingOpen(true);
  }, [setBookingHookah, addToCart, setBookingOpen, setBookingStep]);

  return (
    <section
      id="rentals"
      style={{ position: "relative", background: "var(--void)", overflow: "hidden" }}
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        #rentals { scroll-margin-top: 80px; }
        @keyframes smokeRise {
          0%   { transform: translateX(-50%) translateY(0)    scale(0.4); opacity: 0.55; }
          40%  { opacity: 0.35; }
          100% { transform: translateX(-50%) translateY(-110px) scale(2.2); opacity: 0; }
        }
        @keyframes emberFloat {
          0%   { transform: translateX(-50%) translateY(0) scale(1);   opacity: 0.9; }
          60%  { opacity: 0.6; }
          100% { transform: translateX(-50%) translateY(-80px) scale(0); opacity: 0; }
        }
      `}</style>

      {/* Section label */}
      <div style={{
        padding: isMobile ? "40px 20px 16px" : "clamp(40px,5vw,64px) clamp(20px,5vw,60px) 20px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <p className="section-label">The Showroom</p>
          <h2 style={{
            fontFamily: "var(--font-bebas)", fontSize: isMobile ? "clamp(44px,11vw,64px)" : "clamp(52px,6vw,88px)",
            color: "#fff", letterSpacing: "0.04em", lineHeight: 0.92,
          }}>
            Select Your<br />
            <span style={{ color: "var(--cyan-bright)" }}>Piece.</span>
          </h2>
        </div>
        <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: isMobile ? 13 : 15, color: "rgba(255,255,255,0.3)", maxWidth: 340, lineHeight: 1.6 }}>
          Six masterworks in the armory. Drag to inspect. Reserve what&apos;s yours.
        </p>
      </div>

      {isMobile
        ? <MobileInspection onReserve={handleReserve} />
        : <DesktopInspection onReserve={handleReserve} />
      }
    </section>
  );
}
