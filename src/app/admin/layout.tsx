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
  { href: "/admin", label: "Dashboard", icon: "◈" },
  { href: "/admin/bookings", label: "Bookings", icon: "📅" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/staff", label: "Staff", icon: "👥" },
  { href: "/admin/inventory", label: "Inventory", icon: "🧪" },
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
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
        className="admin-sidebar"
      >
        {/* Logo */}
        <div style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid var(--glass-border)",
        }}>
          <div style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 22,
            color: "var(--electric)",
            letterSpacing: "0.1em",
            lineHeight: 1,
          }}>
            HKH ADMIN
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
            Control Panel
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 12px",
                borderRadius: 8,
                color: "var(--text-primary)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.04em",
                marginBottom: 4,
                transition: "background 0.15s, color 0.15s",
              }}
              className="admin-nav-link"
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--glass-border)" }}>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 0",
                background: "transparent",
                border: "1px solid rgba(228,87,87,0.3)",
                borderRadius: 6,
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.05em",
                minHeight: 44,
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div style={{
        display: "none",
        background: "var(--nebula)",
        borderBottom: "1px solid var(--glass-border)",
        padding: "0 16px",
        height: 56,
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
      }}
        className="admin-topbar"
      >
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 20, color: "var(--electric)", letterSpacing: "0.1em" }}>
          HKH ADMIN
        </span>
        <nav style={{ display: "flex", gap: 4 }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 8,
                fontSize: 18,
                textDecoration: "none",
                color: "var(--text-primary)",
              }}
            >
              {link.icon}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: 220,
        minHeight: "100vh",
        padding: "32px 32px",
        background: "var(--void)",
      }}
        className="admin-main"
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar { display: none !important; }
          .admin-topbar { display: flex !important; }
          .admin-main { margin-left: 0 !important; padding: 16px !important; padding-top: 72px !important; }
        }
        .admin-nav-link:hover {
          background: var(--glass-bg) !important;
          color: var(--electric) !important;
        }
      `}</style>
    </div>
  );
}
