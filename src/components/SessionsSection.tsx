"use client";
import React, {
  useRef, useEffect, useState, useCallback, memo,
} from "react";
import { gsap } from "gsap";
import { SESSIONS, type SessionTier } from "@/data/sessions";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

function kes(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

// ─── Per-session door personality ────────────────────────────────────────────
const DOOR_META: Record<string, {
  lightColor: string;
  glowColor: string;
  wallPos: "left" | "right";
  doorStyle: "narrow" | "wide" | "double" | "arch" | "steel" | "grand" | "exit" | "custom";
  bulbColor: string;
  ambientText: string;
}> = {
  solo:      { lightColor: "#f59e0b", glowColor: "rgba(245,158,11,",  wallPos: "left",  doorStyle: "narrow", bulbColor: "#f6c90e", ambientText: "single · still" },
  duo:       { lightColor: "#68d391", glowColor: "rgba(104,211,145,", wallPos: "left",  doorStyle: "wide",   bulbColor: "#68d391", ambientText: "close · quiet" },
  squad:     { lightColor: "#22d3ee", glowColor: "rgba(34,211,238,",  wallPos: "left",  doorStyle: "double", bulbColor: "#22d3ee", ambientText: "loud · alive" },
  vip:       { lightColor: "#f6c90e", glowColor: "rgba(246,201,14,",  wallPos: "left",  doorStyle: "arch",   bulbColor: "#ffd700", ambientText: "gold · hushed" },
  rooftop:   { lightColor: "#b794f4", glowColor: "rgba(183,148,244,", wallPos: "right", doorStyle: "exit",   bulbColor: "#c4b5fd", ambientText: "open · infinite" },
  corporate: { lightColor: "#63b3ed", glowColor: "rgba(99,179,237,",  wallPos: "right", doorStyle: "steel",  bulbColor: "#93c5fd", ambientText: "sharp · wired" },
  wedding:   { lightColor: "#f687b3", glowColor: "rgba(246,135,179,", wallPos: "right", doorStyle: "grand",  bulbColor: "#f9a8d4", ambientText: "forever · full" },
  custom:    { lightColor: "#ff6b35", glowColor: "rgba(255,107,53,",  wallPos: "right", doorStyle: "custom", bulbColor: "#ff6b35", ambientText: "anything · yours" },
};

// ─── Session Modal ────────────────────────────────────────────────────────────
const SessionModal = memo(function SessionModal({
  session, onClose, onBook,
}: { session: SessionTier; onClose: () => void; onBook: (s: SessionTier) => void }) {
  const meta    = DOOR_META[session.id] ?? DOOR_META.solo;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(panelRef.current, { y: 60, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" });
  }, []);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(panelRef.current, { y: 40, opacity: 0, scale: 0.95, duration: 0.2, onComplete: onClose });
  }, [onClose]);

  return (
    <div ref={overlayRef} onClick={e => e.target === overlayRef.current && close()}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div ref={panelRef} style={{
        width: "min(640px,100%)", background: "linear-gradient(160deg,#0d0920,#08041a)",
        border: `1px solid ${meta.lightColor}44`, borderTop: `3px solid ${meta.lightColor}`,
        borderRadius: 20, overflow: "hidden", position: "relative",
        boxShadow: `0 0 80px ${meta.glowColor}0.2), 0 40px 100px rgba(0,0,0,0.9)`,
      }}>
        {/* Header */}
        <div style={{
          padding: "32px 28px 24px",
          background: `linear-gradient(135deg, ${meta.glowColor}0.12) 0%, transparent 60%)`,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          position: "relative",
        }}>
          <button onClick={close} style={{
            position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 42, filter: `drop-shadow(0 0 12px ${meta.lightColor})` }}>{session.emoji}</span>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", color: meta.lightColor, textTransform: "uppercase", marginBottom: 4, opacity: 0.8 }}>
                {meta.ambientText}
              </p>
              <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,5vw,44px)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>
                {session.name}
              </h2>
            </div>
          </div>

          <p style={{ fontFamily: "var(--font-barlow)", fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.62)", maxWidth: 480 }}>
            {session.vibe}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px 28px" }}>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Duration", value: session.isCustom ? "Your call" : session.duration },
              { label: "People",   value: session.isCustom ? "Any" : String(session.people) },
              { label: "Mood",     value: session.mood },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: "1 1 100px" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-sora, var(--font-grotesk))", fontSize: 15, fontWeight: 600, color: meta.lightColor }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Equipment */}
          {!session.isCustom && session.equipment.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 10 }}>What&apos;s included</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {session.equipment.map(eq => (
                  <div key={eq} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: meta.lightColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-barlow)", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.isCustom && (
            <div style={{ marginBottom: 24, padding: "14px 16px", borderRadius: 12, background: `${meta.glowColor}0.08)`, border: `1px solid ${meta.lightColor}33` }}>
              <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                Tell us exactly what you want. Hookahs, people, duration, flavours, host, catering, backdrop — we build it from scratch. Use the Package Wizard below for a live price.
              </p>
            </div>
          )}

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 2 }}>Starting from</p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 34, color: meta.lightColor, lineHeight: 1, letterSpacing: "0.04em" }}>
                {session.isCustom ? "Custom" : kes(session.price)}
              </p>
            </div>
            <button onClick={close} style={{
              fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "12px 18px", borderRadius: 10, minHeight: 44,
              border: "1px solid rgba(255,255,255,0.12)", background: "transparent",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
            }}>Back</button>
            <button onClick={() => { onBook(session); close(); }} style={{
              fontFamily: "var(--font-bebas)", fontSize: 17, letterSpacing: "0.08em",
              padding: "12px 24px", borderRadius: 10, minHeight: 44,
              border: `1px solid ${meta.lightColor}`,
              background: `${meta.glowColor}0.18)`,
              color: meta.lightColor, cursor: "pointer",
              transition: "all 0.2s ease",
            }}>
              {session.isCustom ? "Open Wizard →" : "Book This →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Door SVG shapes ──────────────────────────────────────────────────────────
function DoorShape({ style: doorStyle, color, isHovered }: { style: string; color: string; isHovered: boolean }) {
  const c = color;
  const glow = isHovered ? `0 0 24px ${c}88` : `0 0 8px ${c}44`;

  // All doors share the same outer container sizing; just the inner shape differs
  if (doorStyle === "double") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", gap: 3 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            flex: 1, height: "100%", borderRadius: "4px 4px 0 0",
            border: `1px solid ${c}66`, borderBottom: "none",
            background: `linear-gradient(180deg, ${c}18 0%, ${c}06 60%, ${c}12 100%)`,
            boxShadow: glow,
            position: "relative", overflow: "hidden",
          }}>
            {/* Panel lines */}
            <div style={{ position: "absolute", top: "20%", left: "15%", right: "15%", height: "35%", border: `1px solid ${c}33`, borderRadius: 2 }} />
            <div style={{ position: "absolute", top: "62%", left: "15%", right: "15%", height: "25%", border: `1px solid ${c}33`, borderRadius: 2 }} />
            {/* Handle */}
            <div style={{ position: "absolute", top: "50%", right: i === 0 ? "12%" : "auto", left: i === 1 ? "12%" : "auto", width: 4, height: 18, borderRadius: 2, background: c, opacity: 0.7 }} />
          </div>
        ))}
      </div>
    );
  }

  if (doorStyle === "arch") {
    return (
      <div style={{
        width: "100%", height: "100%",
        border: `1px solid ${c}66`, borderBottom: "none",
        borderRadius: "50% 50% 0 0 / 20% 20% 0 0",
        background: `linear-gradient(180deg, ${c}20 0%, ${c}08 100%)`,
        boxShadow: glow,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "25%", left: "12%", right: "12%", height: "40%", border: `1px solid ${c}33`, borderRadius: "40% 40% 2px 2px / 15% 15% 2px 2px" }} />
        <div style={{ position: "absolute", top: "72%", left: "12%", right: "12%", height: "20%", border: `1px solid ${c}33`, borderRadius: 2 }} />
        <div style={{ position: "absolute", top: "52%", right: "14%", width: 5, height: 14, borderRadius: 2, background: c, opacity: 0.65 }} />
      </div>
    );
  }

  if (doorStyle === "steel") {
    return (
      <div style={{
        width: "100%", height: "100%",
        border: `2px solid ${c}88`, borderBottom: "none",
        borderRadius: "2px 2px 0 0",
        background: `linear-gradient(180deg, ${c}14 0%, rgba(20,30,50,0.9) 100%)`,
        boxShadow: glow,
        position: "relative", overflow: "hidden",
      }}>
        {/* Horizontal steel ribs */}
        {[20, 38, 56, 74].map(top => (
          <div key={top} style={{ position: "absolute", top: `${top}%`, left: 0, right: 0, height: 1, background: `${c}33` }} />
        ))}
        {/* Vertical center line */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: `${c}22` }} />
        {/* Handle */}
        <div style={{ position: "absolute", top: "48%", right: "10%", width: 6, height: 22, borderRadius: 3, background: c, opacity: 0.8 }} />
      </div>
    );
  }

  if (doorStyle === "grand") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", gap: 3 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            flex: 1, height: "100%",
            border: `1px solid ${c}77`, borderBottom: "none",
            borderRadius: "30% 30% 0 0 / 8% 8% 0 0",
            background: `linear-gradient(180deg, ${c}20 0%, ${c}0a 100%)`,
            boxShadow: glow,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "15%", left: "10%", right: "10%", height: "30%", border: `1px solid ${c}44`, borderRadius: "25% 25% 2px 2px / 10% 10% 2px 2px" }} />
            <div style={{ position: "absolute", top: "52%", left: "10%", right: "10%", height: "30%", border: `1px solid ${c}33`, borderRadius: 2 }} />
            {/* Gold handle ball */}
            <div style={{ position: "absolute", top: "50%", right: i === 0 ? "8%" : "auto", left: i === 1 ? "8%" : "auto", width: 8, height: 8, borderRadius: "50%", background: c }} />
          </div>
        ))}
      </div>
    );
  }

  if (doorStyle === "exit") {
    return (
      <div style={{
        width: "100%", height: "100%",
        border: `1px solid ${c}55`, borderBottom: "none",
        borderRadius: "3px 3px 0 0",
        background: `linear-gradient(180deg, rgba(180,200,255,0.08) 0%, ${c}08 100%)`,
        boxShadow: glow,
        position: "relative", overflow: "hidden",
      }}>
        {/* Staircase illusion */}
        {[60, 72, 84].map((top, ri) => (
          <div key={ri} style={{ position: "absolute", top: `${top}%`, left: `${ri * 12}%`, right: 0, height: 3, background: `${c}44` }} />
        ))}
        {/* EXIT sign */}
        <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", background: "#dc2626cc", padding: "2px 6px", borderRadius: 2 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "#fff", letterSpacing: "0.15em" }}>EXIT</span>
        </div>
        <div style={{ position: "absolute", top: "48%", right: "12%", width: 5, height: 14, borderRadius: 2, background: c, opacity: 0.7 }} />
      </div>
    );
  }

  if (doorStyle === "custom") {
    return (
      <div style={{
        width: "100%", height: "100%",
        border: `1px dashed ${c}77`, borderBottom: "none",
        borderRadius: "4px 4px 0 0",
        background: `repeating-linear-gradient(45deg, ${c}04 0px, ${c}04 4px, transparent 4px, transparent 12px)`,
        boxShadow: glow,
        position: "relative", overflow: "hidden",
      }}>
        {/* Plus symbol */}
        <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", color: c, fontSize: 28, fontFamily: "var(--font-mono)", opacity: 0.5 }}>+</div>
        <div style={{ position: "absolute", top: "52%", right: "12%", width: 5, height: 14, borderRadius: 2, background: c, opacity: 0.6 }} />
      </div>
    );
  }

  // wide / narrow (default)
  return (
    <div style={{
      width: "100%", height: "100%",
      border: `1px solid ${c}55`, borderBottom: "none",
      borderRadius: "4px 4px 0 0",
      background: `linear-gradient(180deg, ${c}18 0%, ${c}07 100%)`,
      boxShadow: glow,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "18%", left: "12%", right: "12%", height: "38%", border: `1px solid ${c}33`, borderRadius: 2 }} />
      <div style={{ position: "absolute", top: "62%", left: "12%", right: "12%", height: "24%", border: `1px solid ${c}33`, borderRadius: 2 }} />
      <div style={{ position: "absolute", top: "50%", right: "14%", width: 4, height: 14, borderRadius: 2, background: c, opacity: 0.65 }} />
    </div>
  );
}

// ─── Single Door ──────────────────────────────────────────────────────────────
function SmokeRoomDoor({
  session,
  index,
  wall,
  onEnter,
}: {
  session: SessionTier;
  index: number;  // 0-3 within its wall
  wall: "left" | "right";
  onEnter: (s: SessionTier) => void;
}) {
  const meta = DOOR_META[session.id];
  const [hovered, setHovered] = useState(false);
  const doorRef    = useRef<HTMLDivElement>(null);
  const lightRef   = useRef<HTMLDivElement>(null);
  const smokeRef   = useRef<HTMLDivElement>(null);
  const nameRef    = useRef<HTMLDivElement>(null);
  const crackRef   = useRef<HTMLDivElement>(null);

  // Door width varies by style
  const doorW = ["double","grand","wide"].includes(meta.doorStyle) ? 110 : meta.doorStyle === "arch" ? 90 : 80;

  // Vertical stagger — 4 doors per wall spread across the wall height
  const topPercents = ["14%", "33%", "55%", "74%"];
  const top = topPercents[index] ?? "40%";

  useEffect(() => {
    if (!doorRef.current) return;
    if (hovered) {
      gsap.to(doorRef.current,  { scale: 1.04, duration: 0.35, ease: "power2.out" });
      gsap.to(lightRef.current, { opacity: 1, scaleX: 1.6, scaleY: 1.4, duration: 0.45, ease: "power2.out" });
      gsap.to(smokeRef.current, { opacity: 0.9, y: -8, duration: 0.5, ease: "power2.out" });
      gsap.to(nameRef.current,  { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(crackRef.current, { opacity: 1, scaleX: 1, duration: 0.4, ease: "power2.out" });
    } else {
      gsap.to(doorRef.current,  { scale: 1, duration: 0.4, ease: "power2.out" });
      gsap.to(lightRef.current, { opacity: 0.35, scaleX: 1, scaleY: 1, duration: 0.5, ease: "power2.out" });
      gsap.to(smokeRef.current, { opacity: 0.35, y: 0, duration: 0.5, ease: "power2.out" });
      gsap.to(nameRef.current,  { opacity: 0, y: 6, duration: 0.25, ease: "power2.in" });
      gsap.to(crackRef.current, { opacity: 0, scaleX: 0, duration: 0.3, ease: "power2.in" });
    }
  }, [hovered]);

  const handleEnter = useCallback(() => {
    if (!doorRef.current) return;
    // Slam open: quick rotate then open modal
    gsap.to(doorRef.current, {
      rotateY: wall === "left" ? -35 : 35,
      duration: 0.35,
      ease: "power3.out",
      onComplete: () => {
        onEnter(session);
        gsap.to(doorRef.current, { rotateY: 0, duration: 0.4, ease: "power2.out", delay: 0.1 });
      },
    });
  }, [onEnter, session, wall]);

  return (
    <div style={{
      position: "absolute",
      top,
      [wall === "left" ? "left" : "right"]: "6%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: 10,
    }}>
      {/* Overhead bulb */}
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: meta.bulbColor,
        boxShadow: `0 0 ${hovered ? 20 : 10}px ${meta.bulbColor}, 0 0 ${hovered ? 40 : 20}px ${meta.glowColor}0.5)`,
        marginBottom: 6,
        transition: "box-shadow 0.4s ease",
      }} />

      {/* Wire from ceiling */}
      <div style={{ width: 1, height: 20, background: `rgba(255,255,255,0.15)`, marginBottom: 0 }} />

      {/* Door wrapper — perspective for the swinging effect */}
      <div style={{ perspective: 600, perspectiveOrigin: wall === "left" ? "0% 50%" : "100% 50%" }}>
        <div
          ref={doorRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleEnter}
          style={{
            width: doorW,
            height: doorW * 1.95,
            cursor: "pointer",
            position: "relative",
            transformStyle: "preserve-3d",
            transformOrigin: wall === "left" ? "left center" : "right center",
          }}
        >
          <DoorShape style={meta.doorStyle} color={meta.lightColor} isHovered={hovered} />

          {/* Light crack at door edge */}
          <div ref={crackRef} style={{
            position: "absolute",
            top: "5%", bottom: 0,
            [wall === "left" ? "right" : "left"]: -2,
            width: 3,
            background: `linear-gradient(180deg, transparent, ${meta.lightColor}, ${meta.lightColor}cc, transparent)`,
            opacity: 0,
            transformOrigin: wall === "left" ? "right center" : "left center",
            scaleX: 0,
            borderRadius: 2,
            filter: `blur(1px)`,
          } as React.CSSProperties} />

          {/* Nameplate */}
          <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 6, whiteSpace: "nowrap", pointerEvents: "none" }}>
            {/* Always-visible tag */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: 13, letterSpacing: "0.08em", color: meta.lightColor, lineHeight: 1, marginBottom: 1 }}>
                {session.name}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
                {session.isCustom ? "Custom" : kes(session.price)}
              </p>
            </div>
            {/* Hover tooltip */}
            <div ref={nameRef} style={{
              marginTop: 4, opacity: 0, transform: "translateY(6px)",
              background: "rgba(5,3,10,0.95)", border: `1px solid ${meta.lightColor}55`,
              borderRadius: 8, padding: "6px 10px", textAlign: "center",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.14em", color: meta.lightColor, textTransform: "uppercase" }}>
                {meta.ambientText} · Enter →
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floor light cone */}
      <div ref={lightRef} style={{
        width: doorW * 1.4,
        height: 60,
        background: `radial-gradient(ellipse at 50% 0%, ${meta.glowColor}0.55) 0%, ${meta.glowColor}0.2) 40%, transparent 75%)`,
        opacity: 0.35,
        transformOrigin: "top center",
        marginTop: -4,
        pointerEvents: "none",
        filter: "blur(2px)",
      }} />

      {/* Smoke seeping under the door */}
      <div ref={smokeRef} style={{
        width: doorW * 1.2,
        height: 18,
        marginTop: -22,
        background: `radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.12) 0%, transparent 70%)`,
        opacity: 0.35,
        filter: "blur(4px)",
        pointerEvents: "none",
        animation: "door-smoke 3s ease-in-out infinite",
        animationDelay: `${index * 0.7}s`,
      }} />
    </div>
  );
}

// ─── Mobile version ───────────────────────────────────────────────────────────
function MobileSessions({ onSelect }: { onSelect: (s: SessionTier) => void }) {
  return (
    <div style={{ padding: "16px 0 32px" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14, textAlign: "center" }}>
        {SESSIONS.length} session tiers · tap to explore
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SESSIONS.map(s => {
          const meta = DOOR_META[s.id];
          return (
            <button key={s.id} onClick={() => onSelect(s)} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1px solid ${meta.lightColor}33`,
              borderLeft: `3px solid ${meta.lightColor}`,
              background: `${meta.glowColor}0.05)`,
              cursor: "pointer", minHeight: 60, width: "100%",
            }}>
              <span style={{ fontSize: 28, filter: `drop-shadow(0 0 8px ${meta.lightColor})` }}>{s.emoji}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: "#fff", letterSpacing: "0.05em", lineHeight: 1, marginBottom: 2 }}>{s.name}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: meta.lightColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.isCustom ? "Custom" : kes(s.price)}</p>
              </div>
              <span style={{ color: meta.lightColor, fontSize: 16 }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── The Smoke Room ───────────────────────────────────────────────────────────
export default function SessionsSection() {
  const isMobile        = useIsMobile();
  const { setBookingOpen, addToCart } = useStore();
  const [selected, setSelected] = useState<SessionTier | null>(null);
  const roomRef    = useRef<HTMLDivElement>(null);
  const cameraRef  = useRef<HTMLDivElement>(null);
  const mouseRef   = useRef({ x: 0, y: 0 });
  const rafRef     = useRef<number>(0);
  const orbitRef   = useRef({ x: 0, y: 0 });

  // Particle smoke puffs that drift up from floor
  const PUFFS = 22;

  const handleBook = useCallback((session: SessionTier) => {
    if (session.isCustom) {
      document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    addToCart({ id: `session-${session.id}`, type: "session", name: session.name, price: session.price, quantity: 1 });
    setBookingOpen(true);
  }, [addToCart, setBookingOpen]);

  // Mouse parallax camera drift
  useEffect(() => {
    if (isMobile) return;

    const onMove = (e: MouseEvent) => {
      const rect = roomRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const target = { x: mouseRef.current.x * 3.5, y: -mouseRef.current.y * 2 };
      orbitRef.current.x += (target.x - orbitRef.current.x) * 0.04;
      orbitRef.current.y += (target.y - orbitRef.current.y) * 0.04;
      if (cameraRef.current) {
        cameraRef.current.style.transform = `rotateX(${orbitRef.current.y}deg) rotateY(${orbitRef.current.x}deg)`;
      }
    };
    loop();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  const leftSessions  = SESSIONS.filter(s => DOOR_META[s.id]?.wallPos === "left");
  const rightSessions = SESSIONS.filter(s => DOOR_META[s.id]?.wallPos === "right");

  return (
    <section
      id="sessions"
      style={{
        background: "var(--void)",
        position: "relative",
        overflow: "hidden",
        paddingBottom: isMobile ? 0 : "clamp(60px,8vw,100px)",
      }}
    >
      {/* Inject door-smoke keyframe */}
      <style>{`
        @keyframes door-smoke {
          0%,100% { transform: scaleX(1) translateY(0); opacity: 0.35; }
          50%      { transform: scaleX(1.15) translateY(-4px); opacity: 0.55; }
        }
        @keyframes fog-drift {
          0%   { transform: translateX(0)    scaleY(1); }
          50%  { transform: translateX(40px) scaleY(1.08); }
          100% { transform: translateX(0)    scaleY(1); }
        }
        @keyframes puff-rise {
          0%   { transform: translateY(0)   scaleX(1);   opacity: 0; }
          15%  { opacity: 0.18; }
          80%  { opacity: 0.06; }
          100% { transform: translateY(-90px) scaleX(2.4); opacity: 0; }
        }
        @keyframes grid-pulse {
          0%,100% { opacity: 0.35; }
          50%     { opacity: 0.55; }
        }
      `}</style>

      {/* ── Section header ── */}
      <div style={{
        position: "relative", zIndex: 20,
        padding: isMobile ? "clamp(40px,6vw,60px) 16px 0" : "clamp(52px,7vw,88px) 5vw 0",
        pointerEvents: "none",
      }}>
        <div style={{ textAlign: isMobile ? "left" : "center" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: "var(--cyan-bright)", textTransform: "uppercase", marginBottom: 12, opacity: 0.8 }}>
            8 Ways to Session
          </p>
          <h2 style={{
            fontFamily: "var(--font-bebas)", fontWeight: 400,
            fontSize: isMobile ? "clamp(44px,11vw,64px)" : "clamp(56px,7vw,100px)",
            lineHeight: 0.92, letterSpacing: "0.04em", color: "#fff", marginBottom: 12,
          }}>
            Pick Your <span style={{ color: "var(--violet)" }}>Vibe.</span>
          </h2>
          <p style={{
            fontFamily: "var(--font-barlow)", fontSize: isMobile ? 13 : "clamp(13px,1.8vw,16px)",
            color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: isMobile ? "0" : "0 auto",
          }}>
            {isMobile ? "Tap a session to see what's inside." : "Eight doors. Eight worlds. Step inside the one that fits your night."}
          </p>
        </div>
      </div>

      {/* ── Mobile ── */}
      {isMobile && (
        <div style={{ padding: "0 16px", position: "relative", zIndex: 10 }}>
          <MobileSessions onSelect={setSelected} />
        </div>
      )}

      {/* ── Desktop: The Smoke Room ── */}
      {!isMobile && (
        <div
          ref={roomRef}
          style={{
            position: "relative",
            width: "100%",
            height: "82vh",
            overflow: "hidden",
            marginTop: 32,
            perspective: "900px",
            perspectiveOrigin: "50% 44%",
          }}
        >
          {/* Camera pivot */}
          <div
            ref={cameraRef}
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {/* ── Ceiling ── */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "42%",
              background: "linear-gradient(180deg, #030109 0%, #08041a 100%)",
              transformOrigin: "top center",
              transform: "rotateX(-6deg)",
              borderBottom: "1px solid rgba(124,58,237,0.12)",
            }}>
              {/* Ceiling hex texture */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.06,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 0l28 16v32L28 64 0 48V16z' fill='none' stroke='%237c3aed' stroke-width='0.8'/%3E%3C/svg%3E")`,
                backgroundSize: "56px 100px",
              }} />
              {/* Central chandelier glow */}
              <div style={{
                position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                width: 180, height: 60,
                background: "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.35) 0%, transparent 70%)",
                filter: "blur(8px)",
              }} />
            </div>

            {/* ── Floor ── */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "52%",
              background: "linear-gradient(0deg, #020108 0%, #06031a 100%)",
              transformOrigin: "bottom center",
              transform: "rotateX(6deg)",
              borderTop: "1px solid rgba(34,211,238,0.1)",
              overflow: "hidden",
            }}>
              {/* Neon grid */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34,211,238,0.18) 1px, transparent 1px)
                `,
                backgroundSize: "80px 80px",
                animation: "grid-pulse 4s ease-in-out infinite",
                maskImage: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.3) 100%)",
              }} />

              {/* Floor reflection glow strips */}
              {SESSIONS.map((s) => {
                const meta = DOOR_META[s.id];
                const leftPct = meta.wallPos === "left" ? "18%" : "72%";
                return (
                  <div key={s.id} style={{
                    position: "absolute", top: 0, left: leftPct,
                    width: 80, height: "100%",
                    background: `linear-gradient(180deg, ${meta.glowColor}0.06) 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }} />
                );
              })}

              {/* Fog layer at floor level */}
              <div style={{
                position: "absolute", bottom: 0, left: "-10%", right: "-10%", height: 80,
                background: "linear-gradient(180deg, transparent 0%, rgba(15,8,35,0.7) 100%)",
                animation: "fog-drift 12s ease-in-out infinite",
                filter: "blur(6px)",
                pointerEvents: "none",
              }} />

              {/* Rising smoke puffs */}
              {Array.from({ length: PUFFS }).map((_, pi) => (
                <div key={pi} style={{
                  position: "absolute",
                  left: `${6 + (pi / PUFFS) * 88}%`,
                  bottom: `${Math.random() * 30}%`,
                  width: 24 + Math.random() * 30,
                  height: 24 + Math.random() * 20,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.055)",
                  filter: "blur(8px)",
                  animation: `puff-rise ${5 + Math.random() * 8}s ease-in infinite`,
                  animationDelay: `${Math.random() * 8}s`,
                  pointerEvents: "none",
                }} />
              ))}
            </div>

            {/* ── Back wall ── */}
            <div style={{
              position: "absolute", top: "38%", left: 0, right: 0, height: "24%",
              background: "linear-gradient(180deg, #08041a 0%, #05030e 100%)",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              {/* Centre arch / logo area */}
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                textAlign: "center", pointerEvents: "none",
              }}>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(14px,2.5vw,22px)", color: "rgba(255,255,255,0.07)", letterSpacing: "0.5em", textTransform: "uppercase" }}>
                  HKH · THE SMOKE ROOM
                </p>
                <div style={{ width: 80, height: 1, background: "rgba(255,255,255,0.06)", margin: "6px auto 0" }} />
              </div>
            </div>

            {/* ── Left wall ── */}
            <div style={{
              position: "absolute", top: "8%", left: 0, width: "24%", bottom: "8%",
              background: "linear-gradient(90deg, #030109 0%, #07031a 100%)",
              borderRight: "1px solid rgba(255,255,255,0.04)",
              overflow: "visible",
            }}>
              {/* Wall texture */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 60px)` }} />
              {leftSessions.map((s, i) => (
                <SmokeRoomDoor key={s.id} session={s} index={i} wall="left" onEnter={setSelected} />
              ))}
            </div>

            {/* ── Right wall ── */}
            <div style={{
              position: "absolute", top: "8%", right: 0, width: "24%", bottom: "8%",
              background: "linear-gradient(270deg, #030109 0%, #07031a 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
              overflow: "visible",
            }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 60px)` }} />
              {rightSessions.map((s, i) => (
                <SmokeRoomDoor key={s.id} session={s} index={i} wall="right" onEnter={setSelected} />
              ))}
            </div>
          </div>

          {/* ── Vignette ── */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 15,
            background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, rgba(3,1,9,0.75) 100%)",
          }} />

          {/* ── Hint ── */}
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            zIndex: 20, pointerEvents: "none", textAlign: "center",
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>
              Move mouse to explore · click a door to enter
            </p>
          </div>
        </div>
      )}

      {/* ── Footer note ── */}
      <div style={{ textAlign: "center", marginTop: isMobile ? 12 : 28, padding: "0 5vw", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "var(--font-serif, var(--font-grotesk))", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.16)", letterSpacing: "0.05em" }}>
          All sessions include setup · teardown · premium coal management · Nairobi delivery
        </p>
      </div>

      {selected && (
        <SessionModal session={selected} onClose={() => setSelected(null)} onBook={handleBook} />
      )}
    </section>
  );
}
