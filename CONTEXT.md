# HOOKAH WEBSITE — LIVE PROJECT CONTEXT
## Last Updated: 2026-05-08 | Session 3 complete

---

## WHAT THIS FILE IS
Single source of truth for any Claude session picking up this project. Read this first, read the code second, ask zero questions — just build.

---

## REPO + DEV
- **GitHub:** https://github.com/Levikib/hookah-website
- **Project dir:** `/home/shannara/Hookah` (WSL2)
- **Dev server:** `cd /home/shannara/Hookah && npm run dev` → `http://localhost:3000`
- **Node:** v24.11.1 via nvm (`export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use v24.11.1`)
- **Build check:** `npm run build` — must stay at 0 TypeScript errors

---

## TECH STACK

| Layer | Tool |
|---|---|
| Framework | Next.js 16.2.6 + Turbopack |
| 3D Engine | Three.js 0.184 + React Three Fiber 9.6 + Drei 10.7 |
| Scroll | GSAP 3.15 + ScrollTrigger |
| UI Animations | Framer Motion 12.38 |
| State | Zustand 5.0 |
| Fonts | Bebas Neue, Barlow Condensed, Inter, Space Mono (next/font/google) |
| Backend | Supabase (not yet wired) |

---

## FILE STRUCTURE

```
/home/shannara/Hookah/
├── public/
│   ├── draco/                    ← Draco decoder (decoder.js, decoder.wasm, wasm_wrapper.js)
│   └── models/
│       └── hookah.glb            ← 16.8KB Draco-compressed, 7 separate nodes
├── src/
│   ├── app/
│   │   ├── globals.css           ← design tokens, glass classes, .btn-teal, .btn-ghost, badges
│   │   ├── layout.tsx            ← fonts + NavAndCart wrapper
│   │   └── page.tsx              ← main page, all sections wired
│   ├── components/
│   │   ├── HookahModel.tsx       ← GLB loader (Draco path set), 7-part explode, mouse parallax
│   │   ├── SmokeParticles.tsx    ← GLSL shader, 2000 particles
│   │   ├── DisassemblySection.tsx← GSAP ScrollTrigger pinned, 7 label cards, progress bar
│   │   ├── FlavourWall.tsx       ← 25 flavours, category filter, stock badges, cart add
│   │   ├── SessionsSection.tsx   ← 8 session cards (Framer Motion tilt), custom builder
│   │   ├── RentalsSection.tsx    ← 6 rental models, horizontal carousel, SVG hookah silhouettes
│   │   ├── Navigation.tsx        ← floating glassmorphism nav (appears scrollY>80)
│   │   ├── CartDrawer.tsx        ← slide-out cart panel, qty steppers, total
│   │   ├── NavAndCart.tsx        ← client wrapper for layout (Navigation + CartDrawer)
│   │   └── Footer.tsx            ← starfield canvas + hookah constellation + 4-col links
│   ├── data/
│   │   ├── flavours.ts           ← 25 flavours (id, name, category, intensity, notes, price, stock, emoji)
│   │   ├── sessions.ts           ← 8 session tiers + CUSTOM_PRICING object
│   │   └── rentals.ts            ← 6 rental models as RENTAL_MODELS (not RENTALS!)
│   └── store/
│       └── useStore.ts           ← Zustand: cart (add/remove/update/clear/total/count) + booking + UI
```

---

## DESIGN SYSTEM

**Colors:** `--black: #0a0a0f` · `--teal: #00f5d4` · `--gold: #ffd700` · `--orange: #ff6b35` · `--purple: #9d4edd`

**Fonts:**
- `var(--font-bebas)` — Bebas Neue. ALL headlines. textTransform: uppercase always.
- `var(--font-barlow)` — Barlow Condensed. Subheads/body in sections.
- `var(--font-inter)` — Inter. General body text.
- `var(--font-mono)` — Space Mono. Prices, tags, labels, codes.

**Glassmorphism `.glass` class:**
```css
background: rgba(255,255,255,0.05); backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;
box-shadow: 0 8px 32px rgba(0,0,0,0.5);
```

**Z-index:** canvas=0, scrim=10, cards=20, overlay=30, nav=50, modal=100, toast=200

**RULE:** No text floats over raw 3D without a scrim or glass card behind it.

---

## WHAT'S BUILT ✅

| Section | Component | Status |
|---|---|---|
| Foundation | globals.css, layout.tsx, data files, Zustand store | ✅ Done |
| Hero | page.tsx inline Canvas, GLSL smoke, mouse parallax | ✅ Done |
| Disassembly | DisassemblySection.tsx, GSAP pinned scroll | ✅ Done |
| Flavour Wall | FlavourWall.tsx, 25 flavours, filters, cart | ✅ Done |
| Sessions | SessionsSection.tsx, 8 tiers, custom builder | ✅ Done |
| Rentals | RentalsSection.tsx, 6 models, carousel | ✅ Done |
| Navigation | Navigation.tsx + CartDrawer.tsx + NavAndCart.tsx | ✅ Done |
| Footer | Footer.tsx, starfield canvas, 4-col links | ✅ Done |
| GitHub | https://github.com/Levikib/hookah-website | ✅ Pushed |

---

## WHAT REMAINS 🔲

1. **Booking Flow** — 4-step modal (session picker → date/time → flavours → review+pay)
   - Zustand booking state already has all fields: step, session, date, timeSlot, location, selectedFlavours
   - `setBookingOpen(true)` triggers from Nav "Book Now" and session cards
   - Step 4 should insert to Supabase bookings table
   - Confirmation: particle burst, booking ref HKH-XXXXXX

2. **Flavour Shop** (Section 7) — 25 flavours purchasable in 50g/100g/250g
   - Different from the Flavour Wall (that's for adding to sessions)
   - Standard ecommerce grid, glassmorphism cards

3. **Supabase wire-up**
   - Tables: bookings, products, sessions, rentals, time_slots, orders
   - .env.local needs: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

4. **Mobile responsive pass**
   - Disable/reduce particles on mobile
   - Stack nav links into hamburger on mobile
   - Grid columns → 1-2 on small screens

5. **Vercel deploy**

---

## KNOWN GOTCHAS

1. **RENTAL_MODELS not RENTALS** — rentals.ts exports `RENTAL_MODELS`. Import as: `import { RENTAL_MODELS as RENTALS } from "@/data/rentals"`
2. **Draco decoder** — must be in `public/draco/`. `useGLTF.setDecoderPath("/draco/")` called in HookahModel.tsx before useGLTF call.
3. **HookahScene.tsx is UNUSED** — page.tsx uses inline Canvas. Keep or delete.
4. **GLB node names** — hookah_base, hookah_plate, hookah_shaft, hookah_bowl, hookah_hose_port, hookah_hose, hookah_mouthpiece.
5. **Sessions name includes "Session"** — "Solo Session", "Squad Session" etc. Don't append it again.
6. **Zustand cartTotal()** — returns number, call it to get the value: `const total = useStore(s => s.cartTotal())`
7. **No @react-three/postprocessing** — was removed because it bundled its own Three.js copy causing "Multiple instances" error.
8. **next.config.ts** — has `turbopack: {}` and webpack three.js alias. Don't remove either.

---

## SECTION SPECS (remaining)

### Booking Flow Modal
- Trigger: `setBookingOpen(true)` from Zustand
- Zustand already has: `booking.step` (1-4), `booking.session`, `booking.date`, `booking.timeSlot`, `booking.location`, `booking.selectedFlavours`
- Step 1: grid of 8 session cards (smaller version of SessionsSection cards)
- Step 2: calendar picker (use HTML date input), time slots (mock: 14:00, 16:00, 18:00, 20:00, 22:00), location radio (venue/delivery)
- Step 3: mini flavour wall — same cards but smaller, limited by session maxFlavours
- Step 4: review summary + "Confirm Booking" button → Supabase insert → show HKH-XXXXXX ref

### Custom Session Price Formula
```
base: $15.00
+ per hookah: $18.00/unit
+ per person: $4.50/person
+ per flavour: $8.00/flavour
+ extra hours beyond 1: $12.00/hr
+ host: $25.00/host/hr
+ catering: $3.50/person
+ delivery: $15.00 flat
```

### Supabase Tables
```sql
bookings (id, session_type, date, time_slot, location, flavours[], total_price, status, reference_code, created_at)
```
Reference code format: `HKH-${Math.random().toString(36).substring(2,8).toUpperCase()}`

---

## ABSOLUTE BUILD RULES
1. Legibility first — text always has glass card or dark scrim backing
2. Bebas Neue ALL headlines, textTransform uppercase always
3. Every section has real hardcoded data — no Lorem ipsum
4. Single scroll journey — no page reloads
5. Build must stay at 0 TypeScript errors
