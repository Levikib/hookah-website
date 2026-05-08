"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERT = `
  uniform float uTime;
  attribute float aLife;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aDrift;
  varying float vAlpha;

  void main() {
    float t = mod(uTime * aSpeed + aLife, 1.0);
    vec3 pos = position;
    pos.y += t * 3.5;
    pos.x += sin(t * 6.28 + aLife * 12.0) * aDrift;
    pos.z += cos(t * 6.28 + aLife * 8.0) * aDrift * 0.5;

    // fade in at bottom, fade out at top
    vAlpha = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.55, 1.0, t)) * 0.55;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float disc = 1.0 - smoothstep(0.6, 1.0, d);
    if (disc < 0.01) discard;
    gl_FragColor = vec4(0.85, 0.85, 0.9, disc * vAlpha);
  }
`;

const COUNT = 2000;

export default function SmokeParticles({ bowlY = 0.6 }: { bowlY?: number }) {
  const meshRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, life, speeds, sizes, drifts } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const life = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    const drifts = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const r = Math.random() * 0.12;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = bowlY;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      life[i] = Math.random();
      speeds[i] = 0.18 + Math.random() * 0.22;
      sizes[i] = 0.02 + Math.random() * 0.06;
      drifts[i] = 0.04 + Math.random() * 0.12;
    }
    return { positions, life, speeds, sizes, drifts };
  }, [bowlY]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aLife", new THREE.BufferAttribute(life, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aDrift", new THREE.BufferAttribute(drifts, 1));
    return g;
  }, [positions, life, speeds, sizes, drifts]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
