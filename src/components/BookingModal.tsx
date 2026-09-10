"use client";
import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { SERVICES } from "@/data/services";
import { FLAVOURS } from "@/data/flavours";
import type { Flavour } from "@/data/flavours";
import { useIsMobile } from "@/context/MobileContext";
import { buildWhatsAppLink } from "@/lib/whatsapp";

function kes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

// ── Time slots ───────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "10:00 AM", "12:00 PM", "2:00 PM",
  "4:00 PM",  "6:00 PM",  "8:00 PM",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function parseDate(s: string) {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function displayDate(s: string) {
  const d = parseDate(s);
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

// ── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  const labels = ["Occasion", "Date & Time", "Flavours", "Review"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {labels.map((label, i) => {
          const num = i + 1;
          const isActive    = num === step;
          const isCompleted = num < step;
          const isFuture    = num > step;
          return (
            <div key={num} style={{ display: "flex", alignItems: "center" }}>
              {/* 44px touch target wrapper around 32px circle */}
              <div style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  background:   isCompleted ? "var(--violet)"  : isActive ? "var(--sv-red-bright)" : "transparent",
                  border:       isFuture    ? "2px solid rgba(255,255,255,0.2)" : "none",
                  color:        isCompleted || isActive ? "#05030a" : "rgba(255,255,255,0.35)",
                  boxShadow:    isActive ? "0 0 16px rgba(6,182,212,0.6)" : "none",
                }}>
                  {isCompleted ? "✓" : num}
                </div>
              </div>
              {i < labels.length - 1 && (
                <div style={{
                  width: 48,
                  height: 2,
                  background: isCompleted
                    ? "linear-gradient(to right, var(--violet), var(--violet))"
                    : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.2em",
        color: "var(--text-muted)",
        textTransform: "uppercase",
      }}>
        Step {step} of 4 — {labels[step - 1]}
      </p>
    </div>
  );
}

// ── STEP 1: Service Selection ────────────────────────────────────────────────
function Step1Service({ isMobile }: { isMobile: boolean }) {
  const { booking, setBookingService } = useStore();
  const selected = booking.service;

  return (
    <div>
      <h2 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(28px, 4vw, 40px)",
        letterSpacing: "0.04em",
        color: "var(--text-primary)",
        marginBottom: 8,
      }}>
        Choose Your Occasion
      </h2>
      <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
        What are we setting up for?
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
      }}>
        {SERVICES.map((s) => {
          const isSelected = selected?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setBookingService(s)}
              style={{
                background: isSelected ? "rgba(225,29,46,0.12)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${isSelected ? "var(--sv-red-bright)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 14,
                padding: "18px 16px",
                textAlign: "left",
                cursor: "none",
                transition: "all 0.2s ease",
                position: "relative",
                boxShadow: isSelected ? "0 0 20px rgba(225,29,46,0.25)" : "none",
              }}
            >
              {s.popular && (
                <div style={{
                  position: "absolute",
                  top: -10,
                  right: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#05030a",
                  background: "var(--electric)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}>
                  Popular
                </div>
              )}
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{
                fontFamily: "var(--font-bebas)",
                fontSize: 20,
                letterSpacing: "0.04em",
                color: isSelected ? "var(--sv-red-bright)" : "var(--text-primary)",
                marginBottom: 4,
              }}>
                {s.name}
              </div>
              <div style={{
                fontFamily: "var(--font-barlow)",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 10,
                lineHeight: 1.4,
              }}>
                {s.tagline}
              </div>
              <div style={{
                marginTop: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                fontWeight: 700,
                color: s.isCustom ? "var(--orange)" : "var(--gold)",
              }}>
                {s.isCustom ? "Custom" : `${s.priceEstimated ? "Est. from " : "From "}${kes(s.startingPrice)}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── STEP 2: Calendar / Time / Location ──────────────────────────────────────
function Step2DateTime({ isMobile }: { isMobile: boolean }) {
  const {
    booking,
    setBookingDate,
    setBookingTime,
    setBookingLocation,
    setDeliveryAddress,
  } = useStore();

  const today   = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const selectedDate = booking.date;
  const selectedTime = booking.timeSlot;
  const location     = booking.location;

  const prevMonth = useCallback(() => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }, [calMonth]);

  const nextMonth = useCallback(() => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }, [calMonth]);

  // Prevent going to months before current
  const canGoPrev = calYear > today.getFullYear() || calMonth > today.getMonth();

  const firstDay   = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const totalDays  = daysInMonth(calYear, calMonth);
  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Build calendar cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div>
      <h2 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(28px, 4vw, 40px)",
        letterSpacing: "0.04em",
        color: "var(--text-primary)",
        marginBottom: 8,
      }}>
        Date, Time & Location
      </h2>
      <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>
        Choose when and where it happens.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
        {/* ── Calendar ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 20,
        }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: canGoPrev ? "var(--text-primary)" : "rgba(255,255,255,0.2)",
                width: 44, height: 44, minHeight: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
                cursor: "none",
              }}
            >‹</button>
            <span style={{
              fontFamily: "var(--font-bebas)",
              fontSize: 16,
              letterSpacing: "0.08em",
              color: "var(--text-primary)",
            }}>
              {monthLabel}
            </span>
            <button
              onClick={nextMonth}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "var(--text-primary)",
                width: 44, height: 44, minHeight: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
                cursor: "none",
              }}
            >›</button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} style={{
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                paddingBottom: 6,
              }}>{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const cellDate = new Date(calYear, calMonth, day);
              const isPast     = cellDate < tomorrow;
              const dateStr    = formatDate(cellDate);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={idx}
                  onClick={() => !isPast && setBookingDate(dateStr)}
                  disabled={isPast}
                  style={{
                    background: isSelected
                      ? "var(--sv-red-bright)"
                      : isPast
                      ? "transparent"
                      : "rgba(255,255,255,0.04)",
                    border: isSelected ? "none" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    color: isSelected
                      ? "#05030a"
                      : isPast
                      ? "rgba(255,255,255,0.18)"
                      : "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "6px 0",
                    minHeight: 44,
                    textAlign: "center",
                    cursor: isPast ? "none" : "none",
                    transition: "all 0.15s",
                    boxShadow: isSelected ? "0 0 12px rgba(6,182,212,0.4)" : "none",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <p style={{
              marginTop: 14,
              fontFamily: "var(--font-barlow)",
              fontSize: 12,
              color: "var(--sv-red-bright)",
              textAlign: "center",
            }}>
              {displayDate(selectedDate)}
            </p>
          )}
        </div>

        {/* ── Time + Location ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Time slots */}
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              Select Time
            </p>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}>
              {TIME_SLOTS.map((slot) => {
                const isActive = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setBookingTime(slot)}
                    style={{
                      background: isActive ? "var(--sv-red-bright)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isActive ? "var(--sv-red-bright)" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 999,
                      color: isActive ? "#05030a" : "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      padding: "0 16px",
                      minHeight: 44,
                      cursor: "none",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      boxShadow: isActive ? "0 0 12px rgba(6,182,212,0.4)" : "none",
                      fontWeight: isActive ? 700 : 400,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location toggle */}
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              Location
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {(["venue", "delivery"] as const).map((loc) => {
                const isActive = location === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => setBookingLocation(loc)}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      background: isActive ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${isActive ? "var(--sv-red-bright)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 12,
                      color: isActive ? "var(--sv-red-bright)" : "var(--text-muted)",
                      fontFamily: "var(--font-barlow)",
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {loc === "venue" ? "🏠 In-Venue" : "🚚 Delivery"}
                  </button>
                );
              })}
            </div>

            {location === "delivery" && (
              <div style={{ marginTop: 14 }}>
                <input
                  type="text"
                  placeholder="Enter delivery address…"
                  value={booking.deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontFamily: "var(--font-barlow)",
                    fontSize: 14,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 3: Flavour Selection ────────────────────────────────────────────────
function Step3Flavours({ isMobile }: { isMobile: boolean }) {
  const { booking, toggleFlavour } = useStore();
  const maxFlavours: number = 4;

  const selected = booking.selectedFlavours;

  return (
    <div>
      <h2 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(28px, 4vw, 40px)",
        letterSpacing: "0.04em",
        color: "var(--text-primary)",
        marginBottom: 8,
      }}>
        Pick Your Flavours
      </h2>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "var(--text-muted)" }}>
          Select up to {maxFlavours} flavour{maxFlavours !== 1 ? "s" : ""} for the occasion.
        </p>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: selected.length >= maxFlavours ? "var(--sv-red-bright)" : "var(--text-muted)",
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${selected.length >= maxFlavours ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 999,
          padding: "4px 14px",
        }}>
          {selected.length} of {maxFlavours} selected
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 10,
        maxHeight: "58vh",
        overflowY: "auto",
        paddingRight: 4,
      }}>
        {FLAVOURS.map((f: Flavour) => {
          const isSelected = !!selected.find((x) => x.id === f.id);
          const isDisabled = !isSelected && selected.length >= maxFlavours;

          return (
            <button
              key={f.id}
              onClick={() => !isDisabled && toggleFlavour(f, maxFlavours)}
              disabled={isDisabled}
              style={{
                position: "relative",
                background: isSelected ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${isSelected ? "var(--sv-red-bright)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12,
                padding: "14px 12px",
                textAlign: "left",
                cursor: isDisabled ? "none" : "none",
                opacity: isDisabled ? 0.4 : 1,
                transition: "all 0.2s ease",
                boxShadow: isSelected ? "0 0 16px rgba(6,182,212,0.3)" : "none",
              }}
            >
              {isSelected && (
                <div style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 18,
                  height: 18,
                  background: "var(--sv-red-bright)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#05030a",
                  fontWeight: 900,
                }}>✓</div>
              )}
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.emoji}</div>
              <div style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: 13,
                color: isSelected ? "var(--sv-red-bright)" : "var(--text-primary)",
                marginBottom: 3,
                lineHeight: 1.2,
              }}>
                {f.name}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "var(--text-dim)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                {f.category}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--gold)",
              }}>
                {kes(f.price)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── STEP 4: Review & Confirm ─────────────────────────────────────────────────
function Step4Review({ onConfirm, isMobile }: { onConfirm: (ref: string) => void; isMobile: boolean }) {
  const { booking } = useStore();

  const { service, date, timeSlot, location, deliveryAddress, selectedFlavours } = booking;

  const deliveryFee = location === "delivery" ? 2000 : 0;
  const servicePrice = service?.isCustom ? 0 : (service?.startingPrice ?? 0);
  const flavourTotal = selectedFlavours.reduce((s, f) => s + f.price, 0);
  const total = servicePrice + flavourTotal + deliveryFee;

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (!service) {
      setError("No occasion selected. Please go back and choose one.");
      return;
    }
    if (!date) {
      setError("No date selected. Please go back and pick a date.");
      return;
    }
    if (!timeSlot) {
      setError("No time slot selected. Please go back and pick a time.");
      return;
    }
    setError("");
    setLoading(true);

    const payload = {
      serviceId: service.id,
      serviceName: service.name,
      bookingDate: date,
      timeSlot,
      location,
      deliveryAddress: location === "delivery" ? deliveryAddress : undefined,
      flavours: selectedFlavours.map(f => ({ flavourId: f.id, name: f.name })),
      estimatedTotalKes: service.isCustom ? null : total,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          type: "booking",
          payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const summaryLines = [
        `New booking request — Smokers Vine`,
        `Name: ${customerName.trim()}`,
        `Occasion: ${service.name}`,
        `Date: ${displayDate(date)}`,
        `Time: ${timeSlot}`,
        `Location: ${location === "delivery" ? `Delivery — ${deliveryAddress}` : "In-venue"}`,
        selectedFlavours.length > 0 ? `Flavours: ${selectedFlavours.map(f => f.name).join(", ")}` : "",
        service.isCustom ? "Pricing: custom — please quote" : `Estimated total: ${kes(total)} (est.)`,
      ];
      window.location.href = buildWhatsAppLink(summaryLines);
      onConfirm(data.id);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(28px, 4vw, 40px)",
        letterSpacing: "0.04em",
        color: "var(--text-primary)",
        marginBottom: 8,
      }}>
        Review & Confirm
      </h2>
      <p style={{ fontFamily: "var(--font-barlow)", fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
        Double-check everything before we lock it in.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
        {/* ── Left: Order details ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Occasion block */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "16px 18px",
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
              Occasion
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{service?.emoji ?? "—"}</span>
              <div>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: 18, letterSpacing: "0.04em", color: "var(--text-primary)" }}>
                  {service?.name ?? "—"}
                </p>
                <p style={{ fontFamily: "var(--font-barlow)", fontSize: 12, color: "var(--text-muted)" }}>
                  {service?.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Date/Time block */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "16px 18px",
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
              Date & Time
            </p>
            <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
              {date ? displayDate(date) : "—"}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--sv-red-bright)" }}>
              {timeSlot ?? "—"}
            </p>
          </div>

          {/* Location block */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "16px 18px",
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
              Location
            </p>
            <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", textTransform: "capitalize" }}>
              {location === "venue" ? "🏠 In-Venue" : "🚚 Delivery"}
            </p>
            {location === "delivery" && deliveryAddress && (
              <p style={{ fontFamily: "var(--font-barlow)", fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                {deliveryAddress}
              </p>
            )}
          </div>

          {/* Flavours block */}
          {selectedFlavours.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "16px 18px",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 10 }}>
                Flavours
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedFlavours.map((f) => (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-barlow)", fontSize: 13, color: "var(--text-primary)" }}>
                      {f.emoji} {f.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gold)" }}>
                      {kes(f.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Pricing + Promo ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Price breakdown */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "20px 18px",
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 16 }}>
              Price Breakdown
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PriceLine label={service?.name ?? "Occasion"} value={service?.isCustom ? "Custom" : kes(servicePrice)} />
              {selectedFlavours.map((f) => (
                <PriceLine key={f.id} label={`${f.emoji} ${f.name}`} value={kes(f.price)} muted />
              ))}
              {deliveryFee > 0 && <PriceLine label="Delivery Fee" value={kes(deliveryFee)} muted />}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Estimated Total</span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--gold)",
                  textShadow: "0 0 20px rgba(245,158,11,0.5)",
                }}>
                  {service?.isCustom ? "TBD" : kes(total)}
                </span>
              </div>
              {!service?.isCustom && (
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
                  Estimate only — final price confirmed on WhatsApp.
                </p>
              )}
            </div>
          </div>

          {/* Customer details */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 4 }}>
              Your Details
            </p>
            {[
              { placeholder: "Full name *", value: customerName, onChange: setCustomerName, type: "text" },
              { placeholder: "Phone number *", value: customerPhone, onChange: setCustomerPhone, type: "tel" },
            ].map(({ placeholder, value, onChange, type }) => (
              <input
                key={placeholder}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  padding: "11px 14px",
                  fontFamily: "var(--font-barlow)",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  outline: "none",
                  minHeight: 44,
                }}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p style={{
              fontFamily: "var(--font-barlow)", fontSize: 13,
              color: "#ff6b6b", padding: "8px 14px",
              background: "rgba(255,107,107,0.08)",
              border: "1px solid rgba(255,107,107,0.25)",
              borderRadius: 8,
            }}>{error}</p>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn-teal"
            style={{
              width: "100%",
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(18px, 4vw, 22px)",
              letterSpacing: "0.1em",
              padding: "18px 0",
              borderRadius: 12,
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Sending to WhatsApp…" : "Confirm on WhatsApp →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PriceLine({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{
        fontFamily: "var(--font-barlow)",
        fontSize: 13,
        color: muted ? "var(--text-muted)" : "var(--text-primary)",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        color: muted ? "var(--text-muted)" : "var(--gold)",
      }}>
        {value}
      </span>
    </div>
  );
}

// ── Confirmation Screen ──────────────────────────────────────────────────────
function ConfirmationScreen({ refNum }: { refNum: string }) {
  const { resetBooking, setBookingOpen } = useStore();

  const handleClose = () => {
    resetBooking();
    setBookingOpen(false);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      textAlign: "center",
      minHeight: 360,
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
      <h2 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(36px, 6vw, 56px)",
        letterSpacing: "0.06em",
        color: "var(--electric)",
        textShadow: "0 0 40px rgba(237,255,102,0.5)",
        marginBottom: 16,
      }}>
        Booking Confirmed
      </h2>
      <p style={{
        fontFamily: "var(--font-barlow)",
        fontSize: 15,
        color: "var(--text-muted)",
        marginBottom: 8,
      }}>
        We&apos;ve got your details. Continue the conversation on WhatsApp to lock it in.
      </p>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 22,
        letterSpacing: "0.2em",
        color: "var(--sv-red-bright)",
        background: "rgba(6,182,212,0.1)",
        border: "1px solid rgba(6,182,212,0.3)",
        borderRadius: 10,
        padding: "12px 28px",
        margin: "20px 0 32px",
      }}>
        {refNum}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn-ghost"
          style={{ fontSize: 13 }}
          onClick={() => {/* Add-to-calendar: no-op for now */}}
        >
          Add to Calendar
        </button>
        <button
          className="btn-teal"
          style={{ fontSize: 13 }}
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export default function BookingModal() {
  const { bookingOpen, setBookingOpen, booking, setBookingStep, resetBooking } = useStore();
  const [confirmed, setConfirmed] = useState(false);
  const [refNum, setRefNum] = useState("");
  const isMobile = useIsMobile();

  // Safety: if service not set but step > 1, clamp to step 1
  const step = (!booking.service && booking.step > 1) ? 1 : booking.step;

  if (!bookingOpen) return null;

  const handleClose = () => {
    resetBooking();
    setConfirmed(false);
    setRefNum("");
    setBookingOpen(false);
  };

  const handleConfirm = (ref: string) => {
    setRefNum(ref);
    setConfirmed(true);
  };

  // Step validation
  const canGoNext = (() => {
    if (step === 1) return !!booking.service;
    if (step === 2) return !!booking.date && !!booking.timeSlot;
    // Step 3→4: require service + date + time to be set (flavours are optional)
    if (step === 3) return !!booking.service && !!booking.date && !!booking.timeSlot;
    return false;
  })();

  const goNext = () => {
    if (step < 4 && canGoNext) setBookingStep((step + 1) as 1 | 2 | 3 | 4);
  };

  const goPrev = () => {
    if (step > 1) setBookingStep((step - 1) as 1 | 2 | 3 | 4);
  };

  const STEP_LABELS: Record<number, string> = {
    1: "Choose Your Occasion",
    2: "Date, Time & Location",
    3: "Pick Flavours",
    4: "Review & Confirm",
  };

  // Responsive padding
  const innerPadding = isMobile ? "20px 20px" : "36px 40px";

  // Mobile panel: bottom sheet style
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        overflowY: "auto",
        background: "rgba(13,10,30,0.97)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.15), inset 0 1px 0 rgba(232,121,249,0.06)",
        padding: innerPadding,
        pointerEvents: "all",
      }
    : {
        position: "relative",
        width: "90vw",
        maxWidth: 900,
        maxHeight: "90vh",
        overflowY: "auto",
        background: "rgba(13,10,30,0.97)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.15), inset 0 1px 0 rgba(232,121,249,0.06)",
        padding: innerPadding,
        pointerEvents: "all",
      };

  const outerStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 101,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "stretch",
        pointerEvents: "none",
      }
    : {
        position: "fixed",
        inset: 0,
        zIndex: 101,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        pointerEvents: "none",
      };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(5,3,10,0.92)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Modal panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={outerStyle}
      >
        <div style={panelStyle}>
          {/* Close button — 44x44 touch target */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: isMobile ? 12 : 18,
              right: isMobile ? 12 : 20,
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%",
              color: "var(--text-muted)",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "none",
              lineHeight: 1,
              transition: "all 0.2s",
            }}
            aria-label="Close booking modal"
          >
            ×
          </button>

          {confirmed ? (
            <ConfirmationScreen refNum={refNum} />
          ) : (
            <>
              {/* Step indicator */}
              <StepIndicator step={step} />

              {/* Step content */}
              <div style={{ minHeight: 320 }}>
                {step === 1 && <Step1Service isMobile={isMobile} />}
                {step === 2 && <Step2DateTime isMobile={isMobile} />}
                {step === 3 && <Step3Flavours isMobile={isMobile} />}
                {step === 4 && <Step4Review onConfirm={handleConfirm} isMobile={isMobile} />}
              </div>

              {/* Navigation footer */}
              {step < 4 && (
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: isMobile ? 20 : 32,
                  paddingTop: isMobile ? 16 : 24,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <button
                    onClick={goPrev}
                    className="btn-ghost"
                    disabled={step === 1}
                    style={{
                      opacity: step === 1 ? 0 : 1,
                      pointerEvents: step === 1 ? "none" : "auto",
                      fontSize: 13,
                      minHeight: 44,
                    }}
                  >
                    ← Back
                  </button>

                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                  }}>
                    {STEP_LABELS[step]}
                  </div>

                  <button
                    onClick={goNext}
                    className="btn-teal"
                    disabled={!canGoNext}
                    style={{
                      opacity: canGoNext ? 1 : 0.35,
                      fontSize: 13,
                      minHeight: 44,
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
              {/* Hint when step 3 is blocked due to missing session/date */}
              {step === 3 && !canGoNext && (
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(255,180,100,0.7)", textAlign: "center",
                  marginTop: 8,
                }}>
                  {!booking.service ? "← Go back and choose an occasion first" : "← Go back and pick a date & time"}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
