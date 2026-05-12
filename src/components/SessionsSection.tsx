"use client";
import React, {
  useRef, useEffect, useState, useCallback, memo, Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import { SESSIONS, type SessionTier } from "@/data/sessions";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

// ─── Per-session visual identity ──────────────────────────────────────────────
// bg: noticeably lighter midpoint so dark-textured doors (squad/corporate/duo)
//     pop against their environment rather than blending into void.
// keyColor: always a bright near-white variant of the accent — floods the front face.
// fillIntensity / keyIntensity: per-session tuning so every door reads equally well.
const SESSION_STYLE: Record<string, {
  model: string;
  accent: string;
  bg: string;
  keyColor: string;
  fillColor: string;
  rimColor: string;
  keyIntensity: number;
  fillIntensity: number;
  ambientIntensity: number;
}> = {
  solo: {
    model: "/models/door_solo.glb", accent: "#f59e0b",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #3d2200 0%, #1a0e00 45%, #05030a 100%)",
    keyColor: "#fff3d0", fillColor: "#f59e0b", rimColor: "#7c3aed",
    keyIntensity: 38, fillIntensity: 26, ambientIntensity: 0.55,
  },
  duo: {
    model: "/models/door_duo.glb", accent: "#68d391",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #004020 0%, #001a0a 45%, #05030a 100%)",
    keyColor: "#e0fff0", fillColor: "#68d391", rimColor: "#276749",
    keyIntensity: 50, fillIntensity: 38, ambientIntensity: 0.75,
  },
  squad: {
    model: "/models/door_squad.glb", accent: "#22d3ee",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #003d4d 0%, #001820 45%, #05030a 100%)",
    keyColor: "#e0faff", fillColor: "#22d3ee", rimColor: "#0891b2",
    keyIntensity: 55, fillIntensity: 42, ambientIntensity: 0.85,
  },
  vip: {
    model: "/models/door_vip.glb", accent: "#f6c90e",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #3a2e00 0%, #181200 45%, #05030a 100%)",
    keyColor: "#fffbe0", fillColor: "#f6c90e", rimColor: "#b7791f",
    keyIntensity: 36, fillIntensity: 24, ambientIntensity: 0.5,
  },
  rooftop: {
    model: "/models/door_rooftop.glb", accent: "#b794f4",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #261040 0%, #0f0620 45%, #05030a 100%)",
    keyColor: "#f0e8ff", fillColor: "#b794f4", rimColor: "#553c9a",
    keyIntensity: 44, fillIntensity: 32, ambientIntensity: 0.65,
  },
  corporate: {
    model: "/models/door_corporate.glb", accent: "#63b3ed",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #002540 0%, #001020 45%, #05030a 100%)",
    keyColor: "#dff0ff", fillColor: "#63b3ed", rimColor: "#2b6cb0",
    keyIntensity: 52, fillIntensity: 40, ambientIntensity: 0.8,
  },
  wedding: {
    model: "/models/door_wedding.glb", accent: "#f687b3",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #3d0028 0%, #1a0012 45%, #05030a 100%)",
    keyColor: "#ffe8f3", fillColor: "#f687b3", rimColor: "#b83280",
    keyIntensity: 40, fillIntensity: 28, ambientIntensity: 0.6,
  },
  custom: {
    model: "/models/door_custom.glb", accent: "#ff6b35",
    bg: "radial-gradient(ellipse 160% 120% at 50% 90%, #3d1500 0%, #1a0800 45%, #05030a 100%)",
    keyColor: "#fff0e8", fillColor: "#ff6b35", rimColor: "#7c3aed",
    keyIntensity: 42, fillIntensity: 30, ambientIntensity: 0.6,
  },
};

useGLTF.preload(SESSION_STYLE["solo"].model);

const _box    = new THREE.Box3();
const _size   = new THREE.Vector3();
const _center = new THREE.Vector3();

function normaliseModel(group: THREE.Group, targetH = 2.8) {
  _box.setFromObject(group);
  _box.getSize(_size);
  const maxDim = Math.max(_size.x, _size.y, _size.z);
  if (maxDim === 0) return;
  const s = targetH / maxDim;
  group.scale.setScalar(s);
  _box.setFromObject(group);
  _box.getCenter(_center);
  group.position.sub(_center);
  group.position.y += 0.05;
}

// ─── Door mesh ────────────────────────────────────────────────────────────────
function DoorMesh({ sessionId, onReady }: { sessionId: string; onReady: () => void }) {
  const { scene } = useGLTF(SESSION_STYLE[sessionId].model);
  const ref    = useRef<THREE.Group>(null!);
  const scaled = useRef(false);

  const cloned = React.useMemo(() => {
    const c = scene.clone(true);
    c.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(m => {
          const mat = m as THREE.MeshStandardMaterial;
          mat.side = THREE.FrontSide;
          // Boost material responsiveness so lights actually show up on dark models
          mat.roughness  = Math.min(mat.roughness,  0.72);
          mat.metalness  = Math.max(mat.metalness,  0.10);
          mat.needsUpdate = true;
        });
      }
    });
    return c;
  }, [scene]);

  useEffect(() => {
    if (!ref.current || scaled.current) return;
    scaled.current = true;
    normaliseModel(ref.current);
    onReady();
  }, [cloned, onReady]);

  return <group ref={ref}><primitive object={cloned} /></group>;
}

// ─── Pulsing placeholder ──────────────────────────────────────────────────────
function Placeholder({ color }: { color: string }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2.5) * 0.15;
  });
  const col = new THREE.Color(color);
  return (
    <mesh>
      <boxGeometry args={[1.1, 2.5, 0.1]} />
      <meshStandardMaterial ref={matRef} color={col} emissive={col} emissiveIntensity={0.3}
        roughness={0.15} metalness={0.85} transparent opacity={0.55} />
    </mesh>
  );
}

// ─── Per-session lighting rig — intensities tuned per door ────────────────────
function LightRig({ sessionId }: { sessionId: string }) {
  const s = SESSION_STYLE[sessionId];
  const key  = new THREE.Color(s.keyColor);
  const fill = new THREE.Color(s.fillColor);
  const rim  = new THREE.Color(s.rimColor);
  return (
    <>
      {/* Higher ambient so dark-textured doors are never muddy */}
      <ambientLight intensity={s.ambientIntensity} />
      {/* Key — front-top-left, very bright white-tinted */}
      <pointLight position={[-2, 4, 4.5]}  intensity={s.keyIntensity}  color={key}      distance={16} decay={2} />
      {/* Front centre fill — main reason textures read clearly */}
      <pointLight position={[0,  0, 6]}    intensity={s.keyIntensity * 0.55} color={"#ffffff"} distance={10} decay={2} />
      {/* Accent fill — right side, session colour */}
      <pointLight position={[3.5, 1, 3.5]} intensity={s.fillIntensity} color={fill}     distance={12} decay={2} />
      {/* Rim — backlight glow, gives silhouette depth */}
      <pointLight position={[0, 3, -4.5]}  intensity={s.fillIntensity * 0.7} color={rim} distance={12} decay={2} />
      {/* Under bounce */}
      <pointLight position={[0, -2.5, 3]}  intensity={s.fillIntensity * 0.5} color={fill} distance={8} decay={2} />
    </>
  );
}

// ─── Orbit controller — pointer drag on canvas, never intercepts scroll ───────
function OrbitController({
  dragOrbit,
  autoRotRef,
}: {
  dragOrbit: React.MutableRefObject<{ x: number; y: number }>;
  autoRotRef: React.MutableRefObject<boolean>;
}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false;
    let lastX = 0, lastY = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      autoRotRef.current = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragOrbit.current.x += dy * 0.008;
      dragOrbit.current.y += dx * 0.008;
      dragOrbit.current.x = Math.max(-0.9, Math.min(0.9, dragOrbit.current.x));
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      resumeTimer = setTimeout(() => { autoRotRef.current = true; }, 1500);
    };

    canvas.addEventListener("pointerdown",   onDown);
    canvas.addEventListener("pointermove",   onMove);
    canvas.addEventListener("pointerup",     onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown",   onDown);
      canvas.removeEventListener("pointermove",   onMove);
      canvas.removeEventListener("pointerup",     onUp);
      canvas.removeEventListener("pointercancel", onUp);
      if (resumeTimer) clearTimeout(resumeTimer);
    };
  }, [gl, dragOrbit, autoRotRef]);

  return null;
}

// ─── The persistent 3D scene ──────────────────────────────────────────────────
function DoorScene({
  sessionId,
  openTrigger,
  onOpenComplete,
}: {
  sessionId: string;
  openTrigger: number;
  onOpenComplete: () => void;
}) {
  const style    = SESSION_STYLE[sessionId];
  const outerRef = useRef<THREE.Group>(null!);
  const floatRef = useRef<THREE.Group>(null!);
  const pivotRef = useRef<THREE.Group>(null!);
  const [loaded, setLoaded] = useState(false);

  // Use refs for all "gate" state so useEffect never closes over stale values
  const readyRef    = useRef(false);
  const isOpen      = useRef(false);
  const autoRot     = useRef(true);
  // Separate drag orbit from auto-rotation so they don't fight each other
  const dragOrbit   = useRef({ x: 0, y: 0 });   // set by pointer drag
  const autoAngle   = useRef(0);                   // incremented each frame
  const onCompleteRef = useRef(onOpenComplete);
  const prevId      = useRef(sessionId);

  // Keep callback ref fresh every render — no stale closure
  useEffect(() => { onCompleteRef.current = onOpenComplete; }, [onOpenComplete]);

  // Door swap — full reset
  useEffect(() => {
    if (prevId.current === sessionId) return;
    prevId.current = sessionId;
    setLoaded(false);
    readyRef.current = false;
    autoRot.current  = true;
    isOpen.current   = false;
    dragOrbit.current = { x: 0, y: 0 };
    autoAngle.current = 0;
    if (pivotRef.current) gsap.set(pivotRef.current.rotation, { y: 0 });
    if (outerRef.current) gsap.set(outerRef.current.rotation, { x: 0, y: 0 });
  }, [sessionId]);

  // Swing open — fires every time openTrigger increments
  useEffect(() => {
    if (openTrigger === 0) return;
    if (isOpen.current) return;
    if (!pivotRef.current) return;
    // If model isn't ready yet, swing the placeholder (pivot is always mounted)
    isOpen.current  = true;
    autoRot.current = false;

    // Snap drag offset back to centre so user sees the swing cleanly
    dragOrbit.current = { x: 0, y: 0 };

    gsap.timeline()
      .to(pivotRef.current.rotation, { y: -Math.PI * 0.65, duration: 0.65, ease: "power3.out" })
      .call(() => { onCompleteRef.current(); })
      .to(pivotRef.current.rotation, {
        y: 0, duration: 0.9, ease: "power2.inOut", delay: 0.5,
        onComplete: () => { isOpen.current = false; autoRot.current = true; },
      });
  }, [openTrigger]);

  useFrame(({ clock }, delta) => {
    if (!outerRef.current || !floatRef.current) return;
    const t = clock.getElapsedTime();

    floatRef.current.position.y = Math.sin(t * 0.75) * 0.055;

    // Auto-rotation increments its own angle, never touches dragOrbit
    if (autoRot.current) autoAngle.current += delta * 0.18;

    // Target rotation = auto angle + drag offset
    const targetX = dragOrbit.current.x;
    const targetY = autoAngle.current + dragOrbit.current.y;

    outerRef.current.rotation.x += (targetX - outerRef.current.rotation.x) * 0.12;
    outerRef.current.rotation.y += (targetY - outerRef.current.rotation.y) * 0.12;
  });

  const onReady = useCallback(() => {
    readyRef.current = true;
    setLoaded(true);
  }, []);

  return (
    <>
      <LightRig sessionId={sessionId} />

      {/* Floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <circleGeometry args={[1.8, 48]} />
        <meshBasicMaterial color={new THREE.Color(style.accent)} transparent opacity={0.14} />
      </mesh>

      {/* Orbit wrapper → float wrapper → hinge pivot → mesh */}
      <group ref={outerRef}>
        <group ref={floatRef}>
          {/* Hinge: translate +0.55 so pivot is at left edge, then rotate */}
          <group position={[0.55, 0, 0]}>
            <group ref={pivotRef} position={[-0.55, 0, 0]}>
              {!loaded && <Placeholder color={style.accent} />}
              <Suspense fallback={null}>
                <DoorMesh sessionId={sessionId} onReady={onReady} />
              </Suspense>
            </group>
          </group>
        </group>
      </group>

      <OrbitController dragOrbit={dragOrbit} autoRotRef={autoRot} />
    </>
  );
}

// ─── Session Modal ────────────────────────────────────────────────────────────
const SessionModal = memo(function SessionModal({
  session, onClose, onBook,
}: { session: SessionTier; onClose: () => void; onBook: (s: SessionTier) => void }) {
  const style      = SESSION_STYLE[session.id] ?? SESSION_STYLE.solo;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 });
    gsap.fromTo(panelRef.current,   { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.5)" });
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.16 });
    gsap.to(panelRef.current,   { y: 30, opacity: 0, scale: 0.97, duration: 0.16, onComplete: onClose });
  }, [onClose]);

  return (
    <div ref={overlayRef} onClick={e => e.target === overlayRef.current && close()}
      style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div ref={panelRef} style={{
        width: "min(600px,100%)",
        background: "linear-gradient(160deg,#0e0a22,#08041a)",
        border: `1px solid ${style.accent}44`, borderTop: `3px solid ${style.accent}`,
        borderRadius: 20, overflow: "hidden", position: "relative",
        boxShadow: `0 0 80px ${style.accent}28, 0 32px 80px rgba(0,0,0,0.95)`,
      }}>
        {/* Header */}
        <div style={{ padding: "28px 28px 22px",
          background: `linear-gradient(135deg, ${style.accent}18 0%, transparent 55%)`,
          borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
          <button onClick={close} style={{
            position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
          }}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 38, filter: `drop-shadow(0 0 14px ${style.accent})`, flexShrink: 0 }}>{session.emoji}</span>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", color: style.accent, textTransform: "uppercase", marginBottom: 3, opacity: 0.85 }}>{session.mood}</p>
              <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(26px,5vw,40px)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>{session.name}</h2>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.55)", maxWidth: 450 }}>{session.vibe}</p>
        </div>

        <div style={{ padding: "22px 28px 28px" }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
            {[
              { label: "Duration", value: session.isCustom ? "Your call"  : session.duration },
              { label: "People",   value: session.isCustom ? "Any size"   : `Up to ${session.people}` },
              { label: "Vibe",     value: session.mood },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: "1 1 90px" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, fontWeight: 600, color: style.accent }}>{value}</p>
              </div>
            ))}
          </div>

          {!session.isCustom && session.equipment.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 10 }}>What&apos;s included</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                {session.equipment.map(eq => (
                  <div key={eq} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 3, height: 3, borderRadius: "50%", background: style.accent, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-barlow)", fontSize: 12, color: "rgba(255,255,255,0.58)" }}>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.isCustom && (
            <div style={{ marginBottom: 22, padding: "14px 16px", borderRadius: 12, background: `${style.accent}10`, border: `1px solid ${style.accent}28` }}>
              <p style={{ fontFamily: "var(--font-barlow)", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                Tell us exactly what you want — hookahs, people, duration, flavours, host, catering. Use the Package Wizard for a live price.
              </p>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 2 }}>Starting from</p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 30, color: style.accent, lineHeight: 1, letterSpacing: "0.04em" }}>
                {session.isCustom ? "Custom" : kes(session.price)}
              </p>
            </div>
            <button onClick={close} style={{
              fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "11px 16px", borderRadius: 10, minHeight: 44,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.32)", cursor: "pointer",
            }}>Back</button>
            <button onClick={() => { onBook(session); close(); }}
              style={{
                fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.08em",
                padding: "11px 24px", borderRadius: 10, minHeight: 44,
                border: `1px solid ${style.accent}`, background: `${style.accent}20`,
                color: style.accent, cursor: "pointer", transition: "background 0.18s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${style.accent}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${style.accent}20`; }}
            >
              {session.isCustom ? "Build Your Night →" : "Claim This Night →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Mobile card list ─────────────────────────────────────────────────────────
function MobileSessions({ onSelect }: { onSelect: (s: SessionTier) => void }) {
  return (
    <div style={{ padding: "16px 0 32px", display: "flex", flexDirection: "column", gap: 8 }}>
      {SESSIONS.map(s => {
        const style = SESSION_STYLE[s.id];
        return (
          <button key={s.id} onClick={() => onSelect(s)} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px", borderRadius: 14, textAlign: "left",
            border: `1px solid ${style.accent}30`, borderLeft: `3px solid ${style.accent}`,
            background: `${style.accent}0c`, cursor: "pointer", minHeight: 60, width: "100%",
          }}>
            <span style={{ fontSize: 26, filter: `drop-shadow(0 0 8px ${style.accent})`, flexShrink: 0 }}>{s.emoji}</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: "#fff", letterSpacing: "0.05em", lineHeight: 1, marginBottom: 2 }}>{s.name}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: style.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {s.isCustom ? "Custom" : kes(s.price)}
              </p>
            </div>
            <span style={{ color: style.accent, fontSize: 14, flexShrink: 0 }}>→</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Desktop split layout ─────────────────────────────────────────────────────
function DesktopSessions({ onBook }: { onBook: (s: SessionTier) => void }) {
  const [activeId,    setActiveId]   = useState("solo");
  const [openTrigger, setOpenTrigger] = useState(0);
  const [modal,       setModal]      = useState<SessionTier | null>(null);
  const canvasWrap  = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const fogRef      = useRef<HTMLDivElement>(null);

  const activeSession = SESSIONS.find(s => s.id === activeId)!;
  const activeStyle   = SESSION_STYLE[activeId];

  // Stagger preload remaining GLBs
  useEffect(() => {
    const ids = Object.keys(SESSION_STYLE).filter(id => id !== "solo");
    let i = 0;
    const next = () => {
      if (i < ids.length) { useGLTF.preload(SESSION_STYLE[ids[i]].model); i++; setTimeout(next, 700); }
    };
    const t = setTimeout(next, 1500);
    return () => clearTimeout(t);
  }, []);

  // Scroll jank kill
  useEffect(() => {
    const onScroll = () => {
      if (canvasWrap.current) canvasWrap.current.style.pointerEvents = "none";
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        if (canvasWrap.current) canvasWrap.current.style.pointerEvents = "auto";
      }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // CSS bg/fog transition on door change
  useEffect(() => {
    if (bgRef.current)  bgRef.current.style.background  = activeStyle.bg;
    if (fogRef.current) fogRef.current.style.background =
      `radial-gradient(ellipse 70% 40% at 50% 100%, ${activeStyle.accent}28 0%, transparent 70%)`;
  }, [activeId, activeStyle]);

  const handleCardClick = useCallback((session: SessionTier) => {
    if (session.id !== activeId) {
      setActiveId(session.id);
    } else {
      setOpenTrigger(t => t + 1);
    }
  }, [activeId]);

  const handleEnterButton = useCallback(() => {
    setOpenTrigger(t => t + 1);
  }, []);

  // Called by DoorScene AFTER swing animation plays
  const handleOpenComplete = useCallback(() => {
    setModal(activeSession);
  }, [activeSession]);

  return (
    <>
      <div style={{ display: "flex", width: "100%", minHeight: "86vh", position: "relative" }}>

        {/* ── Left: card list ────────────────────────────────────────── */}
        <div style={{
          width: "clamp(260px,32%,360px)", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 5,
          padding: "0 0 0 5vw", justifyContent: "center",
          position: "relative", zIndex: 2,
        }}>
          {SESSIONS.map((session, i) => {
            const style    = SESSION_STYLE[session.id];
            const isActive = session.id === activeId;
            return (
              <button key={session.id} onClick={() => handleCardClick(session)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: isActive ? "15px 18px" : "11px 16px",
                borderRadius: 13, textAlign: "left", width: "100%",
                border: isActive ? `1px solid ${style.accent}55` : "1px solid rgba(255,255,255,0.04)",
                borderLeft: `3px solid ${isActive ? style.accent : "rgba(255,255,255,0.05)"}`,
                background: isActive
                  ? `linear-gradient(110deg, ${style.accent}16 0%, ${style.accent}05 100%)`
                  : "rgba(255,255,255,0.015)",
                cursor: "pointer",
                transition: "padding 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s",
                boxShadow: isActive ? `0 0 20px ${style.accent}1a, inset 0 0 16px ${style.accent}08` : "none",
                transform: isActive ? "translateX(6px)" : "none",
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: isActive ? style.accent : "rgba(255,255,255,0.16)", letterSpacing: "0.1em", width: 16, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: isActive ? 24 : 20, filter: isActive ? `drop-shadow(0 0 8px ${style.accent})` : "none", flexShrink: 0, transition: "all 0.2s" }}>
                  {session.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--font-bebas)", fontSize: isActive ? 18 : 15,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    letterSpacing: "0.05em", lineHeight: 1, marginBottom: 2,
                    transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{session.name}</p>
                  <p style={{
                    fontFamily: "var(--font-mono)", fontSize: 8,
                    color: isActive ? style.accent : "rgba(255,255,255,0.18)",
                    letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s",
                  }}>{session.isCustom ? "Custom" : kes(session.price)}</p>
                </div>
                {isActive && <span style={{ color: style.accent, fontSize: 13, flexShrink: 0 }}>→</span>}
              </button>
            );
          })}
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.14)", textTransform: "uppercase",
            marginTop: 10, paddingLeft: 2,
          }}>
            Choose a door · step through · own the night
          </p>
        </div>

        {/* ── Right: door pane ──────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

          {/* BG — CSS, transitions on door switch */}
          <div ref={bgRef} style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: activeStyle.bg, transition: "background 0.55s ease",
          }} />

          {/* Floor fog */}
          <div ref={fogRef} style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `radial-gradient(ellipse 70% 40% at 50% 100%, ${activeStyle.accent}28 0%, transparent 70%)`,
            transition: "background 0.55s ease",
          }} />

          {/* Floating dust — CSS only */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{
                position: "absolute", width: 1 + (i % 2), height: 1 + (i % 2), borderRadius: "50%",
                background: activeStyle.accent, opacity: 0.07 + (i % 3) * 0.03,
                left: `${10 + (i * 8.7) % 78}%`, bottom: `${5 + (i * 11) % 65}%`,
                animation: `float-y ${7 + i * 0.6}s ease-in-out infinite ${i * 0.5}s`,
              }} />
            ))}
          </div>

          {/* Drag hint — fades after 3s */}
          <div style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 10, pointerEvents: "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.22)", textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              ⟳ drag to rotate
            </span>
          </div>

          {/* R3F — persistent, never remounts */}
          <div ref={canvasWrap} style={{ position: "absolute", inset: 0, zIndex: 2, cursor: "grab" }}>
            <Canvas
              camera={{ position: [0, 0, 5.2], fov: 50, near: 0.1, far: 50 }}
              dpr={[1, 1.4]}
              gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2, powerPreference: "high-performance" }}
              frameloop="always"
              style={{ background: "transparent" }}
            >
              <Suspense fallback={null}>
                <DoorScene
                  sessionId={activeId}
                  openTrigger={openTrigger}
                  onOpenComplete={handleOpenComplete}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Door info overlay — bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
            background: "linear-gradient(to top, rgba(5,3,10,0.97) 0%, rgba(5,3,10,0.55) 45%, transparent 100%)",
            padding: "56px 40px 32px", pointerEvents: "none",
          }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.26em",
              color: activeStyle.accent, textTransform: "uppercase", marginBottom: 5, opacity: 0.9,
              transition: "color 0.4s ease",
            }}>
              {activeSession.mood}&nbsp;·&nbsp;
              {activeSession.isCustom ? "Any size" : `${activeSession.duration} · ${activeSession.people} ${Number(activeSession.people) === 1 ? "person" : "people"}`}
            </p>
            <h3 style={{
              fontFamily: "var(--font-bebas)", fontSize: "clamp(34px,4vw,58px)",
              color: "#fff", letterSpacing: "0.04em", lineHeight: 0.95, marginBottom: 8,
            }}>
              {activeSession.name}
            </h3>
            <p style={{
              fontFamily: "var(--font-barlow)", fontSize: 13,
              color: "rgba(255,255,255,0.45)", maxWidth: 340, lineHeight: 1.5, marginBottom: 18,
            }}>
              {activeSession.tagline}
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "center", pointerEvents: "auto" }}>
              <span style={{
                fontFamily: "var(--font-bebas)", fontSize: 26, color: activeStyle.accent,
                letterSpacing: "0.06em", lineHeight: 1, transition: "color 0.4s ease",
              }}>
                {activeSession.isCustom ? "Custom" : kes(activeSession.price)}
              </span>
              <button onClick={handleEnterButton} style={{
                fontFamily: "var(--font-bebas)", fontSize: 15, letterSpacing: "0.1em",
                padding: "10px 22px", borderRadius: 10, minHeight: 44,
                border: `1px solid ${activeStyle.accent}`, background: `${activeStyle.accent}1e`,
                color: activeStyle.accent, cursor: "pointer", transition: "background 0.18s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${activeStyle.accent}40`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${activeStyle.accent}1e`; }}
              >
                {activeSession.isCustom ? "Build Your Night →" : "Open the Door →"}
              </button>
            </div>
          </div>

          {/* Edge vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none",
            background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, rgba(5,3,10,0.65) 100%)",
          }} />
        </div>
      </div>

      {/* Modal — mounts here, inside DesktopSessions, so state is in scope */}
      {modal && (
        <SessionModal
          session={modal}
          onClose={() => setModal(null)}
          onBook={s => { onBook(s); setModal(null); }}
        />
      )}
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function SessionsSection() {
  const isMobile = useIsMobile();
  const { setBookingOpen, addToCart } = useStore();
  const [mobileSelected, setMobileSelected] = useState<SessionTier | null>(null);
  const [mounted, setMounted] = useState(false);

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
    <section id="sessions" style={{ background: "var(--void)", position: "relative", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        position: "relative", zIndex: 20,
        padding: isMobile ? "clamp(40px,6vw,60px) 16px 20px" : "clamp(52px,7vw,80px) 5vw 32px",
        textAlign: isMobile ? "left" : "center",
      }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 10, opacity: 0.8 }}>
          Eight Doors. Eight Worlds.
        </p>
        <h2 style={{ fontFamily: "var(--font-bebas)", fontWeight: 400, fontSize: isMobile ? "clamp(44px,11vw,64px)" : "clamp(56px,7vw,96px)", lineHeight: 0.92, letterSpacing: "0.04em", color: "#fff", marginBottom: 12 }}>
          Every Night Deserves<br />
          <span style={{ color: "var(--violet)" }}>The Right Door.</span>
        </h2>
        <p style={{ fontFamily: "var(--font-barlow)", fontSize: isMobile ? 13 : "clamp(13px,1.6vw,16px)", color: "rgba(255,255,255,0.38)", maxWidth: 460, margin: isMobile ? "0" : "0 auto" }}>
          {isMobile
            ? "Behind every door is a world built for a different kind of night. Find yours."
            : "Behind every door is a different world — a different energy, a different crew, a different night. Choose yours and step through."}
        </p>
      </div>

      {/* Mobile */}
      {isMobile && (
        <div style={{ padding: "0 16px", position: "relative", zIndex: 10 }}>
          <MobileSessions onSelect={setMobileSelected} />
        </div>
      )}

      {/* Desktop */}
      {!isMobile && mounted && <DesktopSessions onBook={handleBook} />}

      {/* Mobile modal */}
      {isMobile && mobileSelected && (
        <SessionModal session={mobileSelected} onClose={() => setMobileSelected(null)} onBook={handleBook} />
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 5vw 48px", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "var(--font-serif, var(--font-grotesk))", fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,0.13)", letterSpacing: "0.06em" }}>
          Every door opens the same promise — premium setup, flawless service, and a night worth remembering.
        </p>
      </div>
    </section>
  );
}
