"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid password. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--void)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "var(--nebula)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        padding: "40px 36px",
        boxShadow: "0 24px 64px rgba(124,58,237,0.15)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 40,
            color: "var(--electric)",
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}>
            HKH
          </div>
          <div style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontSize: 13,
            color: "var(--text-muted)",
            letterSpacing: "0.2em",
            marginTop: 6,
            textTransform: "uppercase",
          }}>
            Admin Access
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{
            display: "block",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
            autoFocus
            style={{
              width: "100%",
              minHeight: 44,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--glass-border)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "var(--text-primary)",
              fontSize: 15,
              fontFamily: "var(--font-barlow), sans-serif",
              outline: "none",
              marginBottom: 8,
            }}
          />

          {error && (
            <div style={{
              color: "#ef4444",
              fontSize: 13,
              marginBottom: 12,
              fontFamily: "var(--font-barlow), sans-serif",
              padding: "8px 12px",
              background: "rgba(239,68,68,0.08)",
              borderRadius: 6,
              border: "1px solid rgba(239,68,68,0.2)",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              minHeight: 44,
              marginTop: 8,
              background: loading || !password ? "rgba(237,255,102,0.3)" : "var(--electric)",
              color: "#05030a",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "var(--font-bebas), sans-serif",
              letterSpacing: "0.12em",
              fontWeight: 700,
              cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "AUTHENTICATING..." : "ENTER DASHBOARD"}
          </button>
        </form>
      </div>
    </div>
  );
}
