"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SESSIONS, CUSTOM_PRICING, type SessionTier } from "@/data/sessions";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

gsap.registerPlugin(ScrollTrigger);

// ─── Lanyard rail + card ─────────────────────────────────────────────────────

function LanyardRope({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 2,
        height: 32,
        background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, ${color}88 100%)`,
        margin: "0 auto",
        borderRadius: 1,
        flexShrink: 0,
      }}
    />
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ opacity: 0.7 }}>
      <circle cx="7" cy="4" r="2.5" />
      <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" strokeWidth="0" />
    </svg>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  session,
  onClose,
  onBook,
}: {
  session: SessionTier | null;
  onClose: () => void;
  onBook: (s: SessionTier) => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerRef.current) return;
    if (session) {
      gsap.fromTo(
        drawerRef.current,
        { y: "100%" },
        { y: "0%", duration: 0.4, ease: "back.out(1.4)" }
      );
    } else {
      gsap.to(drawerRef.current, { y: "100%", duration: 0.28, ease: "power2.in" });
    }
  }, [session]);

  if (!session) return null;

  const peopleCount =
    typeof session.people === "number" ? session.people : 10;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(5,3,10,0.6)",
          zIndex: 90,
          backdropFilter: "blur(4px)",
        }}
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60vh",
          background: "var(--nebula-mid)",
          borderTop: `2px solid ${session.color}`,
          borderRadius: "20px 20px 0 0",
          zIndex: 95,
          overflowY: "auto",
          padding: "32px 28px 40px",
          transform: "translateY(100%)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            margin: "0 auto 28px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: session.color,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Mission Intel
            </p>
            <h3
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: 36,
                color: "#fff",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {session.name}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-barlow)",
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
                marginTop: 4,
              }}
            >
              {session.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              padding: "6px 14px",
              flexShrink: 0,
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 24,
            padding: "16px 20px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Duration
            </p>
            <p
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
              }}
            >
              {session.duration}
            </p>
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Capacity
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", gap: 2, color: session.color }}>
                {Array.from({ length: Math.min(peopleCount, 10) }).map((_, i) => (
                  <PersonIcon key={i} />
                ))}
                {peopleCount > 10 && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: session.color,
                      marginLeft: 2,
                    }}
                  >
                    +{peopleCount - 10}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-barlow)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#fff",
                }}
              >
                {session.people} {typeof session.people === "number" ? "people" : ""}
              </span>
            </div>
          </div>
          {!session.isCustom && (
            <div style={{ marginLeft: "auto" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Price
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 22,
                  color: "var(--gold)",
                  fontWeight: 700,
                }}
              >
                ${session.price.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Equipment list */}
        {session.equipment.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Equipment Loadout
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 8,
              }}
            >
              {session.equipment.map((eq) => (
                <div
                  key={eq}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--font-barlow)",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  <span style={{ color: session.color, fontSize: 12 }}>✓</span>
                  {eq}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom pricing breakdown */}
        {session.isCustom && (
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Base Pricing
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "Base setup", value: `$${CUSTOM_PRICING.base}` },
                { label: "Per hookah", value: `$${CUSTOM_PRICING.perHookah}` },
                { label: "Per person", value: `$${CUSTOM_PRICING.perPerson}` },
                { label: "Per flavour", value: `$${CUSTOM_PRICING.perFlavour}` },
                { label: "Extra hour", value: `$${CUSTOM_PRICING.extraHour}` },
                { label: "Host/hr", value: `$${CUSTOM_PRICING.hostPerHour}` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(255,107,53,0.08)",
                    border: "1px solid rgba(255,107,53,0.2)",
                    borderRadius: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  <span style={{ color: "var(--orange)" }}>{value}</span> {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book button */}
        <button
          onClick={() => onBook(session)}
          className="btn-primary"
          style={{ width: "100%", fontSize: 14, minHeight: 52 }}
        >
          {session.isCustom ? "+ Design Your Mission" : "Book Now →"}
        </button>
      </div>
    </>
  );
}

// ─── Session Pass Card ────────────────────────────────────────────────────────

function PassCard({
  session,
  index,
  onSelect,
  isMobile,
}: {
  session: SessionTier;
  index: number;
  onSelect: (s: SessionTier) => void;
  isMobile: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const swingTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Gentle idle swing
    const delay = Math.random() * 1.5;
    const duration = 2.8 + Math.random() * 1.2;
    swingTween.current = gsap.to(cardRef.current, {
      rotation: -1 + Math.random() * 2,
      duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay,
      transformOrigin: "50% 0%",
    });

    return () => {
      swingTween.current?.kill();
    };
  }, []);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    swingTween.current?.pause();
    gsap.to(cardRef.current, {
      rotation: -3,
      scale: 1.03,
      duration: 0.25,
      ease: "power2.out",
      boxShadow: `0 16px 48px ${session.color}44, 0 0 0 1px ${session.color}66`,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotation: 0,
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
      boxShadow: "none",
      onComplete: () => swingTween.current?.resume(),
    });
  };

  const handleClick = () => {
    if (!cardRef.current) return;
    swingTween.current?.pause();
    gsap.to(cardRef.current, {
      scale: 1.05,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: "power2.inOut" });
        onSelect(session);
      },
    });
  };

  const isCustom = session.isCustom;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {/* Lanyard rope */}
      {!isMobile && <LanyardRope color={session.color} />}

      {/* Card */}
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: isMobile ? "100%" : 320,
          height: isMobile ? "auto" : 200,
          background: isCustom
            ? "rgba(255,107,53,0.07)"
            : "rgba(13,10,30,0.92)",
          border: `1px solid ${session.color}44`,
          borderRadius: 10,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: "hidden",
          position: "relative",
          transformOrigin: "50% 0%",
          willChange: "transform",
          transition: "border-color 0.2s",
        }}
      >
        {/* CLASSIFIED watermark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: isMobile ? 52 : 44,
              color: "#fff",
              opacity: 0.06,
              transform: "rotate(-25deg)",
              letterSpacing: "0.1em",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {isCustom ? "BUILD YOUR OWN" : "CLASSIFIED"}
          </span>
        </div>

        {/* Colored left stripe */}
        <div
          style={{
            width: isMobile ? "100%" : 36,
            height: isMobile ? 36 : "100%",
            background: session.color,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: 11,
              color: "rgba(0,0,0,0.75)",
              letterSpacing: "0.15em",
              transform: isMobile ? "none" : "rotate(-90deg)",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            {session.id}
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top row: name + popular badge */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: isMobile ? 24 : 22,
                  color: "#fff",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                {session.name}
              </h3>
              {session.popular && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 7,
                    letterSpacing: "0.1em",
                    color: "var(--gold)",
                    border: "1px solid var(--gold)",
                    padding: "2px 6px",
                    borderRadius: 3,
                    background: "rgba(245,158,11,0.12)",
                    flexShrink: 0,
                    marginLeft: 6,
                  }}
                >
                  ★ MOST POPULAR
                </div>
              )}
            </div>
            <p
              style={{
                fontFamily: "var(--font-barlow)",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.35,
                marginBottom: 8,
              }}
            >
              {session.tagline}
            </p>

            {/* Duration + people chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: session.color,
                  background: `${session.color}18`,
                  border: `1px solid ${session.color}33`,
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                ⏱ {session.duration}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                👥 {session.people}
                {typeof session.people === "number" ? " people" : ""}
              </span>
            </div>
          </div>

          {/* Bottom strip: price + button */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div>
              {!isCustom ? (
                <>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 7,
                      letterSpacing: "0.15em",
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                    }}
                  >
                    from
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 20,
                      color: "var(--gold)",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    ${session.price.toFixed(2)}
                  </p>
                </>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--orange)",
                    letterSpacing: "0.05em",
                  }}
                >
                  from ${CUSTOM_PRICING.base}/session
                </p>
              )}
            </div>
            <button
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: isCustom ? "var(--orange)" : session.color,
                color: isCustom ? "#fff" : "rgba(0,0,0,0.85)",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                whiteSpace: "nowrap",
              }}
            >
              {isCustom ? "+ DESIGN MISSION" : "BOOK MISSION"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function SessionsSection() {
  const setBookingOpen = useStore((s) => s.setBookingOpen);
  const setBookingSession = useStore((s) => s.setBookingSession);
  const isMobile = useIsMobile();

  const [selectedSession, setSelectedSession] = useState<SessionTier | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Section entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !cardsRef.current) return;

      const cards = cardsRef.current.querySelectorAll<HTMLElement>(".pass-unit");

      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      // Stamp reveal
      if (stampRef.current) {
        gsap.fromTo(
          stampRef.current,
          { opacity: 0, scale: 1.4, rotation: -12 },
          {
            opacity: 1,
            scale: 1,
            rotation: -8,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: 0.3,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSelectSession = useCallback((session: SessionTier) => {
    if (session.isCustom) {
      setBookingSession(session);
      setBookingOpen(true);
    } else {
      setSelectedSession(session);
    }
  }, [setBookingSession, setBookingOpen]);

  const handleBook = useCallback((session: SessionTier) => {
    setBookingSession(session);
    setBookingOpen(true);
    setSelectedSession(null);
  }, [setBookingSession, setBookingOpen]);

  const handleCloseDrawer = useCallback(() => {
    setSelectedSession(null);
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="sessions"
        style={{
          background: "var(--nebula)",
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(124,58,237,0.04) 39px,
              rgba(124,58,237,0.04) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(124,58,237,0.04) 39px,
              rgba(124,58,237,0.04) 40px
            )
          `,
          minHeight: "100vh",
          padding: "clamp(60px, 8vw, 100px) 0 80px",
          overflow: "hidden",
        }}
      >
        {/* ── Section Header ── */}
        <div
          ref={headerRef}
          style={{
            textAlign: "center",
            marginBottom: isMobile ? 40 : 0,
            padding: "0 5vw",
            position: "relative",
          }}
        >
          <p className="section-label" style={{ justifyContent: "center" }}>
            INTEL REPORT
          </p>

          <div style={{ position: "relative", display: "inline-block" }}>
            <h2
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(52px, 8vw, 110px)",
                color: "var(--text-primary)",
                letterSpacing: "0.04em",
                lineHeight: 0.9,
                textTransform: "uppercase",
              }}
            >
              CHOOSE YOUR
              <br />
              <span style={{ color: "var(--gold)" }}>MISSION</span>
            </h2>

            {/* CLASSIFIED red stamp */}
            <div
              ref={stampRef}
              style={{
                position: "absolute",
                top: "8%",
                right: isMobile ? "-8%" : "-12%",
                opacity: 0,
                transform: "rotate(-8deg)",
                border: "3px solid #dc2626",
                borderRadius: 4,
                padding: "4px 12px",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: isMobile ? 18 : 26,
                  color: "#dc2626",
                  letterSpacing: "0.15em",
                  opacity: 0.85,
                }}
              >
                CLASSIFIED
              </span>
            </div>
          </div>

          <p
            style={{
              fontFamily: "var(--font-barlow)",
              fontSize: 16,
              color: "rgba(255,255,255,0.45)",
              marginTop: 16,
              maxWidth: 480,
              margin: "16px auto 0",
            }}
          >
            8 tiers. Every occasion. Select your dossier and we handle the rest.
          </p>
        </div>

        {/* ── Lanyard Rail (desktop only) ── */}
        {!isMobile && (
          <div
            ref={railRef}
            style={{
              height: 3,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 10%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 90%, transparent 100%)",
              margin: "24px 0 0",
              position: "relative",
            }}
          >
            {/* Rail end hooks */}
            <div
              style={{
                position: "absolute",
                left: "5vw",
                top: "50%",
                transform: "translateY(-50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.3)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "5vw",
                top: "50%",
                transform: "translateY(-50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.3)",
              }}
            />
          </div>
        )}

        {/* ── Pass Cards ── */}
        <div
          ref={cardsRef}
          className="no-scrollbar"
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 16 : 20,
            overflowX: isMobile ? "visible" : "auto",
            padding: isMobile ? "0 5vw" : "0 5vw 24px",
            marginTop: isMobile ? 40 : 0,
            alignItems: isMobile ? "stretch" : "flex-start",
          }}
        >
          {SESSIONS.map((session, i) => (
            <div
              key={session.id}
              className="pass-unit"
              style={{ opacity: 0, flexShrink: 0 }}
            >
              <PassCard
                session={session}
                index={i}
                onSelect={handleSelectSession}
                isMobile={isMobile}
              />
            </div>
          ))}
        </div>

        {/* ── Footer note ── */}
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            padding: "0 5vw",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
            }}
          >
            All missions include setup · teardown · premium coal management
          </p>
        </div>
      </section>

      {/* ── Detail Drawer ── */}
      {selectedSession && (
        <DetailDrawer
          session={selectedSession}
          onClose={handleCloseDrawer}
          onBook={handleBook}
        />
      )}
    </>
  );
}
