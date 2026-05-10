"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Smoke shader ─────────────────────────────────────────────────────────────
const SMOKE_VERT = `
  uniform float uTime;
  attribute float aLife;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aDrift;
  attribute float aAngle;
  varying float vAlpha;
  varying float vT;

  void main() {
    float t = mod(uTime * aSpeed + aLife, 1.0);
    vT = t;

    vec3 pos = position;
    // Rise upward, accelerating slightly
    pos.y += t * 2.2 + t * t * 0.8;
    // Drift side to side — organic S-curve
    pos.x += sin(t * 5.0 + aAngle) * aDrift * t;
    pos.z += cos(t * 4.0 + aAngle * 1.3) * aDrift * t * 0.6;
    // Expand as it rises
    float spread = 1.0 + t * 1.8;
    pos.x *= spread;
    pos.z *= spread;

    // Fade: quick in, long out
    vAlpha = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.55, 1.0, t)) * 0.68;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * spread * (400.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const SMOKE_FRAG = `
  varying float vAlpha;
  varying float vT;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    // Soft disc with feathered edge
    float disc = 1.0 - smoothstep(0.3, 1.0, d);
    if (disc < 0.01) discard;
    // Slight warm tint at base (near embers), grey at top
    vec3 col = mix(vec3(0.9, 0.8, 0.7), vec3(0.75, 0.75, 0.8), smoothstep(0.0, 0.3, vT));
    gl_FragColor = vec4(col, disc * vAlpha);
  }
`;

// ── Ember glow shader ─────────────────────────────────────────────────────────
const EMBER_VERT = `
  uniform float uTime;
  attribute float aLife;
  attribute float aSpeed;
  attribute float aSize;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float t = mod(uTime * aSpeed + aLife, 1.0);
    vec3 pos = position;
    // Embers barely drift — tight cluster in the bowl
    pos.x += sin(uTime * 2.0 + aLife * 6.28) * 0.015;
    pos.z += cos(uTime * 1.7 + aLife * 4.0) * 0.015;
    // Occasional ember pop — rises fast and fades
    pos.y += t * 0.18;

    vHeat = 1.0 - t;
    vAlpha = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.6, 1.0, t)) * 0.9;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (1.0 - t * 0.5) * (350.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const EMBER_FRAG = `
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float disc = 1.0 - smoothstep(0.0, 1.0, d);
    if (disc < 0.01) discard;
    // Hot white core → orange → red
    vec3 hot  = vec3(1.0, 0.95, 0.8);
    vec3 mid  = vec3(1.0, 0.45, 0.05);
    vec3 cool = vec3(0.9, 0.1, 0.0);
    vec3 col  = mix(cool, mix(mid, hot, disc), vHeat);
    gl_FragColor = vec4(col, disc * vAlpha);
  }
`;

const SMOKE_COUNT = 220;
const EMBER_COUNT = 80;

interface SmokeParticlesProps {
  bowlY?: number;   // world-space Y position of bowl opening
  bowlX?: number;
  bowlZ?: number;
  radius?: number;  // spawn radius inside bowl
}

export default function SmokeParticles({
  bowlY = 1.5,
  bowlX = 0,
  bowlZ = 0,
  radius = 0.06,
}: SmokeParticlesProps) {
  const smokeRef = useRef<THREE.Points>(null!);
  const emberRef = useRef<THREE.Points>(null!);
  const smokeMatRef = useRef<THREE.ShaderMaterial>(null!);
  const emberMatRef = useRef<THREE.ShaderMaterial>(null!);

  // ── Smoke geometry ──────────────────────────────────────────────────────────
  const smokeGeo = useMemo(() => {
    const pos    = new Float32Array(SMOKE_COUNT * 3);
    const life   = new Float32Array(SMOKE_COUNT);
    const speeds = new Float32Array(SMOKE_COUNT);
    const sizes  = new Float32Array(SMOKE_COUNT);
    const drifts = new Float32Array(SMOKE_COUNT);
    const angles = new Float32Array(SMOKE_COUNT);

    for (let i = 0; i < SMOKE_COUNT; i++) {
      const r = Math.random() * radius;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3]     = bowlX + Math.cos(theta) * r;
      pos[i * 3 + 1] = bowlY;
      pos[i * 3 + 2] = bowlZ + Math.sin(theta) * r;
      life[i]   = Math.random();
      speeds[i] = 0.12 + Math.random() * 0.14;
      sizes[i]  = 0.07 + Math.random() * 0.14;
      drifts[i] = 0.03 + Math.random() * 0.08;
      angles[i] = Math.random() * Math.PI * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aLife",    new THREE.BufferAttribute(life, 1));
    g.setAttribute("aSpeed",   new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aDrift",   new THREE.BufferAttribute(drifts, 1));
    g.setAttribute("aAngle",   new THREE.BufferAttribute(angles, 1));
    return g;
  }, [bowlY, bowlX, bowlZ, radius]);

  // ── Ember geometry ──────────────────────────────────────────────────────────
  const emberGeo = useMemo(() => {
    const pos    = new Float32Array(EMBER_COUNT * 3);
    const life   = new Float32Array(EMBER_COUNT);
    const speeds = new Float32Array(EMBER_COUNT);
    const sizes  = new Float32Array(EMBER_COUNT);

    for (let i = 0; i < EMBER_COUNT; i++) {
      const r = Math.random() * radius * 0.8;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3]     = bowlX + Math.cos(theta) * r;
      pos[i * 3 + 1] = bowlY - 0.02; // just inside bowl rim
      pos[i * 3 + 2] = bowlZ + Math.sin(theta) * r;
      life[i]   = Math.random();
      speeds[i] = 0.3 + Math.random() * 0.5;
      sizes[i]  = 0.015 + Math.random() * 0.025;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aLife",    new THREE.BufferAttribute(life, 1));
    g.setAttribute("aSpeed",   new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [bowlY, bowlX, bowlZ, radius]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (smokeMatRef.current) smokeMatRef.current.uniforms.uTime.value = t;
    if (emberMatRef.current) emberMatRef.current.uniforms.uTime.value = t;
  });

  return (
    <group>
      {/* Smoke plume */}
      <points ref={smokeRef} geometry={smokeGeo}>
        <shaderMaterial
          ref={smokeMatRef}
          vertexShader={SMOKE_VERT}
          fragmentShader={SMOKE_FRAG}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>

      {/* Ember glow */}
      <points ref={emberRef} geometry={emberGeo}>
        <shaderMaterial
          ref={emberMatRef}
          vertexShader={EMBER_VERT}
          fragmentShader={EMBER_FRAG}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
