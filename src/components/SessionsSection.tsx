"use client";
import React, {
  useRef, useEffect, useState, useCallback, memo, Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Float, ContactShadows } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import { SESSIONS, type SessionTier } from "@/data/sessions";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

// ─── Per-session visual identity ──────────────────────────────────────────────
const SESSION_STYLE: Record<string, {
  model: string;
  accent: string;
  glow: string;
  bg: string;
  envPreset: "warehouse" | "city" | "dawn" | "lobby" | "park" | "forest" | "studio" | "sunset" | "night" | "apartment";
  keyColor: string;
  fillColor: string;
  rimColor: string;
}> = {
  solo:      { model: "/models/door_solo.glb",      accent: "#f59e0b", glow: "rgba(245,158,11,0.5)",   bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #1a1000 0%, #0a0800 40%, #05030a 100%)", envPreset: "lobby",     keyColor: "#ffe4a0", fillColor: "#f59e0b", rimColor: "#7c3aed" },
  duo:       { model: "/models/door_duo.glb",       accent: "#68d391", glow: "rgba(104,211,145,0.5)",  bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #001a0a 0%, #000f06 40%, #05030a 100%)", envPreset: "forest",    keyColor: "#c6f6d5", fillColor: "#68d391", rimColor: "#276749" },
  squad:     { model: "/models/door_squad.glb",     accent: "#22d3ee", glow: "rgba(34,211,238,0.5)",   bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #001a1f 0%, #000e14 40%, #05030a 100%)", envPreset: "city",      keyColor: "#a5f3fc", fillColor: "#22d3ee", rimColor: "#7c3aed" },
  vip:       { model: "/models/door_vip.glb",       accent: "#f6c90e", glow: "rgba(246,201,14,0.6)",   bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #1a1400 0%, #0f0c00 40%, #05030a 100%)", envPreset: "studio",    keyColor: "#fef08a", fillColor: "#f6c90e", rimColor: "#b7791f" },
  rooftop:   { model: "/models/door_rooftop.glb",   accent: "#b794f4", glow: "rgba(183,148,244,0.5)",  bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #0f0a1f 0%, #080614 40%, #05030a 100%)", envPreset: "sunset",    keyColor: "#e9d5ff", fillColor: "#b794f4", rimColor: "#553c9a" },
  corporate: { model: "/models/door_corporate.glb", accent: "#63b3ed", glow: "rgba(99,179,237,0.5)",   bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #00101f 0%, #000a14 40%, #05030a 100%)", envPreset: "warehouse", keyColor: "#bfdbfe", fillColor: "#63b3ed", rimColor: "#1e40af" },
  wedding:   { model: "/models/door_wedding.glb",   accent: "#f687b3", glow: "rgba(246,135,179,0.5)",  bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #1a0010 0%, #0f0009 40%, #05030a 100%)", envPreset: "dawn",      keyColor: "#fce7f3", fillColor: "#f687b3", rimColor: "#b83280" },
  custom:    { model: "/models/door_custom.glb",    accent: "#ff6b35", glow: "rgba(255,107,53,0.5)",   bg: "radial-gradient(ellipse 120% 100% at 50% 80%, #1a0a00 0%, #0f0600 40%, #05030a 100%)", envPreset: "apartment", keyColor: "#fed7aa", fillColor: "#ff6b35", rimColor: "#7c3aed" },
};

// ─── Preload staggered — only first 2 on page load, rest on demand ────────────
const FIRST_TWO = ["solo", "duo"];
FIRST_TWO.forEach(id => useGLTF.preload(SESSION_STYLE[id].model));

// ─── Single door model ────────────────────────────────────────────────────────
function DoorModel({ sessionId, onReady }: { sessionId: string; onReady: () => void }) {
  const style = SESSION_STYLE[sessionId];
  const { scene } = useGLTF(style.model);
  const meshRef = useRef<THREE.Group>(null!);
  const cloned  = React.useMemo(() => scene.clone(true), [scene]);
  const ready   = useRef(false);

  useEffect(() => {
    if (!meshRef.current || ready.current) return;
    ready.current = true;

    const box = new THREE.Box3().setFromObject(meshRef.current);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2.8 / maxDim;
    meshRef.current.scale.setScalar(s);

    // Re-centre after scale
    box.setFromObject(meshRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    meshRef.current.position.sub(center);
    meshRef.current.position.y += 0.1;

    onReady();
  }, [cloned, onReady]);

  return <group ref={meshRef}><primitive object={cloned} /></group>;
}

// ─── Rotating door scene (right pane) ────────────────────────────────────────
function DoorScene({ sessionId, swingSignal }: { sessionId: string; swingSignal: number }) {
  const style   = SESSION_STYLE[sessionId];
  const groupRef = useRef<THREE.Group>(null!);
  const swung    = useRef(false);
  const autoRot  = useRef(true);
  const [modelReady, setModelReady] = useState(false);

  // Swing open when swingSignal changes (door was clicked)
  useEffect(() => {
    if (!groupRef.current || !modelReady) return;
    autoRot.current = false;
    swung.current = true;
    gsap.timeline()
      .to(groupRef.current.rotation, { y: Math.PI * 0.55, duration: 0.6, ease: "power3.out" })
      .to(groupRef.current.rotation, { y: 0, duration: 0.7, ease: "power2.inOut", delay: 0.4,
        onComplete: () => { autoRot.current = true; swung.current = false; },
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swingSignal, modelReady]);

  useFrame((_, delta) => {
    if (!groupRef.current || !autoRot.current) return;
    groupRef.current.rotation.y += delta * 0.22;
  });

  const keyColor  = new THREE.Color(style.keyColor);
  const fillColor = new THREE.Color(style.fillColor);
  const rimColor  = new THREE.Color(style.rimColor);

  return (
    <>
      {/* Environment IBL */}
      <Environment preset={style.envPreset} />

      {/* Dramatic lighting rig */}
      <ambientLight intensity={0.35} />
      {/* Key — top left warm */}
      <pointLight position={[-3, 5, 3]} intensity={28} color={keyColor} distance={12} />
      {/* Fill — accent colour from right */}
      <pointLight position={[4, 1, 3]}  intensity={20} color={fillColor} distance={10} />
      {/* Rim — back glow, coloured */}
      <pointLight position={[0, 2, -4]} intensity={18} color={rimColor} distance={10} />
      {/* Under glow — floor bounce */}
      <pointLight position={[0, -2, 2]} intensity={10} color={fillColor} distance={6} />
      {/* Front fill so textures always read */}
      <pointLight position={[0, 1, 6]}  intensity={8}  color="#ffffff" distance={8} />

      <Float speed={1.4} rotationIntensity={0.06} floatIntensity={0.18} floatingRange={[-0.06, 0.06]}>
        <group ref={groupRef}>
          <Suspense fallback={<DoorPlaceholder color={style.fillColor} />}>
            <DoorModel sessionId={sessionId} onReady={() => setModelReady(true)} />
          </Suspense>
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.55}
        scale={4}
        blur={2.2}
        color={style.accent}
      />
    </>
  );
}

// ─── Placeholder while GLB loads ──────────────────────────────────────────────
function DoorPlaceholder({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = t * 0.4;
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.2;
    }
  });
  const col = new THREE.Color(color);
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.2, 2.4, 0.12]} />
      <meshStandardMaterial
        color={col}
        emissive={col}
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// ─── Camera subtle drift ──────────────────────────────────────────────────────
function CameraRig({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.current.y * 0.3 + 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Session Modal ────────────────────────────────────────────────────────────
const SessionModal = memo(function SessionModal({
  session, onClose, onBook,
}: { session: SessionTier; onClose: () => void; onBook: (s: SessionTier) => void }) {
  const style = SESSION_STYLE[session.id] ?? SESSION_STYLE.solo;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(panelRef.current, { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)" });
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(panelRef.current, { y: 30, opacity: 0, scale: 0.96, duration: 0.18, onComplete: onClose });
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && close()}
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, overflowY: "auto",
      }}
    >
      <div ref={panelRef} style={{
        width: "min(600px,100%)",
        background: "linear-gradient(160deg,#0d0920,#08041a)",
        border: `1px solid ${style.accent}44`,
        borderTop: `3px solid ${style.accent}`,
        borderRadius: 20, overflow: "hidden", position: "relative",
        boxShadow: `0 0 80px ${style.accent}30, 0 40px 80px rgba(0,0,0,0.9)`,
      }}>
        {/* Header */}
        <div style={{
          padding: "28px 28px 22px",
          background: `linear-gradient(135deg, ${style.accent}1a 0%, transparent 60%)`,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <button onClick={close} style={{
            position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 40, filter: `drop-shadow(0 0 14px ${style.accent})` }}>{session.emoji}</span>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", color: style.accent, textTransform: "uppercase", marginBottom: 3, opacity: 0.85 }}>
                {session.mood}
              </p>
              <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(26px,5vw,42px)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>
                {session.name}
              </h2>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.58)", maxWidth: 460 }}>
            {session.vibe}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px 28px" }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
            {[
              { label: "Duration", value: session.isCustom ? "Your call" : session.duration },
              { label: "People",   value: session.isCustom ? "Any size" : `Up to ${session.people}` },
              { label: "Mood",     value: session.mood },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: "1 1 90px" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, fontWeight: 600, color: style.accent }}>{value}</p>
              </div>
            ))}
          </div>

          {!session.isCustom && session.equipment.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 10 }}>What&apos;s included</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                {session.equipment.map(eq => (
                  <div key={eq} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 3, height: 3, borderRadius: "50%", background: style.accent, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-barlow)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.isCustom && (
            <div style={{ marginBottom: 22, padding: "14px 16px", borderRadius: 12, background: `${style.accent}12`, border: `1px solid ${style.accent}30` }}>
              <p style={{ fontFamily: "var(--font-barlow)", fontSize: 13, color: "rgba(255,255,255,0.58)", lineHeight: 1.6 }}>
                Tell us exactly what you want — hookahs, people, duration, flavours, host, catering. Use the Package Wizard for a live price.
              </p>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 2 }}>Starting from</p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 32, color: style.accent, lineHeight: 1, letterSpacing: "0.04em" }}>
                {session.isCustom ? "Custom" : kes(session.price)}
              </p>
            </div>
            <button onClick={close} style={{
              fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "11px 16px", borderRadius: 10, minHeight: 44,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.35)", cursor: "pointer",
            }}>Back</button>
            <button onClick={() => { onBook(session); close(); }} style={{
              fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.08em",
              padding: "11px 22px", borderRadius: 10, minHeight: 44,
              border: `1px solid ${style.accent}`,
              background: `${style.accent}22`,
              color: style.accent, cursor: "pointer",
            }}>
              {session.isCustom ? "Open Wizard →" : "Book This →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Mobile list ──────────────────────────────────────────────────────────────
function MobileSessions({ onSelect }: { onSelect: (s: SessionTier) => void }) {
  return (
    <div style={{ padding: "16px 0 32px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SESSIONS.map(s => {
          const style = SESSION_STYLE[s.id];
          return (
            <button key={s.id} onClick={() => onSelect(s)} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1px solid ${style.accent}33`,
              borderLeft: `3px solid ${style.accent}`,
              background: `${style.accent}0d`,
              cursor: "pointer", minHeight: 60, width: "100%",
            }}>
              <span style={{ fontSize: 28, filter: `drop-shadow(0 0 8px ${style.accent})` }}>{s.emoji}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: "#fff", letterSpacing: "0.05em", lineHeight: 1, marginBottom: 2 }}>{s.name}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: style.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.isCustom ? "Custom" : kes(s.price)}</p>
              </div>
              <span style={{ color: style.accent, fontSize: 16 }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Desktop: split layout ────────────────────────────────────────────────────
function DesktopSessions({
  onSelect,
}: {
  onSelect: (s: SessionTier) => void;
}) {
  const [activeId, setActiveId]     = useState("solo");
  const [swingSignal, setSwingSignal] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSession = SESSIONS.find(s => s.id === activeId)!;
  const activeStyle   = SESSION_STYLE[activeId];

  // Preload next sessions after mount
  useEffect(() => {
    const ids = Object.keys(SESSION_STYLE).filter(id => !FIRST_TWO.includes(id));
    let i = 0;
    const next = () => {
      if (i < ids.length) {
        useGLTF.preload(SESSION_STYLE[ids[i]].model);
        i++;
        setTimeout(next, 800);
      }
    };
    const t = setTimeout(next, 2000);
    return () => clearTimeout(t);
  }, []);

  // Mouse parallax for canvas
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      };
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // Disable canvas pointer-events during scroll to kill jank
  useEffect(() => {
    const onScroll = () => {
      isScrolling.current = true;
      if (canvasRef.current) canvasRef.current.style.pointerEvents = "none";
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        isScrolling.current = false;
        if (canvasRef.current) canvasRef.current.style.pointerEvents = "auto";
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCardClick = useCallback((session: SessionTier) => {
    if (session.id === activeId) {
      // Already active — swing and open modal
      setSwingSignal(s => s + 1);
      setTimeout(() => onSelect(session), 300);
    } else {
      // Switch active door
      setActiveId(session.id);
      setSwingSignal(0);
    }
  }, [activeId, onSelect]);

  const handleEnter = useCallback(() => {
    setSwingSignal(s => s + 1);
    setTimeout(() => onSelect(activeSession), 300);
  }, [activeSession, onSelect]);

  return (
    <div style={{ display: "flex", gap: 0, width: "100%", minHeight: "85vh", position: "relative" }}>

      {/* ── Left: card list ─────────────────────────────────────── */}
      <div style={{
        width: "clamp(280px, 34%, 380px)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "0 0 0 5vw",
        justifyContent: "center",
        position: "relative",
        zIndex: 2,
      }}>
        {SESSIONS.map((session, i) => {
          const style   = SESSION_STYLE[session.id];
          const isActive = session.id === activeId;
          return (
            <button
              key={session.id}
              onClick={() => handleCardClick(session)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: isActive ? "16px 20px" : "12px 18px",
                borderRadius: 14,
                textAlign: "left",
                border: isActive
                  ? `1px solid ${style.accent}66`
                  : "1px solid rgba(255,255,255,0.05)",
                borderLeft: `3px solid ${isActive ? style.accent : "rgba(255,255,255,0.06)"}`,
                background: isActive
                  ? `linear-gradient(120deg, ${style.accent}18 0%, ${style.accent}06 100%)`
                  : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.22s ease",
                boxShadow: isActive ? `0 0 24px ${style.accent}22, inset 0 0 20px ${style.accent}08` : "none",
                transform: isActive ? "translateX(4px)" : "none",
                willChange: "transform, box-shadow",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = `${style.accent}0a`;
                  (e.currentTarget as HTMLButtonElement).style.borderLeftColor = `${style.accent}44`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
                  (e.currentTarget as HTMLButtonElement).style.borderLeftColor = "rgba(255,255,255,0.06)";
                }
              }}
            >
              {/* Number */}
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: isActive ? style.accent : "rgba(255,255,255,0.18)",
                letterSpacing: "0.1em",
                width: 18,
                flexShrink: 0,
                transition: "color 0.2s",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Emoji */}
              <span style={{
                fontSize: isActive ? 26 : 22,
                filter: isActive ? `drop-shadow(0 0 10px ${style.accent})` : "none",
                transition: "all 0.2s",
                flexShrink: 0,
              }}>
                {session.emoji}
              </span>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: isActive ? 19 : 16,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  letterSpacing: "0.05em",
                  lineHeight: 1,
                  marginBottom: 3,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {session.name}
                </p>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: isActive ? style.accent : "rgba(255,255,255,0.2)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  transition: "color 0.2s",
                }}>
                  {session.isCustom ? "Custom" : kes(session.price)}
                </p>
              </div>

              {/* Arrow */}
              {isActive && (
                <span style={{ color: style.accent, fontSize: 14, flexShrink: 0 }}>→</span>
              )}
            </button>
          );
        })}

        {/* Hint */}
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.16)", textTransform: "uppercase", marginTop: 12, paddingLeft: 2,
        }}>
          Click once to preview · Click again to open
        </p>
      </div>

      {/* ── Right: 3D door pane ──────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", minHeight: "85vh" }}>

        {/* Coloured bg per door — CSS, no GPU cost */}
        <div style={{
          position: "absolute", inset: 0,
          background: activeStyle.bg,
          transition: "background 0.6s ease",
          zIndex: 0,
        }} />

        {/* Subtle fog layers */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 40% at 50% 100%, ${activeStyle.accent}18 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 50% 0%,   rgba(0,0,0,0.6) 0%, transparent 100%)
          `,
          transition: "background 0.6s ease",
        }} />

        {/* Floating particles — pure CSS, zero GPU canvas cost */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              borderRadius: "50%",
              background: activeStyle.accent,
              opacity: 0.12 + (i % 4) * 0.05,
              left: `${8 + (i * 7.3) % 82}%`,
              bottom: `${(i * 13) % 70}%`,
              animation: `float-y ${6 + i * 0.7}s ease-in-out infinite ${i * 0.4}s`,
              transition: "background 0.6s ease",
            }} />
          ))}
        </div>

        {/* R3F Canvas — single door, one model at a time */}
        <div
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, zIndex: 2 }}
        >
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 52, near: 0.1, far: 50 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, toneMapping: 4, powerPreference: "high-performance" }}
            style={{ background: "transparent" }}
            onCreated={() => setCanvasReady(true)}
          >
            <Suspense fallback={null}>
              <CameraRig mouse={mouseRef} />
              <DoorScene key={activeId} sessionId={activeId} swingSignal={swingSignal} />
            </Suspense>
          </Canvas>
        </div>

        {/* Door name overlay — always readable */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, pointerEvents: "none",
          background: `linear-gradient(to top, rgba(5,3,10,0.95) 0%, rgba(5,3,10,0.5) 40%, transparent 100%)`,
          padding: "48px 40px 32px",
        }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.28em",
            color: activeStyle.accent, textTransform: "uppercase", marginBottom: 6, opacity: 0.9,
            transition: "color 0.4s ease",
          }}>
            {activeSession.mood} · {activeSession.isCustom ? "Custom" : `${activeSession.people} ${Number(activeSession.people) === 1 ? "person" : "people"}`}
          </p>
          <h3 style={{
            fontFamily: "var(--font-bebas)", fontSize: "clamp(36px, 4vw, 60px)",
            color: "#fff", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 10,
          }}>
            {activeSession.name}
          </h3>
          <p style={{
            fontFamily: "var(--font-barlow)", fontSize: 14, color: "rgba(255,255,255,0.5)",
            maxWidth: 360, lineHeight: 1.5, marginBottom: 20,
          }}>
            {activeSession.tagline}
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", pointerEvents: "auto" }}>
            <span style={{
              fontFamily: "var(--font-bebas)", fontSize: 28, color: activeStyle.accent,
              letterSpacing: "0.06em", lineHeight: 1,
              transition: "color 0.4s ease",
            }}>
              {activeSession.isCustom ? "Custom" : kes(activeSession.price)}
            </span>
            <button
              onClick={handleEnter}
              style={{
                fontFamily: "var(--font-bebas)", fontSize: 15, letterSpacing: "0.1em",
                padding: "10px 24px", borderRadius: 10, minHeight: 44,
                border: `1px solid ${activeStyle.accent}`,
                background: `${activeStyle.accent}22`,
                color: activeStyle.accent, cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${activeStyle.accent}44`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${activeStyle.accent}22`;
              }}
            >
              {activeSession.isCustom ? "Open Wizard →" : "Enter →"}
            </button>
          </div>
        </div>

        {/* Vignette edges */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none",
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(5,3,10,0.7) 100%)",
        }} />
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SessionsSection() {
  const isMobile = useIsMobile();
  const { setBookingOpen, addToCart } = useStore();
  const [selected, setSelected] = useState<SessionTier | null>(null);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleBook = useCallback((session: SessionTier) => {
    if (session.isCustom) {
      document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    addToCart({ id: `session-${session.id}`, type: "session", name: session.name, price: session.price, quantity: 1 });
    setBookingOpen(true);
  }, [addToCart, setBookingOpen]);

  return (
    <section
      id="sessions"
      style={{
        background: "var(--void)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        position: "relative", zIndex: 20,
        padding: isMobile
          ? "clamp(40px,6vw,60px) 16px 20px"
          : "clamp(52px,7vw,80px) 5vw 32px",
        textAlign: isMobile ? "left" : "center",
      }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em",
          color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 10, opacity: 0.8,
        }}>
          8 Ways to Session
        </p>
        <h2 style={{
          fontFamily: "var(--font-bebas)", fontWeight: 400,
          fontSize: isMobile ? "clamp(44px,11vw,64px)" : "clamp(56px,7vw,96px)",
          lineHeight: 0.92, letterSpacing: "0.04em", color: "#fff", marginBottom: 12,
        }}>
          Pick Your <span style={{ color: "var(--violet)" }}>Vibe.</span>
        </h2>
        <p style={{
          fontFamily: "var(--font-barlow)", fontSize: isMobile ? 13 : "clamp(13px,1.6vw,16px)",
          color: "rgba(255,255,255,0.38)",
          maxWidth: 400, margin: isMobile ? "0" : "0 auto",
        }}>
          {isMobile ? "Tap a session to see what's inside." : "Each door opens a different world. Select one to explore, click again to enter."}
        </p>
      </div>

      {/* Mobile */}
      {isMobile && (
        <div style={{ padding: "0 16px", position: "relative", zIndex: 10 }}>
          <MobileSessions onSelect={setSelected} />
        </div>
      )}

      {/* Desktop */}
      {!isMobile && mounted && (
        <DesktopSessions onSelect={setSelected} />
      )}

      {/* Footer note */}
      <div style={{
        textAlign: "center", padding: "24px 5vw 48px",
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.04)",
        marginTop: isMobile ? 0 : 0,
      }}>
        <p style={{
          fontFamily: "var(--font-serif, var(--font-grotesk))", fontStyle: "italic",
          fontSize: 12, color: "rgba(255,255,255,0.14)", letterSpacing: "0.06em",
        }}>
          All sessions include setup · teardown · premium coal management · Nairobi delivery
        </p>
      </div>

      {selected && (
        <SessionModal session={selected} onClose={() => setSelected(null)} onBook={handleBook} />
      )}
    </section>
  );
}
