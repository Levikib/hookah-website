"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

const NAV_LINKS = [
  { label: "Sessions",  href: "#sessions"  },
  { label: "Flavours",  href: "#flavours"  },
  { label: "Rentals",   href: "#rentals"   },
];

const SECTIONS = ["home", "sessions", "flavours", "rentals", "shop"];

export default function Navigation() {
  const [visible, setVisible]         = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const isMobile                      = useIsMobile();
  const [menuOpen, setMenuOpen]       = useState(false);

  const cartCount    = useStore((s) => s.cartCount());
  const prevCartCount = useRef(cartCount);
  const setCartOpen  = useStore((s) => s.setCartOpen);
  const setBookingOpen = useStore((s) => s.setBookingOpen);

  // Ember indicator refs
  const emberRef     = useRef<HTMLDivElement>(null);
  const linkRefs     = useRef<(HTMLButtonElement | null)[]>([]);
  const navCenterRef = useRef<HTMLDivElement>(null);

  // Hamburger bar refs
  const bar1Ref = useRef<HTMLSpanElement>(null);
  const bar2Ref = useRef<HTMLSpanElement>(null);
  const bar3Ref = useRef<HTMLSpanElement>(null);

  // Cart badge ref for pulse animation
  const cartBadgeRef = useRef<HTMLSpanElement>(null);

  // ---------- scroll visibility ----------
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- close menu on resize to desktop ----------
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  // ---------- IntersectionObserver for active section ----------
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${id}`);
          }
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // ---------- Ember indicator moves to active link ----------
  useEffect(() => {
    if (isMobile) return;
    const idx = NAV_LINKS.findIndex((l) => l.href === activeSection);
    if (idx === -1 || !emberRef.current || !navCenterRef.current) return;

    const linkEl = linkRefs.current[idx];
    if (!linkEl) return;

    const navRect  = navCenterRef.current.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    const targetLeft = linkRect.left - navRect.left + linkRect.width / 2 - 4; // centre the 8px ember

    gsap.to(emberRef.current, {
      left: targetLeft,
      opacity: 1,
      duration: 0.45,
      ease: "power3.out",
    });
  }, [activeSection, isMobile]);

  // ---------- Cart badge pulse when items added ----------
  useEffect(() => {
    if (cartCount > prevCartCount.current && cartBadgeRef.current) {
      gsap.fromTo(
        cartBadgeRef.current,
        { scale: 1 },
        { scale: 1.3, duration: 0.18, ease: "power2.out",
          onComplete: () => {
            if (cartBadgeRef.current) {
              gsap.to(cartBadgeRef.current, { scale: 1, duration: 0.18, ease: "power2.in" });
            }
          }
        }
      );
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  // ---------- Hamburger → X morph ----------
  const animateHamburgerOpen = useCallback((open: boolean) => {
    if (!bar1Ref.current || !bar2Ref.current || !bar3Ref.current) return;
    if (open) {
      gsap.to(bar1Ref.current, { rotate: 45, y: 7,  duration: 0.3, ease: "power2.inOut" });
      gsap.to(bar2Ref.current, { opacity: 0, scaleX: 0, duration: 0.2, ease: "power2.in" });
      gsap.to(bar3Ref.current, { rotate: -45, y: -7, duration: 0.3, ease: "power2.inOut" });
    } else {
      gsap.to(bar1Ref.current, { rotate: 0, y: 0,  duration: 0.3, ease: "power2.inOut" });
      gsap.to(bar2Ref.current, { opacity: 1, scaleX: 1, duration: 0.2, ease: "power2.out", delay: 0.1 });
      gsap.to(bar3Ref.current, { rotate: 0, y: 0,  duration: 0.3, ease: "power2.inOut" });
    }
  }, []);

  const toggleMenu = (next: boolean) => {
    setMenuOpen(next);
    animateHamburgerOpen(next);
  };

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    animateHamburgerOpen(false);
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
          borderBottom: visible
            ? "1px solid rgba(255,255,255,0.07)"
            : "none",
          transition:
            "background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease",
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
            cursor: "none",
            padding: 0,
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: "var(--teal)" }}>HKH</span>
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              marginLeft: 4,
            }}
          >
            ™
          </span>
        </button>

        {/* Center links — desktop only */}
        {!isMobile && (
          <div
            ref={navCenterRef}
            style={{
              display: "flex",
              gap: 32,
              alignItems: "center",
              position: "relative",
            }}
          >
            {NAV_LINKS.map(({ label, href }, idx) => {
              const isActive = activeSection === href;
              return (
                <button
                  key={label}
                  ref={(el) => { linkRefs.current[idx] = el; }}
                  onClick={() => scrollTo(href)}
                  style={{
                    fontFamily: "var(--font-barlow)",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: isActive
                      ? "var(--cyan-bright)"
                      : "rgba(255,255,255,0.65)",
                    background: "none",
                    border: "none",
                    cursor: "none",
                    padding: "10px 8px",
                    transition: "color 0.25s, text-shadow 0.25s",
                    textShadow: isActive
                      ? "0 0 16px rgba(34,211,238,0.6)"
                      : "none",
                    position: "relative",
                  }}
                >
                  {label}
                </button>
              );
            })}

            {/* Sliding ember indicator */}
            <div
              ref={emberRef}
              style={{
                position: "absolute",
                bottom: 4,
                left: 0,
                width: 8,
                height: 2,
                borderRadius: 2,
                background: "var(--gold, #f59e0b)",
                boxShadow: "0 0 8px var(--gold, #f59e0b)",
                opacity: 0,
                pointerEvents: "none",
                transition: "none", // GSAP handles it
              }}
            />
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
              cursor: "none",
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
                ref={cartBadgeRef}
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
                  transformOrigin: "center",
                }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => toggleMenu(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
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
                cursor: "none",
                padding: 0,
              }}
            >
              <span
                ref={bar1Ref}
                style={{
                  width: 22,
                  height: 2,
                  background: "#fff",
                  borderRadius: 2,
                  display: "block",
                  transformOrigin: "center",
                }}
              />
              <span
                ref={bar2Ref}
                style={{
                  width: 22,
                  height: 2,
                  background: "#fff",
                  borderRadius: 2,
                  display: "block",
                }}
              />
              <span
                ref={bar3Ref}
                style={{
                  width: 22,
                  height: 2,
                  background: "#fff",
                  borderRadius: 2,
                  display: "block",
                  transformOrigin: "center",
                }}
              />
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
                  cursor: "none",
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
            onClick={() => {
              setMenuOpen(false);
              animateHamburgerOpen(false);
              setBookingOpen(true);
            }}
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
            onClick={() => {
              setMenuOpen(false);
              animateHamburgerOpen(false);
              setCartOpen(true);
            }}
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "none",
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
