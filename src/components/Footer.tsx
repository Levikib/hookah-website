"use client";
import { useEffect, useRef } from "react";

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = frame * 0.016;

      stars.forEach((s) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity * twinkle})`;
        ctx.fill();
      });

      // Draw hookah constellation
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.4;
      const points = [
        [cx, cy - 60],       // bowl top
        [cx, cy - 20],       // bowl base
        [cx, cy + 50],       // shaft mid
        [cx, cy + 100],      // base top
        [cx - 40, cy + 130], // base left
        [cx + 40, cy + 130], // base right
        [cx + 30, cy + 30],  // hose port
        [cx + 80, cy + 10],  // hose mid
        [cx + 100, cy - 20], // mouthpiece
      ];
      const connections = [[0,1],[1,2],[2,3],[3,4],[3,5],[2,6],[6,7],[7,8]];

      connections.forEach(([a, b]) => {
        const pa = points[a], pb = points[b];
        const grad = ctx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
        grad.addColorStop(0, "rgba(0,245,212,0.35)");
        grad.addColorStop(1, "rgba(157,78,221,0.35)");
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      points.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,245,212,0.8)";
        ctx.fill();
      });

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

const FOOTER_LINKS = {
  Sessions: ["Solo Session", "Squad Session", "VIP Experience", "Corporate Events", "Weddings"],
  Flavours: ["Classic Blends", "Fresh & Minty", "Tropical Mix", "Premium Reserve", "Mystery Box"],
  Rentals:  ["Standard Models", "Premium Models", "Luxury Models", "Event Packages", "Delivery"],
  Company:  ["About Us", "How It Works", "FAQ", "Gallery", "Contact"],
};

export default function Footer() {
  return (
    <footer style={{ background: "#020205", position: "relative", overflow: "hidden" }}>
      {/* Starfield outro */}
      <div style={{ position: "relative", height: 360, overflow: "hidden" }}>
        <StarField />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.25em", color: "var(--teal)",
            textTransform: "uppercase", marginBottom: 16,
          }}>
            ✦ The Session Never Ends ✦
          </p>
          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(48px, 7vw, 88px)",
            color: "#fff", letterSpacing: "0.04em",
            textTransform: "uppercase", textAlign: "center",
            lineHeight: 0.95, marginBottom: 32,
          }}>
            Book Your<br />
            <span style={{ color: "var(--teal)" }}>Session Tonight.</span>
          </h2>
          <button className="btn-teal" style={{ fontSize: 16, padding: "14px 36px" }}>
            Book a Session
          </button>
        </div>
        {/* Fade to footer */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: "linear-gradient(to bottom, transparent, #020205)",
          zIndex: 2,
        }} />
      </div>

      {/* Footer grid */}
      <div
        style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "60px 5vw 40px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(4, 1fr)",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand column */}
          <div>
            <h3 style={{
              fontFamily: "var(--font-bebas)", fontSize: 32,
              color: "#fff", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 12,
            }}>
              <span style={{ color: "var(--teal)" }}>Hookah</span>™
            </h3>
            <p style={{
              fontFamily: "var(--font-barlow)", fontSize: 14,
              color: "rgba(255,255,255,0.45)", lineHeight: 1.6,
              maxWidth: 220, marginBottom: 24,
            }}>
              Premium hookah experiences, curated flavours, and luxury rentals — wherever the vibe takes you.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {["Instagram", "TikTok", "X"].map((s) => (
                <button key={s} style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "6px 12px", borderRadius: 6,
                  background: "none", cursor: "pointer",
                  transition: "color 0.2s, border-color 0.2s",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{
                fontFamily: "var(--font-barlow)", fontWeight: 700,
                fontSize: 11, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
                marginBottom: 16,
              }}>
                {heading}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{
                      fontFamily: "var(--font-barlow)", fontSize: 14,
                      color: "rgba(255,255,255,0.5)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--teal)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em",
          }}>
            © 2024 Hookah™ · All rights reserved
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <a key={t} href="#" style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em",
                textDecoration: "none",
              }}>
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
