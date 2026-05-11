"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/context/MobileContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const SCALE         = 0.013;          // tiny guy
const IDLE_TIMEOUT  = 2200;           // ms before switching to sit
const RUN_THRESHOLD = 6;              // px/frame to count as running
const LERP_POS      = 0.14;           // position smoothing
const LERP_ROT      = 0.12;          // rotation smoothing

// ─── Character mesh — loads 3 GLBs, merges clips, runs state machine ──────────
function CharacterMesh({ worldPos }: { worldPos: React.MutableRefObject<THREE.Vector3> }) {
  const { scene: idleScene,  animations: idleAnims  } = useGLTF("/models/char_idle.glb");
  const { scene: runScene,   animations: runAnims   } = useGLTF("/models/char_run.glb");
  const { scene: sitScene,   animations: sitAnims   } = useGLTF("/models/char_sit.glb");

  const groupRef   = useRef<THREE.Group>(null!);
  const meshRef    = useRef<THREE.Group>(null!);

  // Clone the idle scene as our base mesh (has the correct textures/materials)
  const clonedScene = useRef<THREE.Group | null>(null);
  if (!clonedScene.current) {
    clonedScene.current = idleScene.clone(true);
  }

  // Merge all animation clips into one animations hook target
  const allClips = useRef<THREE.AnimationClip[]>([]);
  if (allClips.current.length === 0) {
    // Name them clearly
    const idle = idleAnims[0]?.clone(); if (idle) { idle.name = "Idle"; allClips.current.push(idle); }
    const run  = runAnims[0]?.clone();  if (run)  { run.name  = "Run";  allClips.current.push(run);  }
    const sit  = sitAnims[0]?.clone();  if (sit)  { sit.name  = "Sit";  allClips.current.push(sit);  }
  }

  const { actions, mixer } = useAnimations(allClips.current, meshRef);

  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const state         = useRef<"Idle" | "Run" | "Sit">("Idle");
  const pos           = useRef(new THREE.Vector3(0, -2, 0));
  const targetPos     = useRef(new THREE.Vector3(0, -2, 0));
  const facingAngle   = useRef(0);
  const targetAngle   = useRef(0);

  // Play an animation with crossfade
  const playClip = useCallback((name: "Idle" | "Run" | "Sit") => {
    const next = actions[name];
    if (!next || state.current === name) return;
    state.current = name;

    next.reset().setEffectiveTimeScale(name === "Run" ? 1.4 : 1).setEffectiveWeight(1).fadeIn(0.3).play();
    if (currentAction.current && currentAction.current !== next) {
      currentAction.current.fadeOut(0.3);
    }
    currentAction.current = next;
  }, [actions]);

  // Start with idle
  useEffect(() => {
    if (actions["Idle"]) {
      actions["Idle"]!.play();
      currentAction.current = actions["Idle"]!;
    }
  }, [actions]);

  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    // Smooth position
    pos.current.lerp(targetPos.current, LERP_POS);
    groupRef.current.position.copy(pos.current);

    // Smooth rotation — face direction of travel
    facingAngle.current += (targetAngle.current - facingAngle.current) * LERP_ROT;
    meshRef.current.rotation.y = facingAngle.current;

    mixer.update(delta);
  });

  // Expose setTarget so parent canvas can drive it
  useEffect(() => {
    // Store on the group as user data for external access
    if (groupRef.current) {
      (groupRef.current as any).__setTarget = (
        x: number,
        y: number,
        velocityMag: number,
        angle: number,
        isSitting: boolean,
      ) => {
        targetPos.current.set(x, y, 0);
        targetAngle.current = angle;
        if (isSitting) {
          playClip("Sit" as const);
        } else if (velocityMag > RUN_THRESHOLD) {
          playClip("Run" as const);
        } else {
          playClip("Idle" as const);
        }
      };
    }
  }, [playClip]);

  return (
    <group ref={groupRef}>
      <group ref={meshRef} scale={SCALE} position={[0, 0, 0]}>
        <primitive object={clonedScene.current} />
      </group>
    </group>
  );
}

// ─── Inner canvas scene — receives mouse world coords from outer ──────────────
function Scene({ mouseScreen }: { mouseScreen: React.MutableRefObject<{ x: number; y: number; vx: number; vy: number; sitting: boolean }> }) {
  const { viewport, size } = useThree();
  const worldPos   = useRef(new THREE.Vector3());
  const charRef    = useRef<THREE.Group>(null!);
  const prevPos    = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!charRef.current) return;
    const { x, y, vx, vy, sitting } = mouseScreen.current;

    // Convert screen px → world units
    const wx = (x / size.width  - 0.5) *  viewport.width;
    const wy = (y / size.height - 0.5) * -viewport.height;

    const velocityMag = Math.sqrt(vx * vx + vy * vy);
    const angle = velocityMag > 1 ? Math.atan2(vx, vy) : (charRef.current as any).__setTarget ? 0 : 0;

    const setter = (charRef.current as any).__setTarget;
    if (setter) setter(wx, wy - 0.08, velocityMag, angle, sitting);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 4, 3]} intensity={4} color="#fff8f0" />
      <pointLight position={[-2, 2, 2]} intensity={2} color="#7c3aed" />
      <group ref={charRef}>
        <CharacterMesh worldPos={worldPos} />
      </group>
    </>
  );
}

// ─── Main export — fixed overlay canvas ──────────────────────────────────────
export default function CursorCharacter() {
  const isMobile = useIsMobile();
  const mouseScreen = useRef({ x: 0, y: 0, vx: 0, vy: 0, sitting: false });
  const lastMove    = useRef(Date.now());
  const sitTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMouse   = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isMobile) return;

    const onMove = (e: MouseEvent) => {
      const vx = e.clientX - prevMouse.current.x;
      const vy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };

      mouseScreen.current = {
        x: e.clientX,
        y: e.clientY,
        vx,
        vy,
        sitting: false,
      };
      lastMove.current = Date.now();

      // Reset sit timer on movement
      if (sitTimer.current) clearTimeout(sitTimer.current);
      sitTimer.current = setTimeout(() => {
        mouseScreen.current = { ...mouseScreen.current, sitting: true };
      }, IDLE_TIMEOUT);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (sitTimer.current) clearTimeout(sitTimer.current);
    };
  }, [isMobile]);

  if (isMobile || !mounted) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9998,        // just below CustomCursor dot (9999)
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.01, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Scene mouseScreen={mouseScreen} />
      </Canvas>
    </div>
  );
}

// Preload all 3
useGLTF.preload("/models/char_idle.glb");
useGLTF.preload("/models/char_run.glb");
useGLTF.preload("/models/char_sit.glb");
