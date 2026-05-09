import { create } from "zustand";
import type { Flavour } from "@/data/flavours";
import type { SessionTier } from "@/data/sessions";
import type { RentalModel } from "@/data/rentals";

export interface CartItem {
  id: string;
  type: "flavour" | "rental" | "session" | "addon";
  name: string;
  price: number;
  quantity: number;
  meta?: Record<string, unknown>;
}

export interface BookingState {
  step: 1 | 2 | 3 | 4;
  session: SessionTier | null;
  date: string | null;
  timeSlot: string | null;
  location: "venue" | "delivery";
  deliveryAddress: string;
  selectedFlavours: Flavour[];
  promoCode: string;
  discount: number;
}

interface Store {
  // Cart
  cart: CartItem[];
  cartOpen: boolean;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Booking
  booking: BookingState;
  setBookingStep: (step: 1 | 2 | 3 | 4) => void;
  setBookingSession: (session: SessionTier | null) => void;
  setBookingDate: (date: string | null) => void;
  setBookingTime: (slot: string | null) => void;
  setBookingLocation: (loc: "venue" | "delivery") => void;
  setDeliveryAddress: (addr: string) => void;
  toggleFlavour: (f: Flavour, maxFlavours: number) => void;
  setPromoCode: (code: string) => void;
  resetBooking: () => void;

  // UI
  activeSection: string;
  setActiveSection: (s: string) => void;
  bookingOpen: boolean;
  setBookingOpen: (open: boolean) => void;
}

const defaultBooking: BookingState = {
  step: 1,
  session: null,
  date: null,
  timeSlot: null,
  location: "venue",
  deliveryAddress: "",
  selectedFlavours: [],
  promoCode: "",
  discount: 0,
};

export const useStore = create<Store>((set, get) => ({
  // Cart
  cart: [],
  cartOpen: false,
  addToCart: (item) => {
    const existing = get().cart.find((c) => c.id === item.id);
    if (existing) {
      set((s) => ({ cart: s.cart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + (item.quantity ?? 1) } : c) }));
    } else {
      set((s) => ({ cart: [...s.cart, { ...item, quantity: item.quantity ?? 1 }] }));
    }
  },
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
  updateQuantity: (id, qty) => {
    if (qty <= 0) { get().removeFromCart(id); return; }
    set((s) => ({ cart: s.cart.map((c) => c.id === id ? { ...c, quantity: qty } : c) }));
  },
  clearCart: () => set({ cart: [] }),
  setCartOpen: (open) => set({ cartOpen: open }),
  cartTotal: () => get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0),
  cartCount: () => get().cart.reduce((sum, c) => sum + c.quantity, 0),

  // Booking
  booking: defaultBooking,
  setBookingStep: (step) => set((s) => ({ booking: { ...s.booking, step } })),
  setBookingSession: (session) => set((s) => ({ booking: { ...s.booking, session } })),
  setBookingDate: (date) => set((s) => ({ booking: { ...s.booking, date, timeSlot: null } })),
  setBookingTime: (timeSlot) => set((s) => ({ booking: { ...s.booking, timeSlot } })),
  setBookingLocation: (location) => set((s) => ({ booking: { ...s.booking, location } })),
  setDeliveryAddress: (deliveryAddress) => set((s) => ({ booking: { ...s.booking, deliveryAddress } })),
  toggleFlavour: (f, max) => {
    const cur = get().booking.selectedFlavours;
    const has = cur.find((x) => x.id === f.id);
    if (has) {
      set((s) => ({ booking: { ...s.booking, selectedFlavours: s.booking.selectedFlavours.filter((x) => x.id !== f.id) } }));
    } else if (cur.length < max) {
      set((s) => ({ booking: { ...s.booking, selectedFlavours: [...s.booking.selectedFlavours, f] } }));
    }
  },
  setPromoCode: (promoCode) => set((s) => ({ booking: { ...s.booking, promoCode } })),
  resetBooking: () => set({ booking: defaultBooking }),

  // UI
  activeSection: "hero",
  setActiveSection: (s) => set({ activeSection: s }),
  bookingOpen: false,
  setBookingOpen: (open) => set({ bookingOpen: open }),
}));
