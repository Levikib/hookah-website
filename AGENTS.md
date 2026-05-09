<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# HKH — Hookah Website: Project Documentation

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Runtime | React 19.2.4 |
| Language | TypeScript (strict) |
| Animation | GSAP 3.15 + ScrollTrigger |
| 3D | React Three Fiber + Three.js (Hero only) |
| State | Zustand (`src/store/useStore.ts`) |
| Fonts | Bebas Neue, Barlow Condensed, Inter, Space Mono, Cormorant Garamond |
| Styling | Inline styles + `globals.css` design tokens |
| Deploy | Vercel (prod alias: `hookah-website-two.vercel.app`) |

## Design System (`src/app/globals.css`)

All colours are CSS variables on `:root`:

- `--void` `#05030a` — deepest background
- `--nebula` `#0d0a1e` — section background
- `--violet` `#7c3aed` — primary brand
- `--cyan` / `--cyan-bright` `#06b6d4` / `#22d3ee` — secondary
- `--magenta` `#e879f9` — pop/hover
- `--gold` `#f59e0b` — warmth/price
- `--electric` `#edff66` — CTA yellow (primary CTA colour)
- `--font-bebas` — headings (all-caps)
- `--font-barlow` — subheadings / UI labels
- `--font-mono` / `--font-serif` — mono labels / Cormorant italic accents

**All prices are KES (Kenyan Shillings).** Use the helper `function kes(n) { return \`KES \${n.toLocaleString("en-KE")}\`; }` — defined locally per component.

## Currency

**KES everywhere.** No USD, no `.toFixed(2)` (KES uses whole numbers). The `kes()` helper is copy-pasted into each component that needs it.

## Mobile

The site is **fully mobile responsive**. Rules:

- All touch targets ≥ 44px (`min-height: 44px`)
- Use `useIsMobile()` from `src/context/MobileContext.tsx` for breakpoint logic
- Grids use `minmax(min(Xpx, calc(50% - Ypx)), 1fr)` so they degrade to 2-col on narrow phones without overflow
- Never hardcode `gridTemplateColumns` without a mobile fallback
- Sidebars (e.g. PackageWizard price sidebar) switch from `260px` column to full-width via `@media (min-width: 768px)` CSS class override
- Safe areas: use `env(safe-area-inset-*)` for notched phones on modals/sticky bars
- Buttons stacked on mobile with `width: 100%` via `.btn-primary/.btn-teal` media query in globals.css
- No `position: sticky` on mobile sidebars without a class-based `@media` guard

## Page Structure (`src/app/page.tsx`)

| # | Section | Component | ID |
|---|---|---|---|
| 1 | Hero | inline (page.tsx) | `#home` |
| 2 | Disassembly | `DisassemblySection` | — |
| 3 | Flavour Wall (3D sphere) | `FlavourWall` | `#flavours` |
| 4 | Sessions | `SessionsSection` | `#sessions` |
| 5 | Rentals / Showroom | `RentalsSection` | `#rentals` |
| 6 | Flavour Shop | `FlavourShop` | `#shop` |
| 7 | Package Wizard | `PackageWizard` | `#builder` |
| 8 | Footer | `Footer` | — |

Global overlays (always mounted): `NavAndCart` (= Navigation + CartDrawer + CustomCursor), `BookingModal`.

## Components

### `CustomCursor`
- RAF-driven; NO CSS transitions on outer ring (causes lag)
- Size lerped manually: `curSize.current += (target - curSize.current) * 0.18`
- States: `"default"` | `"hover"` | `"card"`

### `Navigation`
- Floating pill nav; appears after 80px scroll
- Mobile: hamburger with GSAP bar animations + fullscreen menu
- Tracks active section via IntersectionObserver

### `CartDrawer`
- Slide-in from right, `min(420px, 95vw)` wide
- Qty steppers are 44×44px touch targets
- Calls `setBookingOpen(true)` to hand off to BookingModal

### `BookingModal`
- 4-step wizard: Session → Date/Time → Flavours → Review
- `useIsMobile()` for layout switching (1-col mobile, 2-col desktop)
- Calendar built from scratch (no external lib)
- Delivery fee: KES 2,000

### `FlavourWall`
- CSS3D sphere/helix of 36 flavour cards
- Drag to orbit (pointer events, 8px threshold before drag starts)
- Morph animation between layouts via GSAP
- `setPointerCapture` intentionally absent (would swallow card clicks)

### `FlavourShop`
- Wooden shelves with animated SVG jars per flavour
- SMIL bubble animations + liquid slosh inside each jar
- `JarModal` opens on jar click: hero row, tasting notes, size picker (50g/100g/250g), KES CTA
- Section label: "FLAVOUR SHOP · THE LAB"

### `SessionsSection`
- Horizontal momentum-scroll with RAF (velocity × 0.94 decay)
- 8 cinematic SVG scene illustrations per session type
- Tap detection: 8px movement threshold before treating as drag
- `SessionModal` shows scene illustration + Cormorant serif layout + KES price

### `RentalsSection`
- Flat 3×2 CSS grid (all 6 models equally clickable)
- Per-model animated SVG hookah illustrations (`active` prop controls smoke/fire)
- 3D tilt on hover (GSAP rotateX/Y), 6px tap threshold
- `DetailPanel` slides from right on selection; "Reserve This Piece" → addToCart

### `PackageWizard`
- 5-step wizard: Occasion → Piece → Flavours → Add-ons → Review
- Live price ticker in right sidebar (collapses to top bar on mobile)
- `canAdvance` gating per step; GSAP slide transitions between steps
- On "Confirm & Book" → adds all items to cart → opens BookingModal

## Data Files

| File | Exports |
|---|---|
| `src/data/flavours.ts` | `FLAVOURS`, `CATEGORIES`, `getStockStatus()`, `Flavour` type |
| `src/data/sessions.ts` | `SESSIONS`, `SessionTier` type |
| `src/data/rentals.ts` | `RENTAL_MODELS`, `RentalModel` type |

## Store (`src/store/useStore.ts`)

Key state:

```ts
CartItem.type: "flavour" | "rental" | "session" | "addon"
```

Key actions: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `setCartOpen`, `setBookingOpen`.

## Pending / Next Steps

1. **Hero section** — Replace 3D model with AI-generated video (Kling/Luma/Runway) or wire Spline scene
2. **Supabase backend** — Schema: `orders`, `bookings`, `customers`, `inventory`, `delivery_events`
3. **Paystack integration** — API routes: `/api/paystack/initialize`, `/api/paystack/verify`, `/api/paystack/webhook`
4. **Email confirmations** — Resend/Nodemailer for booking confirmed, order received, delivery update
5. **Full checkout flow** — Connect BookingModal "Confirm" to real payment API
6. **Delivery tracking** — Real-time status updates

## Development Commands

```bash
npm run dev          # local dev (Turbopack)
npm run build        # production build
npx tsc --noEmit     # type check only
npx vercel --prod    # deploy to production
```
