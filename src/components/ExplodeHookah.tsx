"use client";
import { useRef, useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Explode shader ────────────────────────────────────────────────────────────
// Splits the mesh into 5 Y-bands by model-space vertex position.
// Each band gets an independent offset + rotation applied on the GPU.
// "progress" uniform (0→1) drives the explosion. Bidirectional by design.

const VERT = `
  uniform float uProgress;   // 0 = assembled, 1 = fully exploded
  uniform float uTime;
  uniform float uModelMinY;  // bottom of model in local space
  uniform float uModelMaxY;  // top of model in local space

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  // Map a vertex Y to a band index 0-4
  float getBand(float y) {
    float t = (y - uModelMinY) / (uModelMaxY - uModelMinY);
    return floor(t * 5.0);
  }

  // Per-band explosion offsets (x, y, z) and rotation
  vec3 bandOffset(float band) {
    if (band < 0.5) return vec3(-0.6, -2.2,  0.3);  // base tray
    if (band < 1.5) return vec3( 0.8, -1.2, -0.5);  // lower shaft
    if (band < 2.5) return vec3(-0.5,  0.0,  0.8);  // mid shaft + tray
    if (band < 3.5) return vec3( 0.7,  1.4, -0.4);  // upper shaft
    return              vec3(-0.3,  2.6,  0.2);      // bowl + wind cover
  }

  float bandRotY(float band) {
    if (band < 0.5) return -0.4;
    if (band < 1.5) return  0.3;
    if (band < 2.5) return -0.5;
    if (band < 3.5) return  0.6;
    return                   0.8;
  }

  mat3 rotY(float a) {
    float c = cos(a); float s = sin(a);
    return mat3(c, 0, s, 0, 1, 0, -s, 0, c);
  }

  void main() {
    vUv = uv;
    vNormal = normalMatrix * normal;

    float band = getBand(position.y);
    vec3 offset = bandOffset(band) * uProgress;
    float rot   = bandRotY(band)   * uProgress;

    // Gentle wobble at peak explosion
    float wobble = sin(uTime * 2.0 + band * 1.4) * 0.04 * uProgress;
    offset.x += wobble;

    vec3 pos = rotY(rot) * position + offset;

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG = `
  uniform sampler2D uMap;
  uniform sampler2D uMetalRough;
  uniform sampler2D uNormalMap;
  uniform sampler2D uEmissive;
  uniform float uProgress;
  uniform vec3 uLightPos1;
  uniform vec3 uLightPos2;
  uniform vec3 uLightPos3;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec4 baseColor  = texture2D(uMap, vUv);
    vec4 emissive   = texture2D(uEmissive, vUv);
    vec2 metalRough = texture2D(uMetalRough, vUv).bg;
    float metalness = metalRough.x;
    float roughness = metalRough.y;

    vec3 N = normalize(vNormal);

    // Three-point lighting
    vec3 L1 = normalize(uLightPos1 - vWorldPos);
    vec3 L2 = normalize(uLightPos2 - vWorldPos);
    vec3 L3 = normalize(uLightPos3 - vWorldPos);

    float diff1 = max(dot(N, L1), 0.0) * 1.8;
    float diff2 = max(dot(N, L2), 0.0) * 1.2;
    float diff3 = max(dot(N, L3), 0.0) * 0.8;

    vec3 lightColor1 = vec3(1.0,  0.97, 0.88);  // warm white key
    vec3 lightColor2 = vec3(0.06, 0.71, 0.83);  // cyan fill
    vec3 lightColor3 = vec3(0.48, 0.23, 0.93);  // violet rim

    vec3 ambient = baseColor.rgb * 0.35;
    vec3 diffuse = baseColor.rgb * (
      diff1 * lightColor1 +
      diff2 * lightColor2 +
      diff3 * lightColor3
    );

    // Metallic boost
    diffuse = mix(diffuse, diffuse * 1.6, metalness * (1.0 - roughness));

    // Emissive (bowl glow, embers)
    vec3 em = emissive.rgb * 1.4;

    // Edge glow on explosion — parts glow cyan at their separation edges
    float edgeGlow = uProgress * (1.0 - abs(dot(N, vec3(0.0, 1.0, 0.0)))) * 0.4;
    vec3 edgeCol   = vec3(0.06, 0.71, 0.83) * edgeGlow;

    vec3 finalColor = ambient + diffuse + em + edgeCol;
    gl_FragColor = vec4(finalColor, baseColor.a);
  }
`;

// Model Y bounds from our earlier inspection
const MODEL_MIN_Y = -0.950;
const MODEL_MAX_Y =  0.949;

interface ExplodeHookahProps {
  progress: number; // 0 = assembled, 1 = fully exploded
  scale?: number;
  position?: [number, number, number];
}

export default function ExplodeHookah({
  progress,
  scale = 1.4,
  position = [0, 0, 0],
}: ExplodeHookahProps) {
  const { scene } = useGLTF("/models/hookah.glb");
  const matRef    = useRef<THREE.ShaderMaterial>(null!);
  const groupRef  = useRef<THREE.Group>(null!);
  const progRef   = useRef(0); // smoothed progress

  // Extract textures from the original PBR material
  const { geometry, textures } = useMemo(() => {
    let geo: THREE.BufferGeometry | null = null;
    const tex: {
      map?: THREE.Texture;
      metalRough?: THREE.Texture;
      normalMap?: THREE.Texture;
      emissive?: THREE.Texture;
    } = {};

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || geo) return;
      geo = mesh.geometry;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      tex.map        = mat.map        ?? undefined;
      tex.metalRough = mat.metalnessMap ?? undefined;
      tex.normalMap  = mat.normalMap  ?? undefined;
      tex.emissive   = mat.emissiveMap ?? undefined;
    });

    return { geometry: geo, textures: tex };
  }, [scene]);

  const shaderMat = useMemo(() => {
    const fallback = new THREE.Texture(); // blank 1×1 if texture missing

    return new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uProgress:   { value: 0 },
        uTime:       { value: 0 },
        uModelMinY:  { value: MODEL_MIN_Y },
        uModelMaxY:  { value: MODEL_MAX_Y },
        uMap:        { value: textures.map        ?? fallback },
        uMetalRough: { value: textures.metalRough ?? fallback },
        uNormalMap:  { value: textures.normalMap  ?? fallback },
        uEmissive:   { value: textures.emissive   ?? fallback },
        uLightPos1:  { value: new THREE.Vector3(-3, 6, 4) },
        uLightPos2:  { value: new THREE.Vector3(4, 2, 3) },
        uLightPos3:  { value: new THREE.Vector3(-4, 0, -3) },
      },
      side: THREE.DoubleSide,
      transparent: false,
    });
  }, [textures]);

  useFrame(({ clock }) => {
    // Smooth the progress value
    progRef.current += (progress - progRef.current) * 0.06;
    shaderMat.uniforms.uProgress.value = progRef.current;
    shaderMat.uniforms.uTime.value     = clock.getElapsedTime();
  });

  if (!geometry) return null;

  return (
    <group ref={groupRef} scale={scale} position={position}>
      <mesh geometry={geometry} material={shaderMat} castShadow />
    </group>
  );
}

useGLTF.preload("/models/hookah.glb");
