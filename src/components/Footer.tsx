"use client";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/context/MobileContext";

// ── Inline SVG social icons ────────────────────────────────────────
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#", icon: <IconInstagram /> },
  { label: "TikTok",    href: "#", icon: <IconTikTok />    },
  { label: "WhatsApp",  href: "#", icon: <IconWhatsApp />  },
];

const QUICK_LINKS = [
  { label: "Sessions",  href: "#sessions"  },
  { label: "Flavours",  href: "#flavours"  },
  { label: "Rentals",   href: "#rentals"   },
  { label: "Shop",      href: "#shop"      },
  { label: "Book Now",  href: "#book"      },
];

// ── Newsletter component ───────────────────────────────────────────
function NewsletterForm() {
  const [email, setEmail]     = useState("");
  const [success, setSuccess] = useState(false);
  const [flash, setFlash]     = useState(false);

  const handleJoin = () => {
    if (!email.trim()) return;
    setSuccess(true);
    setFlash(true);
    // Reset flash after animation
    setTimeout(() => setFlash(false), 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{
        fontFamily: "var(--font-barlow)",
        fontSize: 13,
        color: "rgba(255,255,255,0.45)",
        lineHeight: 1.5,
        marginBottom: 4,
      }}>
        Join the circle. First to know about drops & events.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "10px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#fff",
            outline: "none",
            minHeight: 44,
          }}
        />
        <button
          onClick={handleJoin}
          style={{
            background: flash ? "var(--gold, #f59e0b)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${flash ? "var(--gold, #f59e0b)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 8,
            padding: "10px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: flash ? "#000" : (success ? "var(--gold, #f59e0b)" : "#fff"),
            cursor: "none",
            minHeight: 44,
            minWidth: 64,
            transition: "background 0.25s ease, color 0.25s ease, border-color 0.25s ease",
            whiteSpace: "nowrap",
          }}
        >
          {success ? (flash ? "✓ YOU'RE IN" : "✓ YOU'RE IN") : "JOIN"}
        </button>
      </div>
    </div>
  );
}

// ── Main Footer ────────────────────────────────────────────────────
export default function Footer() {
  const isMobile = useIsMobile();
  const shimmerRef = useRef<HTMLDivElement>(null);

  // Trigger shimmer animation via CSS only (no GSAP needed here)
  useEffect(() => {
    // shimmer line is purely CSS
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .footer-shimmer-line {
          position: relative;
          height: 1px;
          background: rgba(255,255,255,0.07);
          overflow: hidden;
        }
        .footer-shimmer-line::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--gold, #f59e0b) 40%,
            var(--cyan-bright, #22d3ee) 60%,
            transparent 100%
          );
          animation: shimmer-sweep 3s linear infinite;
        }
        .footer-social-btn:hover {
          color: var(--cyan-bright, #22d3ee) !important;
          border-color: rgba(34,211,238,0.35) !important;
          background: rgba(34,211,238,0.06) !important;
        }
        .footer-quick-link:hover {
          color: var(--cyan-bright, #22d3ee) !important;
        }
      `}</style>

      <footer
        style={{
          background: "var(--void, #05030a)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated shimmer line at top */}
        <div className="footer-shimmer-line" />

        {/* Watermark "HKH" */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "clamp(20px, 5vw, 60px)",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            fontSize: "20vw",
            lineHeight: 1,
            color: "#fff",
            opacity: 0.04,
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
            letterSpacing: "0.05em",
          }}
        >
          HKH
        </div>

        {/* Main grid */}
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: `clamp(60px, 8vw, 100px) 5vw 0`,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "1.6fr 1fr 1.4fr",
              gap: isMobile ? 40 : 56,
              marginBottom: 56,
            }}
          >
            {/* ── Col 1: Brand ── */}
            <div style={isMobile ? { gridColumn: "1 / -1" } : {}}>
              {/* Logo */}
              <div
                style={{
                  fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                  fontSize: 36,
                  letterSpacing: "0.1em",
                  color: "#fff",
                  marginBottom: 12,
                  lineHeight: 1,
                }}
              >
                <span style={{ color: "var(--cyan-bright, #22d3ee)" }}>HKH</span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>™</span>
              </div>

              <p style={{
                fontFamily: "var(--font-barlow)",
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.65,
                maxWidth: 240,
                marginBottom: 28,
              }}>
                Premium hookah experiences, curated flavours, and luxury rentals — wherever the vibe takes you.
              </p>

              {/* Social links */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="footer-social-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "9px 13px",
                      borderRadius: 8,
                      background: "transparent",
                      textDecoration: "none",
                      cursor: "none",
                      minHeight: 44,
                      transition: "color 0.2s, border-color 0.2s, background 0.2s",
                    }}
                  >
                    {icon}
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Col 2: Quick links ── */}
            <div>
              <h4 style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 20,
              }}>
                Navigate
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {QUICK_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => scrollTo(href)}
                      className="footer-quick-link"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "none",
                        fontFamily: "var(--font-barlow)",
                        fontSize: 14,
                        color: "rgba(255,255,255,0.5)",
                        textAlign: "left",
                        padding: "9px 0",
                        minHeight: 44,
                        display: "block",
                        width: "100%",
                        transition: "color 0.2s",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 3: Contact + Newsletter ── */}
            <div style={isMobile ? { gridColumn: "1 / -1" } : {}}>
              <h4 style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 20,
              }}>
                Contact
              </h4>

              {/* Contact info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                <a
                  href="mailto:hello@hkh.co"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                    padding: "4px 0",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cyan-bright)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  hello@hkh.co
                </a>
                <a
                  href="tel:+254700000000"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                    padding: "4px 0",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cyan-bright)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  +254 700 000 000
                </a>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.3)",
                  margin: 0,
                  letterSpacing: "0.05em",
                }}>
                  Nairobi, Kenya
                </p>
              </div>

              {/* Newsletter */}
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom separator */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

          {/* Bottom bar */}
          <div
            style={{
              padding: isMobile ? "20px 0" : "24px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(10px, 2vw, 12px)",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.08em",
              margin: 0,
            }}>
              © 2026 HKH™ · All rights reserved
            </p>

            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(10px, 2vw, 12px)",
              color: "rgba(255,255,255,0.15)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: 0,
            }}>
              Built different.
            </p>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {["Privacy", "Terms", "Cookies"].map((t) => (
                <a
                  key={t}
                  href="#"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(10px, 2vw, 12px)",
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.08em",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                >
                  {t}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
