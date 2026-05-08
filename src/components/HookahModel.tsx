"use client";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Tell drei's GLTFLoader where to find the Draco decoder
useGLTF.setDecoderPath("/draco/");

export const HOOKAH_PARTS = [
  "hookah_plate",
  "hookah_shaft",
  "hookah_hose_port",
  "hookah_mouthpiece",
  "hookah_base",
  "hookah_bowl",
  "hookah_hose",
] as const;

export const EXPLODE_OFFSETS: Record<string, [number, number, number]> = {
  hookah_plate:    [-2.2, -0.8, 0],
  hookah_shaft:    [0,     2.0, 0],
  hookah_hose_port:[2.2,   0.4, 0],
  hookah_mouthpiece:[2.4,  1.6, 0],
  hookah_base:     [-2.4, -1.6, 0],
  hookah_bowl:     [0,     2.8, 0],
  hookah_hose:     [-2.6,  0.8, 0],
};

interface HookahModelProps {
  explode?: number;
  mouseX?: number;
  mouseY?: number;
  scale?: number;
  position?: [number, number, number];
}

export default function HookahModel({
  explode = 0,
  mouseX = 0,
  mouseY = 0,
  scale = 1,
  position = [0, 0, 0],
}: HookahModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const partRefs = useRef<Record<string, THREE.Object3D>>({});

  const gltf = useGLTF("/models/hookah.glb");
  const nodes = gltf.nodes as Record<string, THREE.Mesh>;

  const targetRotX = useRef(0);
  const targetRotY = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;

    // Spring damping ~0.85 per frame toward mouse target
    const stiffness = 0.06;
    targetRotX.current += (mouseY * -0.14 - targetRotX.current) * stiffness;
    targetRotY.current += (mouseX *  0.14 - targetRotY.current) * stiffness;

    groupRef.current.rotation.x = targetRotX.current;
    groupRef.current.rotation.y = targetRotY.current;

    // Explode parts toward offset positions (0 = assembled, 1 = fully exploded)
    for (const name of HOOKAH_PARTS) {
      const obj = partRefs.current[name];
      if (!obj) continue;
      const [ex, ey, ez] = EXPLODE_OFFSETS[name];
      obj.position.x += (ex * explode - obj.position.x) * 0.1;
      obj.position.y += (ey * explode - obj.position.y) * 0.1;
      obj.position.z += (ez * explode - obj.position.z) * 0.1;
    }
  });

  const renderPart = (name: string) => {
    const node = nodes[name];
    if (!node || !node.geometry) return null;
    return (
      <mesh
        key={name}
        ref={(el) => { if (el) partRefs.current[name] = el; }}
        geometry={node.geometry}
        material={node.material}
        castShadow
        receiveShadow
      />
    );
  };

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {HOOKAH_PARTS.map(renderPart)}
    </group>
  );
}

useGLTF.preload("/models/hookah.glb");
