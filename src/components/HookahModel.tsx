"use client";
import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HookahModelProps {
  mouseX?: number;
  mouseY?: number;
  scale?: number;
  position?: [number, number, number];
  explode?: number; // 0 = assembled, 1 = fully exploded (future use)
}

export default function HookahModel({
  mouseX = 0,
  mouseY = 0,
  scale = 1,
  position = [0, 0, 0],
}: HookahModelProps) {
  const groupRef  = useRef<THREE.Group>(null!);
  const rotX      = useRef(0);
  const rotY      = useRef(0);
  const floatT    = useRef(0);

  const { scene } = useGLTF("/models/hookah.glb");

  // Clone so multiple instances don't share state
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // Enable shadows and smooth normals on every mesh
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow    = true;
        mesh.receiveShadow = true;
        // Ensure PBR material renders correctly
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.envMapIntensity = 1.2;
          mat.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Direct mouse-driven rotation — full 3D range like FlavourWall orbit
    // mouseX/Y are -1 to 1, map to ±55° Y and ±35° X
    const targetY =  mouseX * 0.96; // ~55°
    const targetX = -mouseY * 0.61; // ~35°
    rotX.current += (targetX - rotX.current) * 0.08;
    rotY.current += (targetY - rotY.current) * 0.08;
    groupRef.current.rotation.x = rotX.current;
    groupRef.current.rotation.y = rotY.current;

    // Gentle ambient float
    floatT.current += delta * 0.6;
    groupRef.current.position.y = position[1] + Math.sin(floatT.current) * 0.04;
  });

  return (
    <group ref={groupRef} scale={scale} position={position}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload("/models/hookah.glb");
