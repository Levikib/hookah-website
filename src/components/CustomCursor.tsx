"use client";
import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  hue: number; sat: number; lit: number;
}

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outerRef  = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const mouse     = useRef({ x: -200, y: -200 });
  const outer     = useRef({ x: -200, y: -200 });
  const particles = useRef<Particle[]>([]);
  const isHover   = useRef(false);
  const frameRef  = useRef<number>(0);

  const spawnSmoke = useCallback((x: number, y: number) => {
    const count = isHover.current ? 2 : 4;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 0.4 + Math.random() * 0.8;
      // Color: cycle violet → magenta → cyan
      const hues = [270, 300, 190];
      const hue = hues[Math.floor(Math.random() * hues.length)];
      particles.current.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed * 0.3,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 40,
        size: 4 + Math.random() * 8,
        hue,
        sat: 80 + Math.random() * 20,
        lit: 60 + Math.random() * 20,
      });
    }
    // Cap at 120 particles
    if (particles.current.length > 120) {
      particles.current = particles.current.slice(-120);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      spawnSmoke(e.clientX, e.clientY);
    };

    const onEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest("button, a, [role='button'], input, select, textarea");
      isHover.current = !!interactive;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onEnter);

    let lastX = -200, lastY = -200;
    let frameCount = 0;

    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);
      frameCount++;

      // Outer ring follows with lag (magnetic)
      outer.current.x += (mouse.current.x - outer.current.x) * 0.1;
      outer.current.y += (mouse.current.y - outer.current.y) * 0.1;

      if (outerRef.current) {
        const size = isHover.current ? 56 : 36;
        outerRef.current.style.transform =
          `translate(${outer.current.x - size/2}px, ${outer.current.y - size/2}px)`;
        outerRef.current.style.width  = `${size}px`;
        outerRef.current.style.height = `${size}px`;
        outerRef.current.style.borderColor = isHover.current
          ? "rgba(237,255,102,0.8)"
          : "rgba(124,58,237,0.8)";
        outerRef.current.style.mixBlendMode = isHover.current ? "difference" : "normal";
      }
      if (innerRef.current) {
        innerRef.current.style.transform =
          `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px)`;
        innerRef.current.style.opacity = isHover.current ? "0" : "1";
      }

      // Extra smoke on fast movement
      const dx = mouse.current.x - lastX;
      const dy = mouse.current.y - lastY;
      const speed = Math.sqrt(dx*dx + dy*dy);
      if (speed > 4 && frameCount % 2 === 0) {
        spawnSmoke(mouse.current.x, mouse.current.y);
      }
      lastX = mouse.current.x;
      lastY = mouse.current.y;

      // Draw particles
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy *= 0.97; // gentle deceleration
        p.vx += (Math.random() - 0.5) * 0.05; // slight drift
        p.life--;
        if (p.life <= 0) { particles.current.splice(i, 1); continue; }

        const t       = p.life / p.maxLife;
        const radius  = p.size * t;
        const alpha   = t * t * 0.6;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.5);
        grad.addColorStop(0,   `hsla(${p.hue},${p.sat}%,${p.lit}%,${alpha})`);
        grad.addColorStop(0.4, `hsla(${p.hue},${p.sat}%,${p.lit - 10}%,${alpha * 0.5})`);
        grad.addColorStop(1,   `hsla(${p.hue},${p.sat}%,${p.lit - 20}%,0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Ember at cursor — pulsing hot core
      if (mouse.current.x > 0) {
        const cx = mouse.current.x;
        const cy = mouse.current.y;
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);

        // Hot core glow
        const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12 * pulse);
        g1.addColorStop(0,   `rgba(245,240,200,${0.9 * pulse})`);
        g1.addColorStop(0.3, `rgba(245,158,11,${0.7 * pulse})`);
        g1.addColorStop(0.7, `rgba(255,107,53,${0.3 * pulse})`);
        g1.addColorStop(1,   "rgba(124,58,237,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        // Outer ember bloom
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
        g2.addColorStop(0, "rgba(245,158,11,0.15)");
        g2.addColorStop(1, "rgba(124,58,237,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
    };
  }, [spawnSmoke]);

  return (
    <>
      {/* Particle canvas — always on top */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "none",
        }}
      />
      {/* Lagging outer ring */}
      <div
        ref={outerRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          zIndex: 9999,
          borderRadius: "50%",
          border: "1.5px solid rgba(124,58,237,0.8)",
          pointerEvents: "none",
          transition: "width 0.2s, height 0.2s, border-color 0.2s",
          willChange: "transform",
        }}
      />
      {/* Instant inner dot */}
      <div
        ref={innerRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: 6, height: 6,
          zIndex: 9999,
          borderRadius: "50%",
          background: "rgba(237,255,102,0.9)",
          pointerEvents: "none",
          willChange: "transform",
          transition: "opacity 0.2s",
        }}
      />
    </>
  );
}
