"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function kes(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

type Status = "verifying" | "success" | "failed";

interface BookingResult {
  booking: {
    id: string;
    session_name: string;
    booking_date: string;
    time_slot: string;
    total_kobo: number;
    paystack_reference: string;
  };
}

function ConfirmContent() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");
  const [status, setStatus] = useState<Status>("verifying");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) { setStatus("failed"); setError("No payment reference found."); return; }

    fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) { setResult(data); setStatus("success"); }
        else { setStatus("failed"); setError(data.error ?? "Payment could not be verified."); }
      })
      .catch(() => { setStatus("failed"); setError("Network error while verifying payment."); });
  }, [reference]);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--void)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 5vw", fontFamily: "var(--font-barlow)",
    }}>
      <div style={{
        maxWidth: 520, width: "100%", textAlign: "center",
        background: "rgba(13,10,30,0.95)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 24, padding: "48px 40px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
      }}>
        {status === "verifying" && (
          <>
            <div style={{ fontSize: 56, marginBottom: 24 }}>⏳</div>
            <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: 40, color: "#fff", letterSpacing: "0.04em", marginBottom: 12 }}>
              Verifying Payment
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
              Confirming your booking with Paystack…
            </p>
          </>
        )}

        {status === "success" && result && (
          <>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
            <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px,8vw,56px)", color: "var(--electric)", letterSpacing: "0.06em", textShadow: "0 0 40px rgba(237,255,102,0.5)", marginBottom: 16 }}>
              Booking Confirmed
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
              Your session is locked in. Check your email for confirmation details.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32, textAlign: "left" }}>
              {[
                { label: "Session", value: result.booking.session_name },
                { label: "Date", value: new Date(result.booking.booking_date).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                { label: "Time", value: result.booking.time_slot },
                { label: "Amount Paid", value: kes(Math.round(result.booking.total_kobo / 100)) },
                { label: "Reference", value: result.booking.paystack_reference },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cyan)" }}>{value}</span>
                </div>
              ))}
            </div>

            <a href="/" style={{
              display: "inline-block", padding: "14px 36px",
              background: "var(--electric)", color: "#05030a",
              borderRadius: 12, fontFamily: "var(--font-bebas)",
              fontSize: 18, letterSpacing: "0.1em", textDecoration: "none",
            }}>
              Back to Home
            </a>
          </>
        )}

        {status === "failed" && (
          <>
            <div style={{ fontSize: 56, marginBottom: 24 }}>❌</div>
            <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: 40, color: "#ff6b6b", letterSpacing: "0.04em", marginBottom: 12 }}>
              Payment Failed
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 28 }}>
              {error}
            </p>
            <a href="/" style={{
              display: "inline-block", padding: "14px 36px",
              background: "rgba(255,255,255,0.08)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 12, fontFamily: "var(--font-bebas)",
              fontSize: 18, letterSpacing: "0.1em", textDecoration: "none",
            }}>
              Try Again
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
        Loading…
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
