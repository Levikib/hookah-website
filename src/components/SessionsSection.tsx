"use client";
import React, {
  useRef, useEffect, useState, useCallback, memo, Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Float } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import { SESSIONS, type SessionTier } from "@/data/sessions";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

// ─── Door metadata ────────────────────────────────────────────────────────────
const DOOR_META: Record<string, {
  lightColor: string;
  glowColor: string;
  model: string;
  ambientText: string;
  floorGlow: string;
}> = {
  solo:      { lightColor: "#f59e0b", glowColor: "#f59e0b", model: "/models/door_solo.glb",      ambientText: "single · still",    floorGlow: "rgba(245,158,11,0.35)" },
  duo:       { lightColor: "#68d391", glowColor: "#68d391", model: "/models/door_duo.glb",       ambientText: "close · quiet",     floorGlow: "rgba(104,211,145,0.35)" },
  squad:     { lightColor: "#22d3ee", glowColor: "#22d3ee", model: "/models/door_squad.glb",     ambientText: "loud · alive",      floorGlow: "rgba(34,211,238,0.35)" },
  vip:       { lightColor: "#f6c90e", glowColor: "#f6c90e", model: "/models/door_vip.glb",       ambientText: "gold · hushed",     floorGlow: "rgba(246,201,14,0.35)" },
  rooftop:   { lightColor: "#b794f4", glowColor: "#b794f4", model: "/models/door_rooftop.glb",   ambientText: "open · infinite",   floorGlow: "rgba(183,148,244,0.35)" },
  corporate: { lightColor: "#63b3ed", glowColor: "#63b3ed", model: "/models/door_corporate.glb", ambientText: "sharp · wired",     floorGlow: "rgba(99,179,237,0.35)" },
  wedding:   { lightColor: "#f687b3", glowColor: "#f687b3", model: "/models/door_wedding.glb",   ambientText: "forever · full",    floorGlow: "rgba(246,135,179,0.35)" },
  custom:    { lightColor: "#ff6b35", glowColor: "#ff6b35", model: "/models/door_custom.glb",    ambientText: "anything · yours",  floorGlow: "rgba(255,107,53,0.35)" },
};

// Layout: 4 doors per row, 2 rows
// Row 1 (back): solo, duo, squad, vip   — z = -3
// Row 2 (front): rooftop, corporate, wedding, custom — z = 0
const DOOR_POSITIONS: Record<string, [number, number, number]> = {
  solo:      [-5.25, 0, -3],
  duo:       [-1.75, 0, -3],
  squad:     [ 1.75, 0, -3],
  vip:       [ 5.25, 0, -3],
  rooftop:   [-5.25, 0,  0],
  corporate: [-1.75, 0,  0],
  wedding:   [ 1.75, 0,  0],
  custom:    [ 5.25, 0,  0],
};

// ─── Session Modal ────────────────────────────────────────────────────────────
const SessionModal = memo(function SessionModal({
  session, onClose, onBook,
}: { session: SessionTier; onClose: () => void; onBook: (s: SessionTier) => void }) {
  const meta = DOOR_META[session.id] ?? DOOR_META.solo;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(panelRef.current, { y: 60, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" });
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(panelRef.current, { y: 40, opacity: 0, scale: 0.95, duration: 0.2, onComplete: onClose });
  }, [onClose]);

  return (
    <div ref={overlayRef} onClick={e => e.target === overlayRef.current && close()}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div ref={panelRef} style={{
        width: "min(640px,100%)", background: "linear-gradient(160deg,#0d0920,#08041a)",
        border: `1px solid ${meta.lightColor}44`, borderTop: `3px solid ${meta.lightColor}`,
        borderRadius: 20, overflow: "hidden", position: "relative",
        boxShadow: `0 0 80px ${meta.lightColor}33, 0 40px 100px rgba(0,0,0,0.9)`,
      }}>
        <div style={{
          padding: "32px 28px 24px",
          background: `linear-gradient(135deg, ${meta.lightColor}18 0%, transparent 60%)`,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <button onClick={close} style={{
            position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 42, filter: `drop-shadow(0 0 12px ${meta.lightColor})` }}>{session.emoji}</span>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", color: meta.lightColor, textTransform: "uppercase", marginBottom: 4, opacity: 0.8 }}>{meta.ambientText}</p>
              <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,5vw,44px)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>{session.name}</h2>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-barlow)", fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.62)", maxWidth: 480 }}>{session.vibe}</p>
        </div>
        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Duration", value: session.isCustom ? "Your call" : session.duration },
              { label: "People",   value: session.isCustom ? "Any" : String(session.people) },
              { label: "Mood",     value: session.mood },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: "1 1 100px" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-barlow)", fontSize: 15, fontWeight: 600, color: meta.lightColor }}>{value}</p>
              </div>
            ))}
          </div>
          {!session.isCustom && session.equipment.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 10 }}>What&apos;s included</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {session.equipment.map(eq => (
                  <div key={eq} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: meta.lightColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-barlow)", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {session.isCustom && (
            <div style={{ marginBottom: 24, padding: "14px 16px", borderRadius: 12, background: `${meta.lightColor}14`, border: `1px solid ${meta.lightColor}33` }}>
              <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                Tell us exactly what you want. Hookahs, people, duration, flavours, host, catering — we build it from scratch. Use the Package Wizard for a live price.
              </p>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 2 }}>Starting from</p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 34, color: meta.lightColor, lineHeight: 1, letterSpacing: "0.04em" }}>
                {session.isCustom ? "Custom" : kes(session.price)}
              </p>
            </div>
            <button onClick={close} style={{
              fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "12px 18px", borderRadius: 10, minHeight: 44,
              border: "1px solid rgba(255,255,255,0.12)", background: "transparent",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
            }}>Back</button>
            <button onClick={() => { onBook(session); close(); }} style={{
              fontFamily: "var(--font-bebas)", fontSize: 17, letterSpacing: "0.08em",
              padding: "12px 24px", borderRadius: 10, minHeight: 44,
              border: `1px solid ${meta.lightColor}`,
              background: `${meta.lightColor}22`,
              color: meta.lightColor, cursor: "pointer",
              transition: "all 0.2s ease",
            }}>
              {session.isCustom ? "Open Wizard →" : "Book This →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Single 3D Door ───────────────────────────────────────────────────────────
function Door3D({
  session,
  position,
  onEnter,
}: {
  session: SessionTier;
  position: [number, number, number];
  onEnter: (s: SessionTier) => void;
}) {
  const meta = DOOR_META[session.id];
  const { scene } = useGLTF(meta.model);
  const groupRef  = useRef<THREE.Group>(null!);
  const meshRef   = useRef<THREE.Group>(null!);
  const glowRef   = useRef<THREE.PointLight>(null!);
  const cloned    = React.useMemo(() => scene.clone(true), [scene]);

  const hovered   = useRef(false);
  const swinging  = useRef(false);
  const swingDir  = useRef(1);

  // Normalise model scale to fit nicely in scene
  useEffect(() => {
    if (!meshRef.current) return;
    const box = new THREE.Box3().setFromObject(meshRef.current);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetH = 2.6;
    const s = targetH / maxDim;
    meshRef.current.scale.setScalar(s);
    // Centre at origin
    box.setFromObject(meshRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    meshRef.current.position.sub(center);
    meshRef.current.position.y += targetH / 2;
  }, [cloned]);

  useFrame((_, delta) => {
    if (!groupRef.current || !glowRef.current) return;

    // Hover: levitate
    const targetY = hovered.current ? position[1] + 0.18 : position[1];
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;

    // Glow pulse
    const targetIntensity = hovered.current ? 6 : 1.5;
    glowRef.current.intensity += (targetIntensity - glowRef.current.intensity) * 0.1;

    // Ambient slow rotation when not hovered
    if (!hovered.current && !swinging.current && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.18;
    }
  });

  const handleClick = useCallback(() => {
    if (swinging.current) return;
    swinging.current = true;
    hovered.current  = false;

    const dir = swingDir.current;
    gsap.timeline()
      .to(meshRef.current!.rotation, {
        y: dir * Math.PI * 0.55,
        duration: 0.55,
        ease: "power3.out",
      })
      .call(() => {
        onEnter(session);
      })
      .to(meshRef.current!.rotation, {
        y: 0,
        duration: 0.6,
        ease: "power2.inOut",
        delay: 0.3,
        onComplete: () => { swinging.current = false; swingDir.current *= -1; },
      });
  }, [onEnter, session]);

  const color = new THREE.Color(meta.lightColor);

  return (
    <group ref={groupRef} position={position}>
      {/* Coloured point light above door */}
      <pointLight
        ref={glowRef}
        position={[0, 2.2, 0.5]}
        intensity={1.5}
        distance={4}
        color={color}
      />
      {/* Subtle fill from below */}
      <pointLight
        position={[0, -1, 0.8]}
        intensity={hovered.current ? 2 : 0.6}
        distance={3}
        color={color}
      />

      {/* Door mesh */}
      <Float
        speed={1.2}
        rotationIntensity={0.08}
        floatIntensity={0.12}
        floatingRange={[-0.04, 0.04]}
      >
        <group
          ref={meshRef}
          onClick={handleClick}
          onPointerEnter={() => { hovered.current = true; document.body.style.cursor = "pointer"; }}
          onPointerLeave={() => { hovered.current = false; document.body.style.cursor = "default"; }}
        >
          <primitive object={cloned} />
        </group>
      </Float>

      {/* Floor glow pool under door */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.28, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>

      {/* Nameplate — always visible */}
      <group position={[0, -1.55, 0.1]}>
        {/* Name */}
        <mesh position={[0, 0.12, 0]}>
          <planeGeometry args={[1.6, 0.22]} />
          <meshBasicMaterial color="#08041a" transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Smoke particles in 3D space ──────────────────────────────────────────────
function RoomSmoke() {
  const ref = useRef<THREE.Points>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);

  const geo = React.useMemo(() => {
    const N = 300;
    const pos = new Float32Array(N * 3);
    const life = new Float32Array(N);
    const spd  = new Float32Array(N);
    const sz   = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 14;
      pos[i*3+1] = Math.random() * -1.5;
      pos[i*3+2] = (Math.random() - 0.5) * 6;
      life[i] = Math.random();
      spd[i]  = 0.04 + Math.random() * 0.06;
      sz[i]   = 0.08 + Math.random() * 0.18;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aLife",    new THREE.BufferAttribute(life, 1));
    g.setAttribute("aSpeed",   new THREE.BufferAttribute(spd, 1));
    g.setAttribute("aSize",    new THREE.BufferAttribute(sz, 1));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points ref={ref} geometry={geo}>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`
          uniform float uTime;
          attribute float aLife;
          attribute float aSpeed;
          attribute float aSize;
          varying float vAlpha;
          void main() {
            float t = mod(uTime * aSpeed + aLife, 1.0);
            vec3 pos = position;
            pos.y += t * 2.5;
            pos.x += sin(t * 3.0 + aLife * 6.28) * 0.3 * t;
            vAlpha = smoothstep(0.0,0.1,t) * (1.0 - smoothstep(0.6,1.0,t)) * 0.25;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * (300.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float disc = 1.0 - smoothstep(0.4, 1.0, d);
            if (disc < 0.01) discard;
            gl_FragColor = vec4(vec3(0.7, 0.7, 0.85), disc * vAlpha);
          }
        `}
      />
    </points>
  );
}

// ─── Neon floor grid ──────────────────────────────────────────────────────────
function FloorGrid() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime();
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.32, 0]}>
      <planeGeometry args={[22, 10, 44, 20]} />
      <shaderMaterial
        transparent
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 grid = abs(fract(vUv * vec2(22.0, 10.0)) - 0.5);
            float line = min(grid.x, grid.y);
            float g = 1.0 - smoothstep(0.0, 0.04, line);
            float pulse = 0.4 + 0.15 * sin(uTime * 0.8);
            float fade = (1.0 - length(vUv - 0.5) * 1.6);
            gl_FragColor = vec4(0.13, 0.82, 0.94, g * pulse * max(0.0, fade));
          }
        `}
      />
    </mesh>
  );
}

// ─── Camera parallax on mouse ─────────────────────────────────────────────────
function CameraRig({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.current.y * 0.6 + 1.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0.5, -1.5);
  });
  return null;
}

// ─── Full 3D scene ────────────────────────────────────────────────────────────
function SmokeRoomScene({
  onEnter,
  mouse,
}: {
  onEnter: (s: SessionTier) => void;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <>
      <CameraRig mouse={mouse} />

      {/* Environment */}
      <Environment preset="night" />
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 6, 0]} intensity={3} color="#7c3aed" distance={12} />
      <pointLight position={[-8, 3, -4]} intensity={2} color="#06b6d4" distance={10} />
      <pointLight position={[8, 3, -4]}  intensity={2} color="#7c3aed" distance={10} />

      {/* Floor */}
      <FloorGrid />

      {/* Smoke */}
      <RoomSmoke />

      {/* Fog plane at floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.28, 0]}>
        <planeGeometry args={[22, 10]} />
        <meshBasicMaterial color="#06031a" transparent opacity={0.55} />
      </mesh>

      {/* 8 doors */}
      {SESSIONS.map(session => (
        <Door3D
          key={session.id}
          session={session}
          position={DOOR_POSITIONS[session.id] as [number,number,number]}
          onEnter={onEnter}
        />
      ))}
    </>
  );
}

// ─── Mobile list ──────────────────────────────────────────────────────────────
function MobileSessions({ onSelect }: { onSelect: (s: SessionTier) => void }) {
  return (
    <div style={{ padding: "16px 0 32px" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14, textAlign: "center" }}>
        {SESSIONS.length} session tiers · tap to explore
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SESSIONS.map(s => {
          const meta = DOOR_META[s.id];
          return (
            <button key={s.id} onClick={() => onSelect(s)} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1px solid ${meta.lightColor}33`,
              borderLeft: `3px solid ${meta.lightColor}`,
              background: `${meta.lightColor}0d`,
              cursor: "pointer", minHeight: 60, width: "100%",
            }}>
              <span style={{ fontSize: 28, filter: `drop-shadow(0 0 8px ${meta.lightColor})` }}>{s.emoji}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: "#fff", letterSpacing: "0.05em", lineHeight: 1, marginBottom: 2 }}>{s.name}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: meta.lightColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.isCustom ? "Custom" : kes(s.price)}</p>
              </div>
              <span style={{ color: meta.lightColor, fontSize: 16 }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── HTML door labels overlay ─────────────────────────────────────────────────
// Positioned absolutely over the canvas using CSS — avoids THREE.js text complexity
function DoorLabels({ sessions }: { sessions: SessionTier[] }) {
  // 4 columns × 2 rows grid matching the 3D layout
  const cols = [0, 1, 2, 3];
  const rows = [
    sessions.slice(0, 4),
    sessions.slice(4, 8),
  ];

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
      display: "flex", flexDirection: "column", justifyContent: "space-around",
      padding: "12% 6% 8%",
    }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
          {row.map(s => {
            const meta = DOOR_META[s.id];
            return (
              <div key={s.id} style={{ textAlign: "center", width: "22%" }}>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(11px,1.2vw,16px)", letterSpacing: "0.06em", color: meta.lightColor, lineHeight: 1, marginBottom: 2 }}>
                  {s.name}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(7px,0.7vw,10px)", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
                  {s.isCustom ? "custom" : kes(s.price)}
                </p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SessionsSection() {
  const isMobile = useIsMobile();
  const { setBookingOpen, addToCart } = useStore();
  const [selected, setSelected]   = useState<SessionTier | null>(null);
  const [mounted, setMounted]     = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [isMobile]);

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
      ref={sectionRef}
      style={{ background: "var(--void)", position: "relative", overflow: "hidden", paddingBottom: isMobile ? 0 : "clamp(60px,8vw,100px)" }}
    >
      <style>{`
        @keyframes fog-drift {
          0%,100% { transform: translateX(0) scaleY(1); }
          50%      { transform: translateX(30px) scaleY(1.06); }
        }
      `}</style>

      {/* Header */}
      <div style={{ position: "relative", zIndex: 20, padding: isMobile ? "clamp(40px,6vw,60px) 16px 0" : "clamp(52px,7vw,88px) 5vw 0", pointerEvents: "none" }}>
        <div style={{ textAlign: isMobile ? "left" : "center" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 12, opacity: 0.8 }}>
            8 Ways to Session
          </p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontWeight: 400, fontSize: isMobile ? "clamp(44px,11vw,64px)" : "clamp(56px,7vw,100px)", lineHeight: 0.92, letterSpacing: "0.04em", color: "#fff", marginBottom: 12 }}>
            Pick Your <span style={{ color: "var(--violet)" }}>Vibe.</span>
          </h2>
          <p style={{ fontFamily: "var(--font-barlow)", fontSize: isMobile ? 13 : "clamp(13px,1.8vw,16px)", color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: isMobile ? "0" : "0 auto" }}>
            {isMobile ? "Tap a session to see what's inside." : "Eight doors. Eight worlds. Click a door to enter."}
          </p>
        </div>
      </div>

      {/* Mobile */}
      {isMobile && (
        <div style={{ padding: "0 16px", position: "relative", zIndex: 10 }}>
          <MobileSessions onSelect={setSelected} />
        </div>
      )}

      {/* Desktop — 3D Smoke Room */}
      {!isMobile && mounted && (
        <div style={{ position: "relative", width: "100%", height: "80vh", marginTop: 24 }}>
          <Canvas
            camera={{ position: [0, 1.5, 6.5], fov: 62, near: 0.1, far: 100 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, toneMapping: 4, powerPreference: "high-performance" }}
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <SmokeRoomScene onEnter={setSelected} mouse={mouseRef} />
            </Suspense>
          </Canvas>

          {/* Nebula background behind canvas */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -1,
            background: "radial-gradient(ellipse 80% 60% at 50% 60%, #0d0626 0%, #05030a 70%)",
          }} />

          {/* Door name labels overlay */}
          <DoorLabels sessions={SESSIONS} />

          {/* Vignette */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 6,
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(3,1,9,0.8) 100%)",
          }} />

          {/* Hint */}
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              move mouse to shift view · click any door to enter
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: isMobile ? 12 : 28, padding: "0 5vw", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "var(--font-serif, var(--font-grotesk))", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.16)", letterSpacing: "0.05em" }}>
          All sessions include setup · teardown · premium coal management · Nairobi delivery
        </p>
      </div>

      {selected && (
        <SessionModal session={selected} onClose={() => setSelected(null)} onBook={handleBook} />
      )}
    </section>
  );
}

// Preload all door models
Object.values(DOOR_META).forEach(m => useGLTF.preload(m.model));
