"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import HookahModel from "./HookahModel";
import SmokeParticles from "./SmokeParticles";

interface HookahSceneProps {
  explode?: number;
  mouseX?: number;
  mouseY?: number;
  showSmoke?: boolean;
}

export default function HookahScene({
  explode = 0,
  mouseX = 0,
  mouseY = 0,
  showSmoke = true,
}: HookahSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 42 }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 4, 3]} intensity={3} color="#ffd700" />
      <pointLight position={[-3, 2, -2]} intensity={2} color="#00f5d4" />
      <pointLight position={[0, -2, 3]} intensity={1.5} color="#9d4edd" />

      <Suspense fallback={null}>
        <HookahModel
          explode={explode}
          mouseX={mouseX}
          mouseY={mouseY}
          scale={1.1}
          position={[0, -0.6, 0]}
        />
        {showSmoke && <SmokeParticles bowlY={1.05} />}
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.4}
          scale={3}
          blur={2}
          color="#00f5d4"
        />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
