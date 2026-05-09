"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { gsap } from "gsap";
import { FLAVOURS, CATEGORIES, getStockStatus } from "@/data/flavours";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

// ─── Types ───────────────────────────────────────────────────────────────────
type Layout = "TABLE" | "SPHERE" | "HELIX" | "GRID";

interface CardTarget {
  x: number; y: number; z: number;
  rotX: number; rotY: number; rotZ: number;
}

// ─── Layout position calculators ─────────────────────────────────────────────
const CARD_W = 160;
const CARD_H = 200;

function tableTargets(): CardTarget[] {
  // Periodic-table style: rows = category, cols = intensity
  const categories = ["Classic", "Fresh", "Fruity", "Tropical", "Floral", "Specialty", "Novelty", "Premium", "Mystery"];
  const intensities = ["Mild", "Medium", "Strong"];
  return FLAVOURS.map((f) => {
    const row = categories.indexOf(f.category);
    const col = intensities.indexOf(f.intensity);
    const safeRow = row < 0 ? 0 : row;
    const safeCol = col < 0 ? 0 : col;
    return {
      x: (safeCol - 1) * (CARD_W + 16),
      y: -(safeRow - 4) * (CARD_H + 12),
      z: 0,
      rotX: 0, rotY: 0, rotZ: 0,
    };
  });
}

function sphereTargets(): CardTarget[] {
  return FLAVOURS.map((_, i) => {
    const phi   = Math.acos(-1 + (2 * i) / FLAVOURS.length);
    const theta = Math.sqrt(FLAVOURS.length * Math.PI) * phi;
    const r = 700;
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      rotX: -phi * (180 / Math.PI) + 90,
      rotY:  theta * (180 / Math.PI),
      rotZ: 0,
    };
  });
}

function helixTargets(): CardTarget[] {
  return FLAVOURS.map((_, i) => {
    const t = i / FLAVOURS.length;
    const angle = t * Math.PI * 6;
    const strand = i % 2 === 0 ? 1 : -1;
    const r = 320;
    return {
      x: Math.sin(angle) * r * strand,
      y: (t - 0.5) * -1200,
      z: Math.cos(angle) * r * strand,
      rotX: 0,
      rotY: -angle * (180 / Math.PI),
      rotZ: 0,
    };
  });
}

function gridTargets(): CardTarget[] {
  const cols = 5;
  return FLAVOURS.map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: (col - (cols - 1) / 2) * (CARD_W + 20),
      y: -(row - 2) * (CARD_H + 20),
      z: 0,
      rotX: 0, rotY: 0, rotZ: 0,
    };
  });
}

function getTargets(layout: Layout): CardTarget[] {
  switch (layout) {
    case "TABLE":  return tableTargets();
    case "SPHERE": return sphereTargets();
    case "HELIX":  return helixTargets();
    case "GRID":   return gridTargets();
  }
}

// ─── Intensity / category colours ────────────────────────────────────────────
const INTENSITY_COLORS: Record<string, string> = {
  Mild:   "#22d3ee",
  Medium: "#f59e0b",
  Strong: "#ff6b35",
};
const CATEGORY_COLORS: Record<string, string> = {
  Classic:   "#e74c3c",  Fresh:    "#1abc9c",  Fruity:  "#ff6b9d",
  Tropical:  "#f39c12",  Floral:   "#fd79a8",  Specialty: "#e17055",
  Novelty:   "#6c5ce7",  Premium:  "#5f27cd",  Mystery: "#74b9ff",
};

// ─── Single flavour card DOM builder ─────────────────────────────────────────
function buildCardEl(
  f: typeof FLAVOURS[0],
  onAdd: (id: string, name: string, price: number) => void
): HTMLDivElement {
  const accent = CATEGORY_COLORS[f.category] ?? "#22d3ee";
  const intColor = INTENSITY_COLORS[f.intensity] ?? "#fff";
  const stock = getStockStatus(f.stock);
  const isOut = stock === "out";

  const el = document.createElement("div");
  el.className = "fw-card";
  el.dataset.id = String(f.id);
  el.style.cssText = `
    width:${CARD_W}px; height:${CARD_H}px;
    background: rgba(10,6,20,0.92);
    border: 1px solid ${accent}44;
    border-top: 2px solid ${accent};
    border-radius: 14px;
    padding: 14px 12px 12px;
    display: flex; flex-direction: column; gap: 6px;
    cursor: pointer;
    box-shadow: 0 0 24px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
    font-family: system-ui, sans-serif;
    user-select: none;
    opacity: ${isOut ? 0.45 : 1};
  `;

  // Glow orb
  const orb = document.createElement("div");
  orb.style.cssText = `
    position: absolute; width: 60px; height: 60px;
    border-radius: 50%;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    top: -10px; right: -10px; pointer-events: none;
  `;
  el.style.position = "relative";
  el.appendChild(orb);

  // Emoji
  const emoji = document.createElement("div");
  emoji.textContent = f.emoji;
  emoji.style.cssText = `font-size: 28px; line-height: 1; margin-bottom: 2px;`;
  el.appendChild(emoji);

  // Name
  const name = document.createElement("div");
  name.textContent = f.name;
  name.style.cssText = `
    font-family: var(--font-bebas, 'Bebas Neue', system-ui);
    font-size: 17px; letter-spacing: 0.05em; text-transform: uppercase;
    color: #fff; line-height: 1; margin-bottom: 2px;
  `;
  el.appendChild(name);

  // Category + intensity row
  const meta = document.createElement("div");
  meta.style.cssText = `display: flex; gap: 6px; align-items: center; flex-wrap: wrap;`;
  const catEl = document.createElement("span");
  catEl.textContent = f.category;
  catEl.style.cssText = `font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.45);`;
  const intEl = document.createElement("span");
  intEl.textContent = `· ${f.intensity}`;
  intEl.style.cssText = `font-size: 9px; color: ${intColor}; letter-spacing: 0.08em;`;
  meta.appendChild(catEl);
  meta.appendChild(intEl);
  el.appendChild(meta);

  // Notes
  const notes = document.createElement("div");
  notes.style.cssText = `display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px;`;
  f.notes.slice(0, 2).forEach((n) => {
    const tag = document.createElement("span");
    tag.textContent = n;
    tag.style.cssText = `font-size: 9px; padding: 2px 6px; border-radius: 20px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.55); letter-spacing: 0.06em;`;
    notes.appendChild(tag);
  });
  el.appendChild(notes);

  // Spacer
  const spacer = document.createElement("div");
  spacer.style.cssText = `flex: 1;`;
  el.appendChild(spacer);

  // Stock badge
  if (stock !== "normal") {
    const badge = document.createElement("div");
    badge.textContent = stock === "out" ? "SOLD OUT" : stock === "critical" ? "ALMOST GONE" : "LOW STOCK";
    badge.style.cssText = `font-size: 8px; letter-spacing: 0.14em; padding: 2px 6px; border-radius: 4px; border: 1px solid ${stock === "out" ? "rgba(255,255,255,0.15)" : "#f59e0b"}; color: ${stock === "out" ? "rgba(255,255,255,0.3)" : "#f59e0b"}; display: inline-block; margin-bottom: 4px;`;
    el.appendChild(badge);
  }

  // Price + button row
  const bottom = document.createElement("div");
  bottom.style.cssText = `display: flex; justify-content: space-between; align-items: center;`;

  const price = document.createElement("span");
  price.textContent = `$${f.price.toFixed(2)}`;
  price.style.cssText = `font-family: var(--font-mono, monospace); font-size: 15px; color: ${accent}; font-weight: 700;`;

  const btn = document.createElement("button");
  btn.textContent = isOut ? "Sold Out" : "+ Add";
  btn.disabled = isOut;
  btn.style.cssText = `
    font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 6px 10px; border-radius: 8px; border: 1px solid ${isOut ? "rgba(255,255,255,0.1)" : accent};
    background: ${isOut ? "transparent" : `${accent}22`}; color: ${isOut ? "rgba(255,255,255,0.3)" : accent};
    cursor: ${isOut ? "not-allowed" : "pointer"}; transition: all 0.2s; font-family: inherit;
  `;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isOut) return;
    btn.textContent = "✓ Added";
    btn.style.background = accent;
    btn.style.color = "#000";
    setTimeout(() => {
      btn.textContent = "+ Add";
      btn.style.background = `${accent}22`;
      btn.style.color = accent;
    }, 900);
    onAdd(`flavour-${f.id}`, f.name, f.price);
  });

  bottom.appendChild(price);
  bottom.appendChild(btn);
  el.appendChild(bottom);

  // Hover glow
  el.addEventListener("mouseenter", () => {
    el.style.boxShadow = `0 0 40px ${accent}55, 0 0 80px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.1)`;
    el.style.borderColor = `${accent}88`;
    el.style.borderTopColor = accent;
  });
  el.addEventListener("mouseleave", () => {
    el.style.boxShadow = `0 0 24px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.06)`;
    el.style.borderColor = `${accent}44`;
    el.style.borderTopColor = accent;
  });

  return el;
}

// ─── Walking cursor SVG ───────────────────────────────────────────────────────
const WALK_FRAMES = [
  // Frame 0 — standing
  `<svg viewBox="0 0 24 48" width="24" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="6" r="4" fill="#22d3ee"/>
    <rect x="9" y="11" width="6" height="14" rx="3" fill="#22d3ee"/>
    <rect x="9" y="24" width="3" height="12" rx="1.5" fill="#22d3ee"/>
    <rect x="12" y="24" width="3" height="12" rx="1.5" fill="#22d3ee"/>
    <rect x="4" y="13" width="3" height="10" rx="1.5" fill="#22d3ee"/>
    <rect x="17" y="13" width="3" height="10" rx="1.5" fill="#22d3ee"/>
  </svg>`,
  // Frame 1 — mid-stride
  `<svg viewBox="0 0 24 48" width="24" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="6" r="4" fill="#22d3ee"/>
    <rect x="9" y="11" width="6" height="14" rx="3" fill="#22d3ee"/>
    <rect x="7" y="24" width="3" height="13" rx="1.5" fill="#22d3ee" transform="rotate(12 8.5 24)"/>
    <rect x="13" y="24" width="3" height="13" rx="1.5" fill="#22d3ee" transform="rotate(-12 14.5 24)"/>
    <rect x="3" y="12" width="3" height="11" rx="1.5" fill="#22d3ee" transform="rotate(-15 4.5 12)"/>
    <rect x="18" y="12" width="3" height="11" rx="1.5" fill="#22d3ee" transform="rotate(15 19.5 12)"/>
  </svg>`,
  // Frame 2 — full stride
  `<svg viewBox="0 0 24 48" width="24" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="6" r="4" fill="#22d3ee"/>
    <rect x="9" y="11" width="6" height="14" rx="3" fill="#22d3ee"/>
    <rect x="5" y="23" width="3" height="14" rx="1.5" fill="#22d3ee" transform="rotate(20 6.5 23)"/>
    <rect x="15" y="23" width="3" height="14" rx="1.5" fill="#22d3ee" transform="rotate(-20 16.5 23)"/>
    <rect x="2" y="11" width="3" height="11" rx="1.5" fill="#22d3ee" transform="rotate(-22 3.5 11)"/>
    <rect x="19" y="11" width="3" height="11" rx="1.5" fill="#22d3ee" transform="rotate(22 20.5 11)"/>
  </svg>`,
];

// ─── Layout icon SVGs ─────────────────────────────────────────────────────────
const LAYOUT_ICONS: Record<Layout, string> = {
  TABLE:  `<svg viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>`,
  SPHERE: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><ellipse cx="10" cy="10" rx="4" ry="8"/><line x1="2" y1="10" x2="18" y2="10"/></svg>`,
  HELIX:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2 Q16 6 4 10 Q16 14 4 18"/><path d="M16 2 Q4 6 16 10 Q4 14 16 18"/></svg>`,
  GRID:   `<svg viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="4" height="4" rx="0.5"/><rect x="8" y="2" width="4" height="4" rx="0.5"/><rect x="14" y="2" width="4" height="4" rx="0.5"/><rect x="2" y="8" width="4" height="4" rx="0.5"/><rect x="8" y="8" width="4" height="4" rx="0.5"/><rect x="14" y="8" width="4" height="4" rx="0.5"/><rect x="2" y="14" width="4" height="4" rx="0.5"/><rect x="8" y="14" width="4" height="4" rx="0.5"/><rect x="14" y="14" width="4" height="4" rx="0.5"/></svg>`,
};

const LAYOUTS: Layout[] = ["TABLE", "SPHERE", "HELIX", "GRID"];

// ─── Main component ───────────────────────────────────────────────────────────
export default function FlavourWall() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const rendererRef   = useRef<CSS3DRenderer | null>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const objectsRef    = useRef<CSS3DObject[]>([]);
  const rafRef        = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const mouseDownRef  = useRef({ x: 0, y: 0 });
  const rotationRef   = useRef({ x: 0, y: 0 });
  const targetRotRef  = useRef({ x: 0, y: 0 });
  const velocityRef   = useRef({ x: 0, y: 0 });
  const cursorRef     = useRef<HTMLDivElement>(null);
  const frameRef      = useRef(0);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMouseRef  = useRef({ x: -999, y: -999 });
  const movingRef     = useRef(false);
  const movingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipRef       = useRef(false);
  const transitioningRef = useRef(false);

  const [layout, setLayout]       = useState<Layout>("TABLE");
  const [activeLayout, setActiveLayout] = useState<Layout>("TABLE");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const isMobile = useIsMobile();
  const addToCart = useStore((s) => s.addToCart);

  const handleAdd = useCallback((id: string, name: string, price: number) => {
    addToCart({ id, type: "flavour", name, price, quantity: 1 });
  }, [addToCart]);

  // ── Init Three + CSS3DRenderer ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 1, 10000);
    camera.position.z = 1800;

    const renderer = new CSS3DRenderer();
    renderer.setSize(W, H);
    renderer.domElement.style.cssText = `position:absolute; inset:0; overflow:hidden;`;
    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current   = scene;
    cameraRef.current  = camera;
    rendererRef.current = renderer;

    // Build CSS3D objects for all flavours
    const targets = getTargets("TABLE");
    FLAVOURS.forEach((f, i) => {
      const el  = buildCardEl(f, handleAdd);
      const obj = new CSS3DObject(el);
      obj.position.set(targets[i].x, targets[i].y, targets[i].z);
      obj.rotation.set(
        THREE.MathUtils.degToRad(targets[i].rotX),
        THREE.MathUtils.degToRad(targets[i].rotY),
        THREE.MathUtils.degToRad(targets[i].rotZ)
      );
      scene.add(obj);
      objectsRef.current.push(obj);
    });

    // Render loop
    let running = true;
    const animate = () => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(animate);

      // Inertia for sphere/helix drag
      if (!isDraggingRef.current) {
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
        targetRotRef.current.x += velocityRef.current.x;
        targetRotRef.current.y += velocityRef.current.y;
      }
      rotationRef.current.x += (targetRotRef.current.x - rotationRef.current.x) * 0.08;
      rotationRef.current.y += (targetRotRef.current.y - rotationRef.current.y) * 0.08;
      scene.rotation.x = THREE.MathUtils.degToRad(rotationRef.current.x);
      scene.rotation.y = THREE.MathUtils.degToRad(rotationRef.current.y);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [handleAdd]);

  // ── Drag / orbit controls ─────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (activeLayout !== "SPHERE" && activeLayout !== "HELIX") return;
    isDraggingRef.current = true;
    mouseDownRef.current  = { x: e.clientX, y: e.clientY };
    velocityRef.current   = { x: 0, y: 0 };
  }, [activeLayout]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - mouseDownRef.current.x;
    const dy = e.clientY - mouseDownRef.current.y;
    velocityRef.current.y = dx * 0.12;
    velocityRef.current.x = dy * 0.08;
    targetRotRef.current.y += dx * 0.12;
    targetRotRef.current.x += dy * 0.08;
    mouseDownRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // ── Layout morph ─────────────────────────────────────────────────────────
  const morphTo = useCallback((next: Layout) => {
    if (transitioningRef.current || next === activeLayout) return;
    transitioningRef.current = true;
    setLayout(next);

    const targets = getTargets(next);

    // Reset scene rotation for flat layouts
    if (next === "TABLE" || next === "GRID") {
      gsap.to(rotationRef.current, {
        x: 0, y: 0, duration: 1.2, ease: "power3.out",
        onUpdate: () => {
          targetRotRef.current.x = rotationRef.current.x;
          targetRotRef.current.y = rotationRef.current.y;
        },
      });
    }

    objectsRef.current.forEach((obj, i) => {
      const t = targets[i];
      const delay = i * 0.018 + Math.random() * 0.04;

      // Mid-tween scale-dip (disintegration feel)
      gsap.to(obj.element, {
        scale: 0.7,
        opacity: 0.3,
        duration: 0.3,
        delay,
        ease: "power2.in",
      });
      gsap.to(obj.element, {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        delay: delay + 0.38,
        ease: "back.out(1.4)",
      });

      // Position + rotation
      gsap.to(obj.position, {
        x: t.x, y: t.y, z: t.z,
        duration: 1.2,
        delay,
        ease: "power4.out",
      });
      gsap.to(obj.rotation, {
        x: THREE.MathUtils.degToRad(t.rotX),
        y: THREE.MathUtils.degToRad(t.rotY),
        z: THREE.MathUtils.degToRad(t.rotZ),
        duration: 1.2,
        delay,
        ease: "power4.out",
        onComplete: i === FLAVOURS.length - 1 ? () => {
          transitioningRef.current = false;
          setActiveLayout(next);
        } : undefined,
      });
    });
  }, [activeLayout]);

  // ── Category filter — show/hide objects ───────────────────────────────────
  useEffect(() => {
    objectsRef.current.forEach((obj, i) => {
      const f = FLAVOURS[i];
      const show = categoryFilter === "All" || f.category === categoryFilter;
      gsap.to(obj.element, {
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0.6,
        duration: 0.35,
        ease: "power2.out",
        pointerEvents: show ? "auto" : "none",
      });
      obj.element.style.pointerEvents = show ? "auto" : "none";
    });
  }, [categoryFilter]);

  // ── Walking cursor ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMouseRef.current.x;

      // Flip direction
      if (Math.abs(dx) > 2) {
        flipRef.current = dx < 0;
        cursor.style.transform = `scaleX(${flipRef.current ? -1 : 1})`;
      }

      cursor.style.left = `${e.clientX - 12}px`;
      cursor.style.top  = `${e.clientY - 44}px`;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      movingRef.current = true;
      if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
      movingTimerRef.current = setTimeout(() => {
        movingRef.current = false;
      }, 200);
    };

    // Walk frame cycle
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    frameTimerRef.current = setInterval(() => {
      if (!cursor) return;
      if (movingRef.current) {
        frameRef.current = (frameRef.current + 1) % WALK_FRAMES.length;
      } else {
        frameRef.current = 0;
      }
      cursor.innerHTML = WALK_FRAMES[frameRef.current];
    }, 120);

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
      if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
    };
  }, [isMobile]);

  // ── Camera zoom for sphere/helix ──────────────────────────────────────────
  useEffect(() => {
    if (!cameraRef.current) return;
    const z = layout === "SPHERE" ? 2200 : layout === "HELIX" ? 1600 : 1800;
    gsap.to(cameraRef.current.position, { z, duration: 1.4, ease: "power3.inOut" });
  }, [layout]);

  const categories = ["All", ...Array.from(new Set(FLAVOURS.map((f) => f.category)))];

  return (
    <section
      id="flavours"
      style={{
        background: "var(--void)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient nebula bg ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 30% 20%, rgba(124,58,237,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 40% 60% at 80% 70%, rgba(6,182,212,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 60% 40%, rgba(232,121,249,0.05) 0%, transparent 70%)
        `,
      }} />

      {/* ── Star field canvas ── */}
      <StarField />

      {/* ── Header ── */}
      <div style={{
        position: "relative", zIndex: 10, textAlign: "center",
        padding: "clamp(48px,7vw,80px) 5vw 0",
        pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.28em",
          color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 14, opacity: 0.8,
        }}>
          25 Premium Blends
        </p>
        <h2 style={{
          fontFamily: "var(--font-bebas)", fontWeight: 400,
          fontSize: "clamp(52px,7vw,96px)", lineHeight: 0.95, letterSpacing: "0.04em",
          textTransform: "uppercase", color: "#fff", marginBottom: 12,
        }}>
          The Flavour <span style={{ color: "var(--cyan-bright)" }}>Wall.</span>
        </h2>
        <p style={{
          fontFamily: "var(--font-barlow)", fontSize: "clamp(13px,2vw,16px)",
          color: "rgba(255,255,255,0.5)", maxWidth: 420, margin: "0 auto",
        }}>
          Every session begins with a choice.
        </p>
      </div>

      {/* ── Layout switcher ── */}
      <div style={{
        position: "relative", zIndex: 10, display: "flex", justifyContent: "center",
        gap: 8, marginTop: 28, marginBottom: 8,
      }}>
        {LAYOUTS.map((l) => (
          <button
            key={l}
            onClick={() => morphTo(l)}
            title={l}
            style={{
              width: 44, height: 44, borderRadius: 10, border: "1px solid",
              borderColor: activeLayout === l ? "var(--cyan-bright)" : "rgba(255,255,255,0.12)",
              background: activeLayout === l ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
              color: activeLayout === l ? "var(--cyan-bright)" : "rgba(255,255,255,0.4)",
              cursor: "pointer", transition: "all 0.25s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
            dangerouslySetInnerHTML={{ __html: LAYOUT_ICONS[l] }}
          />
        ))}
        <div style={{
          position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%)",
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.3)", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          {activeLayout === "SPHERE" || activeLayout === "HELIX" ? "drag to rotate · click to select" : "click to select"}
        </div>
      </div>

      {/* ── Category filter ── */}
      <div style={{
        position: "relative", zIndex: 10, display: "flex", justifyContent: "center",
        gap: 8, flexWrap: "wrap", padding: "32px 5vw 0",
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "6px 14px", borderRadius: 24,
              border: `1px solid ${categoryFilter === cat ? "var(--cyan-bright)" : "rgba(255,255,255,0.1)"}`,
              background: categoryFilter === cat ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
              color: categoryFilter === cat ? "var(--cyan-bright)" : "rgba(255,255,255,0.45)",
              cursor: "pointer", transition: "all 0.2s ease",
              backdropFilter: "blur(6px)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── 3D CSS Renderer container ── */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: "relative", zIndex: 5,
          width: "100%",
          height: isMobile ? "70vh" : "78vh",
          cursor: activeLayout === "SPHERE" || activeLayout === "HELIX" ? "grab" : "default",
          marginTop: 8,
          touchAction: "none",
        }}
      />

      {/* ── Walking cursor ── */}
      {!isMobile && (
        <div
          ref={cursorRef}
          style={{
            position: "fixed", zIndex: 9999, pointerEvents: "none",
            width: 24, height: 48, top: 0, left: 0,
            filter: "drop-shadow(0 0 6px rgba(34,211,238,0.7))",
            transition: "transform 0.1s ease",
          }}
          dangerouslySetInnerHTML={{ __html: WALK_FRAMES[0] }}
        />
      )}

      {/* ── Bottom count ── */}
      <p style={{
        position: "relative", zIndex: 10, textAlign: "center",
        padding: "16px 0 clamp(48px,6vw,80px)",
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "rgba(255,255,255,0.2)", letterSpacing: "0.14em",
      }}>
        {categoryFilter === "All" ? FLAVOURS.length : FLAVOURS.filter(f => f.category === categoryFilter).length} blends · {activeLayout.toLowerCase()} view
      </p>
    </section>
  );
}

// ─── Star field background ────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2,
      a: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let t = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const alpha = s.a * (0.4 + 0.6 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,160,255,${alpha})`;
        ctx.fill();
      });
    };
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        zIndex: 1, pointerEvents: "none",
      }}
    />
  );
}
