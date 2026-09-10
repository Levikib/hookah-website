"use client";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

// Drop a Veo-generated video per slide at these paths and set `videoEnabled`
// to true on that slide — it swaps in automatically, no other changes
// needed. Slides with `videoEnabled: false` (or a missing file) fall back
// to their gradient placeholder.
const FEATURED = [
  {
    eyebrow: "Smokers Vine",
    title: "Feel The Vibe",
    subtitle: "Professional hookah service for parties, weddings, and events — delivered across Nairobi.",
    cta: "Book Your Event",
    videoSrc: "/videos/hero-1.mp4",
    videoEnabled: true,
    fallbackGradient: "radial-gradient(ellipse 130% 90% at 70% 40%, #3a0a10 0%, #150408 45%, #05030a 85%)",
  },
  {
    eyebrow: "Premium Blends",
    title: "Load The Bowl",
    subtitle: "Lady Killer, Love 69, and a full mint & fruit lineup — order flavours or full pots.",
    cta: "Explore Flavours",
    videoSrc: "/videos/hero-2.mp4",
    videoEnabled: true,
    fallbackGradient: "radial-gradient(ellipse 130% 90% at 70% 40%, #2a0a12 0%, #150408 45%, #05030a 85%)",
  },
  {
    eyebrow: "Sale & Rental",
    title: "Own The Setup",
    subtitle: "Hookah pots for sale or rent, coconut & self-lighting coals included.",
    cta: "View Pots",
    videoSrc: "/videos/hero-3.mp4",
    videoEnabled: true,
    fallbackGradient: "radial-gradient(ellipse 130% 90% at 70% 40%, #3a0d0a 0%, #150408 45%, #05030a 85%)",
  },
];

export default function HeroSpotlight() {
  const isMobile = useIsMobile();
  const { setBookingOpen, resetBooking } = useStore();
  const [active, setActive] = useState(0);

  const slide = FEATURED[active];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCta = () => {
    if (active === 0) { resetBooking(); setBookingOpen(true); }
    else if (active === 1) scrollTo("flavours");
    else scrollTo("rentals");
  };

  return (
    <section
      id="home"
      style={{
        position: "relative",
        height: isMobile ? "100svh" : "100vh",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        paddingBottom: isMobile ? 60 : 0,
        overflow: "hidden",
        background: "var(--sv-black)",
      }}
    >
      {/* Background — per-slide video when available, gradient placeholder otherwise */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {FEATURED.map((f, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              opacity: i === active ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            {f.videoEnabled ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              >
                <source src={f.videoSrc} type="video/mp4" />
              </video>
            ) : (
              <div style={{ position: "absolute", inset: 0, background: f.fallbackGradient }} />
            )}
          </div>
        ))}
        {/* Ambient smoke glow accent */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(225,29,46,0.25) 0%, transparent 70%)",
          top: "-15%", right: "-10%",
          filter: "blur(10px)",
        }} />
      </div>

      {/* Legibility scrim — edge-to-edge base contrast */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: isMobile
          ? "linear-gradient(to top, rgba(5,3,10,0.97) 0%, rgba(5,3,10,0.8) 35%, rgba(5,3,10,0.25) 60%, transparent 100%)"
          : "linear-gradient(to right, rgba(5,3,10,0.96) 0%, rgba(5,3,10,0.75) 34%, rgba(5,3,10,0.15) 55%, transparent 100%)",
      }} />

      {/* Extra contrast panel directly behind the text block — guarantees
          legibility regardless of what's playing behind it */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        background: isMobile
          ? "radial-gradient(ellipse 110% 75% at 50% 100%, rgba(5,3,10,0.92) 0%, transparent 70%)"
          : "radial-gradient(ellipse 55% 65% at 20% 52%, rgba(5,3,10,0.6) 0%, transparent 75%)",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        maxWidth: isMobile ? "100%" : 680,
        padding: isMobile ? "0 6vw" : "0 7vw",
        paddingTop: isMobile ? 100 : 120,
      }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--sv-red-bright)",
          marginBottom: 20,
          textShadow: "0 2px 10px rgba(0,0,0,0.8)",
        }}>
          ( {slide.eyebrow} )
        </p>

        <h1 style={{
          fontFamily: "var(--font-bebas)",
          fontWeight: 400,
          fontSize: isMobile ? "clamp(54px, 15vw, 84px)" : "clamp(80px, 8.5vw, 128px)",
          lineHeight: 0.98,
          letterSpacing: "0.005em",
          textTransform: "uppercase",
          color: "#ffffff",
          marginBottom: 24,
          textShadow: "0 4px 28px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.5)",
        }}>
          {slide.title}
        </h1>

        <p style={{
          fontFamily: "var(--font-barlow)",
          fontSize: isMobile ? 15 : 17,
          lineHeight: 1.7,
          color: "rgba(245,246,250,0.85)",
          marginBottom: 32,
          maxWidth: 420,
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}>
          {slide.subtitle}
        </p>

        <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row", marginBottom: 40 }}>
          <button
            className="btn-teal"
            style={{ fontSize: 13, letterSpacing: "0.08em" }}
            onClick={handleCta}
          >
            {slide.cta} ↗
          </button>
          <a
            href="https://wa.me/254746621663"
            className="btn-ghost"
            style={{ fontSize: 13, letterSpacing: "0.08em", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Slide selector — arrow scrub, PS5-style */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setActive((a) => (a - 1 + FEATURED.length) % FEATURED.length)}
            aria-label="Previous"
            style={{
              width: 44, height: 44, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)",
              color: "#fff", fontSize: 18, cursor: "pointer",
            }}
          >‹</button>
          <div style={{ display: "flex", gap: 6 }}>
            {FEATURED.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === active ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === active ? "var(--sv-red-bright)" : "rgba(255,255,255,0.25)",
                  border: "none", cursor: "pointer", transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setActive((a) => (a + 1) % FEATURED.length)}
            aria-label="Next"
            style={{
              width: 44, height: 44, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)",
              color: "#fff", fontSize: 18, cursor: "pointer",
            }}
          >›</button>
        </div>
      </div>
    </section>
  );
}
