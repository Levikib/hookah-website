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
  const cartCount = useStore((s) => s.cartCount());
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setBookingOpen = useStore((s) => s.setBookingOpen);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
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

      {/* Center links */}
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
              padding: 0,
              transition: "color 0.2s",
              borderBottom: activeSection === href
                ? "1px solid var(--teal)"
                : "1px solid transparent",
              paddingBottom: 2,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right — Book Now + Cart */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={() => setBookingOpen(true)}
          className="btn-teal"
          style={{ fontSize: 13, padding: "9px 20px" }}
        >
          Book Now
        </button>

        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: "relative",
            width: 40,
            height: 40,
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
      </div>
    </nav>
  );
}
