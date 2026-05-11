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
const SESSION_STYLE: Record<string, {
  model: string;
  accent: string;
  bg: string;
  keyColor: string;
  fillColor: string;
  rimColor: string;
}> = {
  solo:      { model: "/models/door_solo.glb",      accent: "#f59e0b", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #2a1800 0%, #0f0900 50%, #05030a 100%)", keyColor: "#ffe4a0", fillColor: "#f59e0b", rimColor: "#7c3aed" },
  duo:       { model: "/models/door_duo.glb",       accent: "#68d391", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #002a10 0%, #000f06 50%, #05030a 100%)", keyColor: "#c6f6d5", fillColor: "#68d391", rimColor: "#276749" },
  squad:     { model: "/models/door_squad.glb",     accent: "#22d3ee", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #002a30 0%, #000e14 50%, #05030a 100%)", keyColor: "#a5f3fc", fillColor: "#22d3ee", rimColor: "#7c3aed" },
  vip:       { model: "/models/door_vip.glb",       accent: "#f6c90e", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #2a2000 0%, #0f0c00 50%, #05030a 100%)", keyColor: "#fef08a", fillColor: "#f6c90e", rimColor: "#b7791f" },
  rooftop:   { model: "/models/door_rooftop.glb",   accent: "#b794f4", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #180a2a 0%, #080614 50%, #05030a 100%)", keyColor: "#e9d5ff", fillColor: "#b794f4", rimColor: "#553c9a" },
  corporate: { model: "/models/door_corporate.glb", accent: "#63b3ed", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #001828 0%, #000a14 50%, #05030a 100%)", keyColor: "#bfdbfe", fillColor: "#63b3ed", rimColor: "#1e40af" },
  wedding:   { model: "/models/door_wedding.glb",   accent: "#f687b3", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #280018 0%, #0f0009 50%, #05030a 100%)", keyColor: "#fce7f3", fillColor: "#f687b3", rimColor: "#b83280" },
  custom:    { model: "/models/door_custom.glb",    accent: "#ff6b35", bg: "radial-gradient(ellipse 140% 110% at 50% 90%, #280e00 0%, #0f0600 50%, #05030a 100%)", keyColor: "#fed7aa", fillColor: "#ff6b35", rimColor: "#7c3aed" },
};

// ─── Preload: first door immediately, rest staggered after mount ───────────────
useGLTF.preload(SESSION_STYLE["solo"].model);

// ─── Shared THREE objects (never recreated) ────────────────────────────────────
const _box    = new THREE.Box3();
const _size   = new THREE.Vector3();
const _center = new THREE.Vector3();

// ─── Auto-scale a group to targetHeight, centred at origin ────────────────────
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

// ─── Single door mesh — loaded once, never remounted ─────────────────────────
// The parent group handles rotation/position so we never unmount this.
function DoorMesh({
  sessionId,
  onReady,
}: {
  sessionId: string;
  onReady: () => void;
}) {
  const style  = SESSION_STYLE[sessionId];
  const { scene } = useGLTF(style.model);
  const ref    = useRef<THREE.Group>(null!);
  const scaled = useRef(false);

  const cloned = React.useMemo(() => {
    const c = scene.clone(true);
    // Traverse and make sure all materials are double-sided for consistent lighting
    c.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(m => { (m as THREE.MeshStandardMaterial).side = THREE.FrontSide; });
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

// ─── Pulsing placeholder shown while GLB loads ────────────────────────────────
function Placeholder({ color }: { color: string }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2.5) * 0.15;
    }
  });
  const col = new THREE.Color(color);
  return (
    <mesh>
      <boxGeometry args={[1.1, 2.5, 0.1]} />
      <meshStandardMaterial
        ref={matRef}
        color={col}
        emissive={col}
        emissiveIntensity={0.3}
        roughness={0.15}
        metalness={0.85}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

// ─── Lighting rig — no Environment HDR (expensive), pure point lights ─────────
function LightRig({ sessionId }: { sessionId: string }) {
  const style = SESSION_STYLE[sessionId];
  const key   = new THREE.Color(style.keyColor);
  const fill  = new THREE.Color(style.fillColor);
  const rim   = new THREE.Color(style.rimColor);
  // Refs so we lerp intensity without re-rendering
  const k = useRef<THREE.PointLight>(null!);
  const f = useRef<THREE.PointLight>(null!);
  const r = useRef<THREE.PointLight>(null!);

  return (
    <>
      <ambientLight intensity={0.5} />
      {/* Key — warm, top-left */}
      <pointLight ref={k} position={[-2.5, 4.5, 3.5]} intensity={35} color={key}  distance={14} />
      {/* Fill — accent, right */}
      <pointLight ref={f} position={[3.5,  1.5, 3.5]} intensity={28} color={fill} distance={12} />
      {/* Rim — coloured backlight */}
      <pointLight ref={r} position={[0,    2.5, -4]}   intensity={22} color={rim}  distance={12} />
      {/* Under — floor bounce */}
      <pointLight position={[0, -2, 2.5]}  intensity={14} color={fill} distance={8} />
      {/* Front fill — always reads the texture */}
      <pointLight position={[0,  1, 7]}    intensity={10} color="#ffffff" distance={9} />
    </>
  );
}

// ─── The persistent 3D scene — never remounts, just swaps sessionId ───────────
function DoorScene({
  sessionId,
  openTrigger,
  onOpenComplete,
}: {
  sessionId: string;
  openTrigger: number;
  onOpenComplete: () => void;
}) {
  const style      = SESSION_STYLE[sessionId];
  const pivotRef   = useRef<THREE.Group>(null!); // hinge pivot (left edge of door)
  const groupRef   = useRef<THREE.Group>(null!); // translation group
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const autoRot    = useRef(true);
  const isOpen     = useRef(false);
  const prevId     = useRef(sessionId);

  // When sessionId changes: fade out → swap → fade in
  useEffect(() => {
    if (!groupRef.current) return;
    if (prevId.current === sessionId) return;
    prevId.current = sessionId;
    setLoaded(false);
    setReady(false);
    autoRot.current = true;
    isOpen.current  = false;
    // Reset rotation
    if (pivotRef.current) gsap.set(pivotRef.current.rotation, { y: 0 });
    gsap.fromTo(groupRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
  }, [sessionId]);

  // Swing open when triggered
  useEffect(() => {
    if (openTrigger === 0 || !ready || !pivotRef.current) return;
    if (isOpen.current) return;
    isOpen.current  = true;
    autoRot.current = false;

    gsap.timeline()
      .to(pivotRef.current.rotation, {
        y: -Math.PI * 0.62,
        duration: 0.7,
        ease: "power3.out",
      })
      .call(() => onOpenComplete())
      .to(pivotRef.current.rotation, {
        y: 0,
        duration: 0.85,
        ease: "power2.inOut",
        delay: 0.6,
        onComplete: () => {
          isOpen.current  = false;
          autoRot.current = true;
        },
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTrigger]);

  // Slow auto-rotation + subtle float via useFrame (one RAF, no Float component)
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle float
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.06;
    // Slow Y rotation only when not swinging
    if (autoRot.current && pivotRef.current) {
      pivotRef.current.rotation.y += delta * 0.18;
    }
  });

  const onReady = useCallback(() => {
    setReady(true);
    setLoaded(true);
  }, []);

  return (
    <>
      <LightRig sessionId={sessionId} />

      {/* Floor glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <circleGeometry args={[1.6, 48]} />
        <meshBasicMaterial color={new THREE.Color(style.accent)} transparent opacity={0.12} />
      </mesh>

      {/* Translation group (float) → pivot group (hinge) → mesh */}
      <group ref={groupRef}>
        {/* Pivot offset: move hinge point to left edge of door (~0.55 units) */}
        <group position={[0.55, 0, 0]}>
          <group ref={pivotRef} position={[-0.55, 0, 0]}>
            {!loaded && <Placeholder color={style.accent} />}
            <Suspense fallback={null}>
              <DoorMesh sessionId={sessionId} onReady={onReady} />
            </Suspense>
          </group>
        </group>
      </group>
    </>
  );
}

// ─── Camera subtle mouse drift — capped to avoid seasickness ─────────────────
function CameraRig({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.4 - camera.position.x) * 0.035;
    camera.position.y += (-mouse.current.y * 0.25 + 0.1 - camera.position.y) * 0.035;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Session Modal — slides up from bottom ─────────────────────────────────────
const SessionModal = memo(function SessionModal({
  session,
  onClose,
  onBook,
}: {
  session: SessionTier;
  onClose: () => void;
  onBook: (s: SessionTier) => void;
}) {
  const style      = SESSION_STYLE[session.id] ?? SESSION_STYLE.solo;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
    gsap.fromTo(panelRef.current,   { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.5)" });
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.16 });
    gsap.to(panelRef.current,   { y: 30, opacity: 0, scale: 0.97, duration: 0.16, onComplete: onClose });
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && close()}
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(0,0,0,0.86)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, overflowY: "auto",
      }}
    >
      <div ref={panelRef} style={{
        width: "min(600px,100%)",
        background: "linear-gradient(160deg,#0e0a22,#08041a)",
        border: `1px solid ${style.accent}44`,
        borderTop: `3px solid ${style.accent}`,
        borderRadius: 20, overflow: "hidden", position: "relative",
        boxShadow: `0 0 80px ${style.accent}28, 0 32px 80px rgba(0,0,0,0.95)`,
      }}>
        {/* Coloured header gradient */}
        <div style={{
          padding: "28px 28px 22px",
          background: `linear-gradient(135deg, ${style.accent}18 0%, transparent 55%)`,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}>
          <button onClick={close} style={{
            position: "absolute", top: 14, right: 14,
            width: 40, height: 40, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}>×</button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 38, filter: `drop-shadow(0 0 14px ${style.accent})`, flexShrink: 0 }}>{session.emoji}</span>
            <div>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em",
                color: style.accent, textTransform: "uppercase", marginBottom: 3, opacity: 0.85,
              }}>{session.mood}</p>
              <h2 style={{
                fontFamily: "var(--font-bebas)", fontSize: "clamp(26px,5vw,40px)",
                color: "#fff", letterSpacing: "0.04em", lineHeight: 1,
              }}>{session.name}</h2>
            </div>
          </div>
          <p style={{
            fontFamily: "var(--font-barlow)", fontSize: 14, lineHeight: 1.65,
            color: "rgba(255,255,255,0.55)", maxWidth: 450,
          }}>{session.vibe}</p>
        </div>

        <div style={{ padding: "22px 28px 28px" }}>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
            {[
              { label: "Duration", value: session.isCustom ? "Your call"  : session.duration },
              { label: "People",   value: session.isCustom ? "Any size"   : `Up to ${session.people}` },
              { label: "Vibe",     value: session.mood },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: "1 1 90px" }}>
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 4,
                }}>{label}</p>
                <p style={{
                  fontFamily: "var(--font-barlow)", fontSize: 14, fontWeight: 600, color: style.accent,
                }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Equipment */}
          {!session.isCustom && session.equipment.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 10,
              }}>What&apos;s included</p>
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

          {/* Custom blurb */}
          {session.isCustom && (
            <div style={{
              marginBottom: 22, padding: "14px 16px", borderRadius: 12,
              background: `${style.accent}10`, border: `1px solid ${style.accent}28`,
            }}>
              <p style={{ fontFamily: "var(--font-barlow)", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                Tell us exactly what you want — hookahs, people, duration, flavours, host, catering. Use the Package Wizard for a live price.
              </p>
            </div>
          )}

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 2,
              }}>Starting from</p>
              <p style={{
                fontFamily: "var(--font-bebas)", fontSize: 30, color: style.accent,
                lineHeight: 1, letterSpacing: "0.04em",
              }}>
                {session.isCustom ? "Custom" : kes(session.price)}
              </p>
            </div>
            <button onClick={close} style={{
              fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "11px 16px", borderRadius: 10, minHeight: 44,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.32)", cursor: "pointer",
            }}>Back</button>
            <button
              onClick={() => { onBook(session); close(); }}
              style={{
                fontFamily: "var(--font-bebas)", fontSize: 16, letterSpacing: "0.08em",
                padding: "11px 24px", borderRadius: 10, minHeight: 44,
                border: `1px solid ${style.accent}`,
                background: `${style.accent}20`,
                color: style.accent, cursor: "pointer",
                transition: "background 0.18s",
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
            border: `1px solid ${style.accent}30`,
            borderLeft: `3px solid ${style.accent}`,
            background: `${style.accent}0c`,
            cursor: "pointer", minHeight: 60, width: "100%",
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
function DesktopSessions({ onSelect }: { onSelect: (s: SessionTier) => void }) {
  const [activeId,     setActiveId]     = useState("solo");
  const [openTrigger,  setOpenTrigger]  = useState(0);
  const [selected,     setSelectedState] = useState<SessionTier | null>(null);
  const mouseRef    = useRef({ x: 0, y: 0 });
  const canvasWrap  = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const fogRef      = useRef<HTMLDivElement>(null);

  const activeSession = SESSIONS.find(s => s.id === activeId)!;
  const activeStyle   = SESSION_STYLE[activeId];

  // Stagger-preload remaining GLBs after mount (800ms apart, starts after 1.5s)
  useEffect(() => {
    const ids = Object.keys(SESSION_STYLE).filter(id => id !== "solo");
    let i = 0;
    const next = () => {
      if (i < ids.length) {
        useGLTF.preload(SESSION_STYLE[ids[i]].model);
        i++;
        setTimeout(next, 700);
      }
    };
    const t = setTimeout(next, 1500);
    return () => clearTimeout(t);
  }, []);

  // Mouse tracking for canvas parallax
  useEffect(() => {
    const el = canvasWrap.current;
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

  // Disable canvas pointer-events during page scroll → kills WebGL scroll jank
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

  // Transition bg + fog when door changes — pure CSS, no canvas involvement
  useEffect(() => {
    if (bgRef.current)  bgRef.current.style.background  = activeStyle.bg;
    if (fogRef.current) fogRef.current.style.background = `radial-gradient(ellipse 65% 35% at 50% 100%, ${activeStyle.accent}20 0%, transparent 70%)`;
  }, [activeId, activeStyle]);

  const handleCardClick = useCallback((session: SessionTier) => {
    if (session.id !== activeId) {
      setActiveId(session.id);
    } else {
      // Same door clicked — swing and open modal
      setOpenTrigger(t => t + 1);
    }
  }, [activeId]);

  const handleEnterButton = useCallback(() => {
    setOpenTrigger(t => t + 1);
  }, []);

  const handleOpenComplete = useCallback(() => {
    setSelectedState(activeSession);
  }, [activeSession]);

  return (
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
            <button
              key={session.id}
              onClick={() => handleCardClick(session)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: isActive ? "15px 18px" : "11px 16px",
                borderRadius: 13, textAlign: "left", width: "100%",
                border: isActive
                  ? `1px solid ${style.accent}55`
                  : "1px solid rgba(255,255,255,0.04)",
                borderLeft: `3px solid ${isActive ? style.accent : "rgba(255,255,255,0.05)"}`,
                background: isActive
                  ? `linear-gradient(110deg, ${style.accent}16 0%, ${style.accent}05 100%)`
                  : "rgba(255,255,255,0.015)",
                cursor: "pointer",
                transition: "padding 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                boxShadow: isActive ? `0 0 20px ${style.accent}1a, inset 0 0 16px ${style.accent}08` : "none",
                transform: isActive ? "translateX(6px)" : "none",
              }}
            >
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

      {/* ── Right: door pane ─────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* Coloured bg — CSS only, transitions smoothly */}
        <div
          ref={bgRef}
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: activeStyle.bg,
            transition: "background 0.55s ease",
          }}
        />

        {/* Floor fog glow */}
        <div
          ref={fogRef}
          style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `radial-gradient(ellipse 65% 35% at 50% 100%, ${activeStyle.accent}20 0%, transparent 70%)`,
            transition: "background 0.55s ease",
          }}
        />

        {/* Floating dust particles — CSS only */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 1 + (i % 2),
              height: 1 + (i % 2),
              borderRadius: "50%",
              background: activeStyle.accent,
              opacity: 0.08 + (i % 3) * 0.04,
              left: `${10 + (i * 8.7) % 78}%`,
              bottom: `${5 + (i * 11) % 65}%`,
              animation: `float-y ${7 + i * 0.6}s ease-in-out infinite ${i * 0.5}s`,
            }} />
          ))}
        </div>

        {/* R3F canvas — persistent, never remounts */}
        <div ref={canvasWrap} style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <Canvas
            camera={{ position: [0, 0, 5.2], fov: 50, near: 0.1, far: 50 }}
            dpr={[1, 1.4]}
            gl={{
              alpha: true,
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
              powerPreference: "high-performance",
            }}
            frameloop="always"
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <CameraRig mouse={mouseRef} />
              <DoorScene
                sessionId={activeId}
                openTrigger={openTrigger}
                onOpenComplete={handleOpenComplete}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Door info overlay at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
          background: "linear-gradient(to top, rgba(5,3,10,0.97) 0%, rgba(5,3,10,0.55) 45%, transparent 100%)",
          padding: "56px 40px 32px",
          pointerEvents: "none",
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
            <button
              onClick={handleEnterButton}
              style={{
                fontFamily: "var(--font-bebas)", fontSize: 15, letterSpacing: "0.1em",
                padding: "10px 22px", borderRadius: 10, minHeight: 44,
                border: `1px solid ${activeStyle.accent}`,
                background: `${activeStyle.accent}1e`,
                color: activeStyle.accent, cursor: "pointer",
                transition: "background 0.18s ease",
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

      {/* Modal renders above everything */}
      {selected && (
        <SessionModal
          session={selected}
          onClose={() => setSelectedState(null)}
          onBook={onSelect}
        />
      )}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function SessionsSection() {
  const isMobile = useIsMobile();
  const { setBookingOpen, addToCart } = useStore();
  const [selected, setSelected] = useState<SessionTier | null>(null);
  const [mounted,  setMounted]  = useState(false);

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
        padding: isMobile
          ? "clamp(40px,6vw,60px) 16px 20px"
          : "clamp(52px,7vw,80px) 5vw 32px",
        textAlign: isMobile ? "left" : "center",
      }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em",
          color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 10, opacity: 0.8,
        }}>
          Eight Doors. Eight Worlds.
        </p>
        <h2 style={{
          fontFamily: "var(--font-bebas)", fontWeight: 400,
          fontSize: isMobile ? "clamp(44px,11vw,64px)" : "clamp(56px,7vw,96px)",
          lineHeight: 0.92, letterSpacing: "0.04em", color: "#fff", marginBottom: 12,
        }}>
          Every Night Deserves<br />
          <span style={{ color: "var(--violet)" }}>The Right Door.</span>
        </h2>
        <p style={{
          fontFamily: "var(--font-barlow)",
          fontSize: isMobile ? 13 : "clamp(13px,1.6vw,16px)",
          color: "rgba(255,255,255,0.38)",
          maxWidth: 460, margin: isMobile ? "0" : "0 auto",
        }}>
          {isMobile
            ? "Behind every door is a world built for a different kind of night. Find yours."
            : "Behind every door is a different world — a different energy, a different crew, a different night. Choose yours and step through."}
        </p>
      </div>

      {/* Mobile */}
      {isMobile && (
        <div style={{ padding: "0 16px", position: "relative", zIndex: 10 }}>
          <MobileSessions onSelect={setSelected} />
        </div>
      )}

      {/* Desktop */}
      {!isMobile && mounted && <DesktopSessions onSelect={handleBook} />}

      {/* Mobile modal */}
      {isMobile && selected && (
        <SessionModal session={selected} onClose={() => setSelected(null)} onBook={handleBook} />
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "24px 5vw 48px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        position: "relative", zIndex: 1,
      }}>
        <p style={{
          fontFamily: "var(--font-serif, var(--font-grotesk))", fontStyle: "italic",
          fontSize: 12, color: "rgba(255,255,255,0.13)", letterSpacing: "0.06em",
        }}>
          Every door opens the same promise — premium setup, flawless service, and a night worth remembering.
        </p>
      </div>
    </section>
  );
}
