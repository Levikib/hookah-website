"use client";
import { useState } from "react";
import { SERVICES } from "@/data/services";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

export default function ServicesSection() {
  const isMobile = useIsMobile();
  const { setBookingOpen, setBookingService, resetBooking } = useStore();
  const [featured, setFeatured] = useState(0);

  const service = SERVICES[featured];

  const openBooking = (idx: number) => {
    resetBooking();
    setBookingService(SERVICES[idx]);
    setBookingOpen(true);
  };

  return (
    <section id="services" style={{ background: "var(--sv-black)", padding: "clamp(48px, 8vw, 96px) 0", position: "relative", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "0 5vw", marginBottom: 32 }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--sv-red-bright)",
          marginBottom: 12,
        }}>
          Smokers Vine · Services
        </p>
        <h2 style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(32px, 6vw, 56px)",
          letterSpacing: "0.04em",
          color: "#fff",
        }}>
          Hosting An Event?
        </h2>
        <p style={{ fontFamily: "var(--font-barlow)", fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 8, maxWidth: 480 }}>
          We got you covered — servers, accessories, flavours & logistics, handled.
        </p>
      </div>

      {/* Spotlight banner — featured service */}
      <div style={{
        position: "relative",
        margin: "0 5vw 32px",
        borderRadius: 20,
        overflow: "hidden",
        minHeight: isMobile ? 320 : 380,
        display: "flex",
        alignItems: "center",
        background: `radial-gradient(ellipse 120% 100% at 30% 50%, ${service.gradientFrom} 0%, ${service.gradientTo} 55%, #05030a 100%)`,
        transition: "background 0.5s ease",
      }}>
        <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "40px 24px" : "0 60px", maxWidth: 560 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{service.emoji}</div>
          <h3 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(30px, 5vw, 48px)",
            letterSpacing: "0.03em",
            color: "#fff",
            marginBottom: 10,
            lineHeight: 1,
          }}>
            {service.name}
          </h3>
          <p style={{ fontFamily: "var(--font-barlow)", fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>
            {service.tagline}
          </p>
          <p style={{ fontFamily: "var(--font-barlow)", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 18 }}>
            {service.vibe}
          </p>

          {service.included.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {service.included.map((item) => (
                <span key={item} style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  color: "rgba(255,255,255,0.8)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 999,
                  padding: "5px 12px",
                }}>
                  {item}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <button
              onClick={() => openBooking(featured)}
              className="btn-teal"
              style={{ fontSize: 14, minHeight: 44 }}
            >
              {service.isCustom ? "Tell Us What You Need →" : "Book This →"}
            </button>
            {!service.isCustom && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--gold)" }}>
                {service.priceEstimated ? "Est. from " : "From "}{kes(service.startingPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Service picker row */}
      <div style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        padding: "4px 5vw 8px",
        scrollbarWidth: "none",
      }}>
        {SERVICES.map((s, idx) => {
          const isActive = idx === featured;
          return (
            <button
              key={s.id}
              onClick={() => setFeatured(idx)}
              style={{
                flex: "0 0 auto",
                minWidth: 160,
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 14,
                background: isActive ? "rgba(225,29,46,0.14)" : "var(--sv-charcoal)",
                border: `2px solid ${isActive ? "var(--sv-red-bright)" : "rgba(255,255,255,0.08)"}`,
                cursor: "pointer",
                minHeight: 44,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.emoji}</div>
              <div style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: 13,
                color: isActive ? "var(--sv-red-bright)" : "#fff",
              }}>
                {s.name}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
