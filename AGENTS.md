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
| Database | Supabase (connected — `@supabase/supabase-js` installed) |
| Payments | Paystack (live keys in `.env.local`) |
| Email | Resend API (native fetch, no SDK) |
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
- Step 4 (Review) hits `POST /api/paystack/initialize`, then redirects to `window.location.href = authorization_url` (Paystack-hosted checkout)

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

## Lib Files (`src/lib/`)

| File | Purpose |
|---|---|
| `supabase.ts` | `createClient()` (anon/RLS) and `createServiceClient()` (service role). Full `Database` type definitions for all tables. |
| `paystack.ts` | `initializePayment()`, `verifyPayment()`. All amounts in kobo (KES × 100). Includes `InitializePaymentParams`, `PaystackTransactionData` types. |
| `email.ts` | `sendBookingConfirmation()`, `sendOrderConfirmation()`. Resend API via native fetch. Branded HTML email templates matching design system. |
| `adminAuth.ts` | Cookie-based admin session: `ADMIN_PASSWORD` + `ADMIN_SECRET` env vars. |

## API Routes

### Public
| Route | Method | Purpose |
|---|---|---|
| `/api/paystack/initialize` | POST | Creates pending booking in Supabase, returns `{ authorization_url, reference }` |
| `/api/paystack/verify` | POST | Verifies payment by reference, marks booking confirmed, sends email |
| `/api/paystack/webhook` | POST | Paystack webhook (HMAC-SHA512 validated). Handles `charge.success` idempotently |
| `/api/orders` | POST/GET | Create/list flavour shop orders |
| `/api/inventory` | GET | Public inventory levels |

### Admin (cookie-authenticated)
| Route | Method | Purpose |
|---|---|---|
| `/api/admin/auth` | POST | Login — validates password, sets session cookie |
| `/api/admin/logout` | POST | Clears session cookie |
| `/api/admin/staff` | GET/POST/PATCH/DELETE | Staff CRUD + assigned bookings |
| `/api/admin/bookings/[id]/status` | PATCH | Update booking status |
| `/api/admin/bookings/[id]/staff` | PATCH | Assign staff member to booking |
| `/api/admin/orders/[id]/status` | PATCH | Update order status |
| `/api/admin/orders/[id]/delivery` | POST | Add delivery event |
| `/api/admin/inventory` | GET/PATCH | Read/update inventory stock levels |

## Supabase Schema

Tables defined in `src/lib/supabase.ts` (TypeScript type definitions — must be mirrored in Supabase dashboard):

| Table | Key columns |
|---|---|
| `customers` | `id`, `email`, `name`, `phone` |
| `bookings` | `id`, `customer_id`, `session_id`, `session_name`, `booking_date`, `time_slot`, `status`, `total_kobo`, `paystack_reference`, `notes` |
| `booking_flavours` | `booking_id`, `flavour_id`, `quantity` |
| `orders` | `id`, `customer_id`, `status`, `total_kobo`, `delivery_address`, `paystack_reference` |
| `order_items` | `order_id`, `flavour_id`, `size`, `quantity`, `unit_price_kobo` |
| `inventory` | `flavour_id`, `stock_50g`, `stock_100g`, `stock_250g` |
| `delivery_events` | `order_id`, `status`, `description`, `location` |
| `staff` | `id`, `name`, `phone`, `email`, `area`, `active`, `avatar_emoji`, `booking_count` |

## Admin Dashboard (`/admin`)

Protected by cookie session (`ADMIN_PASSWORD` / `ADMIN_SECRET`). Login at `/admin-login`.

| Page | Route | Description |
|---|---|---|
| Dashboard | `/admin` | KPI cards (bookings, revenue, orders, staff), recent bookings/orders table, low-stock alerts |
| Bookings | `/admin/bookings` | Filterable list with status badges; status update actions |
| Booking Detail | `/admin/bookings/[id]` | Full booking view, staff assignment, status history |
| Orders | `/admin/orders` | Filterable order list |
| Order Detail | `/admin/orders/[id]` | Full order, delivery event timeline, status update |
| Inventory | `/admin/inventory` | Stock levels per flavour/size; inline PATCH to update |
| Staff | `/admin/staff` | CRUD for staff members; toggle active; view assigned bookings |
| Analytics | `/admin/analytics` | 6-month revenue chart, session breakdown, order status breakdown, top inventory |
| Settings | `/admin/settings` | Site config (read/write Supabase `settings` table) |

## Payment Flow (end-to-end)

1. User completes BookingModal steps 1–3
2. Step 4 Review → "Confirm & Pay" → `POST /api/paystack/initialize` → returns `authorization_url`
3. `window.location.href = authorization_url` → user pays on Paystack-hosted page
4. Paystack redirects to `/booking/confirm?reference=xxx` (callback_url)
5. Confirm page calls `POST /api/paystack/verify` → marks booking confirmed → sends email
6. Simultaneously, Paystack fires webhook to `/api/paystack/webhook` (idempotent, HMAC-validated)

## Email System

Sent from: `bookings@hkh.co` via Resend API.

- `sendBookingConfirmation()` — triggered by `/api/paystack/verify` on success
- `sendOrderConfirmation()` — triggered by `/api/orders` POST on payment success
- HTML templates use the same design tokens (violet gradient header, dark bg, electric yellow totals)

## Pending / Next Steps

1. **Supabase SQL** — Run the schema SQL in the Supabase SQL editor to create all tables (TypeScript types are defined; actual DB tables must be created manually)
2. **Hero section** — Replace 3D placeholder with AI-generated video (Kling/Luma/Runway) or wire Spline scene
3. **Email domain** — Verify `hkh.co` sending domain in Resend dashboard so `bookings@hkh.co` works
4. **Orders checkout** — FlavourShop `JarModal` CTA currently adds to cart; wire full Paystack flow for flavour orders (similar to booking flow)
5. **Delivery tracking** — Real-time status updates on order detail page
6. **Paystack webhook URL** — Register `https://hookah-website-two.vercel.app/api/paystack/webhook` in Paystack dashboard

## Development Commands

```bash
npm run dev          # local dev (Turbopack)
npm run build        # production build
npx tsc --noEmit     # type check only
npx vercel --prod    # deploy to production
```
