"use client";
import { useStore } from "@/store/useStore";

export default function CartDrawer() {
  const cartOpen = useStore((s) => s.cartOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const cart = useStore((s) => s.cart);
  const cartTotal = useStore((s) => s.cartTotal());
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const clearCart = useStore((s) => s.clearCart);
  const setBookingOpen = useStore((s) => s.setBookingOpen);

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 95vw)",
          zIndex: 100,
          background: "rgba(10,10,15,0.97)",
          backdropFilter: "blur(30px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: 28,
                color: "#fff",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Your Session
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--teal)",
                letterSpacing: "0.1em",
                marginTop: 4,
              }}
            >
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {cart.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 16,
                opacity: 0.4,
              }}
            >
              <span style={{ fontSize: 48 }}>🌿</span>
              <p
                style={{
                  fontFamily: "var(--font-barlow)",
                  fontSize: 16,
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                Your session cart is empty.
                <br />Add flavours to get started.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "14px 18px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-barlow)",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--gold)",
                        marginTop: 2,
                      }}
                    >
                      ${item.price.toFixed(2)} ea
                    </p>
                  </div>

                  {/* Qty stepper */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      padding: "4px 8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        item.quantity <= 1
                          ? removeFromCart(item.id)
                          : updateQuantity(item.id, item.quantity - 1)
                      }
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: "none", background: "rgba(255,255,255,0.1)",
                        color: "#fff", cursor: "pointer", fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "#fff",
                        minWidth: 16,
                        textAlign: "center",
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: "none", background: "rgba(255,255,255,0.1)",
                        color: "#fff", cursor: "pointer", fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "#fff",
                      fontWeight: 700,
                      minWidth: 52,
                      textAlign: "right",
                    }}
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            style={{
              padding: "20px 28px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Subtotal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-barlow)",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 22,
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => {
                setCartOpen(false);
                setBookingOpen(true);
              }}
              className="btn-teal"
              style={{ width: "100%", fontSize: 15, marginBottom: 10 }}
            >
              Book This Session →
            </button>

            <button
              onClick={clearCart}
              style={{
                width: "100%",
                padding: "10px",
                background: "none",
                border: "none",
                fontFamily: "var(--font-barlow)",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
