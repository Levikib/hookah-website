import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

async function checkAuth() {
  const store = await cookies();
  const session = store.get("admin_session")?.value;
  if (!session || session !== process.env.ADMIN_SECRET) {
    redirect("/admin-login");
  }
}

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "◈", exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: "📅" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/staff", label: "Staff", icon: "👥" },
  { href: "/admin/inventory", label: "Inventory", icon: "🧪" },
  { href: "/admin/analytics", label: "Analytics", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--void)", fontFamily: "var(--font-barlow), sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 220,
        background: "var(--nebula)",
        borderRight: "1px solid var(--glass-border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
        flexShrink: 0,
      }} className="admin-sidebar">
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--glass-border)" }}>
          <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 22, color: "var(--electric)", letterSpacing: "0.1em", lineHeight: 1 }}>
            HKH ADMIN
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
            Control Panel
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              color: "var(--text-primary)", textDecoration: "none",
              fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
              marginBottom: 2, transition: "background 0.15s, color 0.15s",
            }} className="admin-nav-link">
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--glass-border)" }}>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" style={{
              width: "100%", padding: "10px 0",
              background: "transparent", border: "1px solid rgba(228,87,87,0.3)",
              borderRadius: 6, color: "#ef4444", fontSize: 13,
              fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em", minHeight: 44,
            }}>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div style={{
        display: "none", background: "var(--nebula)",
        borderBottom: "1px solid var(--glass-border)",
        padding: "0 12px", height: 56,
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 40, width: "100%",
      }} className="admin-topbar">
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: "var(--electric)", letterSpacing: "0.1em" }}>HKH</span>
        <nav style={{ display: "flex", gap: 2 }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} title={link.label} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 8, fontSize: 16,
              textDecoration: "none", color: "var(--text-primary)",
            }}>
              {link.icon}
            </Link>
          ))}
        </nav>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-mono)", padding: "4px 8px" }}>
            OUT
          </button>
        </form>
      </div>

      <main style={{ flex: 1, marginLeft: 220, minHeight: "100vh", padding: "32px", background: "var(--void)" }} className="admin-main">
        {children}
      </main>

      <style>{`
        :root {
          --text-primary: rgba(255,255,255,0.92);
          --text-muted: rgba(255,255,255,0.45);
          --text-dim: rgba(255,255,255,0.25);
          --glass-border: rgba(124,58,237,0.15);
          --glass-bg: rgba(124,58,237,0.06);
          --violet-bright: #a78bfa;
          --nebula: #0d0a1e;
          --void: #05030a;
        }
        @media (max-width: 767px) {
          .admin-sidebar { display: none !important; }
          .admin-topbar { display: flex !important; }
          .admin-main { margin-left: 0 !important; padding: 12px !important; padding-top: 68px !important; }
        }
        .admin-nav-link:hover { background: var(--glass-bg) !important; color: var(--electric) !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
