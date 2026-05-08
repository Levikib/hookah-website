"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

const NAV_LINKS = [
  { label: "Sessions", href: "#sessions" },
  { label: "Flavours", href: "#flavours" },
  { label: "Rentals", href: "#rentals" },
];

export default function Navigation() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useStore((s) => s.cartCount());
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setBookingOpen = useStore((s) => s.setBookingOpen);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "0 5vw",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: visible ? "rgba(10,10,15,0.88)" : "transparent",
          backdropFilter: visible ? "blur(20px)" : "none",
          borderBottom: visible ? "1px solid rgba(255,255,255,0.07)" : "none",
          transition: "background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: 22,
            letterSpacing: "0.1em",
            color: "#fff",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: "var(--teal)" }}>Hookah</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginLeft: 4 }}>
            ™
          </span>
        </button>

        {/* Center links — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                style={{
                  fontFamily: "var(--font-barlow)",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: activeSection === href
                    ? "var(--teal)"
                    : "rgba(255,255,255,0.65)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px 8px",
                  transition: "color 0.2s",
                  borderBottom: activeSection === href
                    ? "1px solid var(--teal)"
                    : "1px solid transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Book Now — desktop only */}
          {!isMobile && (
            <button
              onClick={() => setBookingOpen(true)}
              className="btn-teal"
              style={{ fontSize: 13, padding: "10px 20px", minHeight: 44 }}
            >
              Book Now
            </button>
          )}

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            style={{
              position: "relative",
              width: 44,
              height: 44,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 18,
            }}
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "var(--teal)",
                  color: "#000",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{
                width: 44,
                height: 44,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={{ width: 22, height: 2, background: "#fff", borderRadius: 2, display: "block" }} />
              <span style={{ width: 22, height: 2, background: "#fff", borderRadius: 2, display: "block" }} />
              <span style={{ width: 22, height: 2, background: "#fff", borderRadius: 2, display: "block" }} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile full-screen overlay menu */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            background: "rgba(5,3,10,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: "absolute",
              top: 12,
              right: "5vw",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              fontSize: 26,
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Nav links */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 48,
              marginBottom: 64,
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: 48,
                  color: "#fff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: 0,
                  lineHeight: 1,
                  transition: "color 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Book Now CTA */}
          <button
            onClick={() => { setMenuOpen(false); setBookingOpen(true); }}
            className="btn-teal"
            style={{
              width: "100%",
              maxWidth: 280,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            BOOK NOW
          </button>

          {/* Cart in overlay */}
          <button
            onClick={() => { setMenuOpen(false); setCartOpen(true); }}
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-barlow)",
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 20 }}>🛒</span>
            Cart
            {cartCount > 0 && (
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "var(--teal)",
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
