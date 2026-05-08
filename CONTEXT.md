# HOOKAH WEBSITE — LIVE PROJECT CONTEXT
## Last Updated: 2026-05-08 | Auto-updated each session handoff

---

## WHAT THIS FILE IS
This is the single source of truth for any Claude session picking up this project. Read this first, read the code second, ask zero questions — just build.

---

## THE BUSINESS
Hookah rental, flavour sales, session booking. Three services:
- Rent a hookah pot (delivered or in-venue)
- Buy premium shisha flavours
- Book a hookah session (time slot, location, custom setup)

Brand vibe: colorful street meets urban luxury. Dark, neon, electric. NOT sci-fi. NOT techy. Think spray-painted murals, rooftop lounges, neon-lit city blocks.

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
| Backend | Supabase (not yet wired — placeholder data in /src/data/) |
| Deploy | Vercel |
| 3D Models | Blender → GLTF/GLB → Three.js |

**Project directory:** `/home/shannara/Hookah` (WSL2)
**Dev server:** `cd /home/shannara/Hookah && npm run dev` → `http://localhost:3000`

---

## FILE STRUCTURE

```
/home/shannara/Hookah/
├── public/
│   └── models/
│       └── hookah.glb          ← 16.8KB Draco-compressed, 7 separate nodes
├── src/
│   ├── app/
│   │   ├── globals.css         ← design tokens, glass utility classes, buttons
│   │   ├── layout.tsx          ← fonts loaded here as CSS variables
│   │   └── page.tsx            ← main page, hero section done, rest placeholder
│   ├── components/
│   │   ├── HookahModel.tsx     ← loads GLB, handles explode animation + mouse parallax
│   │   ├── HookahScene.tsx     ← Canvas wrapper (currently unused in page.tsx, page uses inline Canvas)
│   │   └── SmokeParticles.tsx  ← GLSL shader particle system, 2000 particles
│   ├── data/
│   │   ├── flavours.ts         ← 25 flavours hardcoded
│   │   ├── sessions.ts         ← 8 session tiers hardcoded
│   │   └── rentals.ts          ← 6 hookah rental models hardcoded
│   └── store/
│       └── useStore.ts         ← Zustand store: cart, booking state, UI state
```

---

## BLENDER MODEL — COMPLETE

**File:** `C:\Users\admin\hookah_model.blend`
**Export:** `C:\Users\admin\hookah_final.glb` (also copied to `public/models/hookah.glb`)

7 separate named nodes (NOT joined — must stay separate for per-part animation):

| Node name | Material | Description |
|---|---|---|
| hookah_base | glass_material (teal, transmission 0.9) | Glass water vase, bottom |
| hookah_plate | brass_material (gold, metallic 1.0) | Mid-shaft tray |
| hookah_shaft | brass_material | Center pole |
| hookah_bowl | clay_material (brown, rough) | Top clay bowl |
| hookah_hose_port | brass_material | Side connector |
| hookah_hose | hose_material (dark) | Bezier curve with bevel |
| hookah_mouthpiece | brass_material | Tapered tip |

Blender MCP: addon at `C:\Users\admin\Documents\blender_mcp_addon.py`, port 9876, plain JSON protocol. Claude Desktop connects directly on Windows side.

---

## DESIGN SYSTEM

**Colors (CSS variables in globals.css):**
```
--black:  #0a0a0f
--teal:   #00f5d4
--gold:   #ffd700
--orange: #ff6b35
--purple: #9d4edd
```

**Fonts:**
- Headlines: `var(--font-bebas)` — Bebas Neue. Street-artistic, bold. ALL headlines.
- Subheads: `var(--font-barlow)` — Barlow Condensed Bold
- Body: `var(--font-inter)` — Inter
- Prices/codes/tags: `var(--font-mono)` — Space Mono

**Glassmorphism standard (`.glass` class in globals.css):**
```css
background: rgba(255,255,255,0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.12);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0,0,0,0.5);
```

**Z-index layers:**
```
z-canvas:  0   (Three.js canvas)
z-scrim:   10  (gradient overlays)
z-cards:   20  (glassmorphism cards)
z-overlay: 30
z-nav:     50
z-modal:   100
z-toast:   200
```

**CRITICAL RULE:** No text ever floats unprotected over complex 3D. Every text element has a glassmorphism card or dark scrim behind it. Legibility is sacred.

---

## WHAT'S BUILT — STATUS PER SECTION

### ✅ DONE
- **Typography system** — all 4 fonts loaded, CSS variables working
- **Design tokens** — globals.css complete with glass classes, buttons, badges, z-layers
- **Zustand store** — cart, booking state, UI state fully typed
- **Data layer** — flavours.ts (25), sessions.ts (8), rentals.ts (6) all hardcoded
- **HookahModel.tsx** — GLB loads, 7-part explode animation works, mouse parallax works
- **SmokeParticles.tsx** — GLSL shader, 2000 particles, rises from bowl position
- **Hero section** — layout done: left text block, right 3D canvas, scroll indicator, CTAs
- **GLB file** — in public/models/hookah.glb, 16.8KB Draco, all 7 nodes

### ❌ CURRENT BLOCKER
**The 3D canvas in the hero is not rendering the hookah model.**

Root cause diagnosed: `THREE.WARNING: Multiple instances of Three.js being imported.`
This comes from `stats-gl` (bundled by @react-three/postprocessing) shipping its own Three.js copy.

**Fix attempted but not yet confirmed working:**
- `npm dedupe` ran but didn't remove stats-gl's copy
- `next.config.ts` webpack alias added to force all Three.js imports to root copy
- Dev server was restarted but screenshot confirmation of fix not done yet

**What to do first in next session:**
1. Check if the webpack alias fix worked — open `http://localhost:3000` and see if hookah renders
2. If still blank — check browser console for errors. Most likely fix:
   - Remove `@react-three/postprocessing` from package.json (we don't use it yet)
   - `npm install` to remove it
   - Restart dev server
3. If GLB not found — verify `public/models/hookah.glb` exists (it does per file listing)
4. If "Element type invalid" error — the dynamic import in an older version of page.tsx was the culprit; current page.tsx uses inline Canvas with Suspense which should be fine

### 🔲 NOT STARTED YET (build these in order)
1. Fix the 3D render blocker (above)
2. **Section 2** — GSAP ScrollTrigger hookah disassembly with label cards
3. **Section 3** — Flavour Wall (25 flavours, 3D floating grid, filters, cart)
4. **Section 4** — Sessions (8 tiers + custom builder with live price calc)
5. **Section 5** — Booking flow (4-step modal wired to Supabase)
6. **Section 6** — Rentals showroom (6 models, 3D carousel)
7. **Section 7** — Flavour shop (purchase to keep, size variants)
8. **Navigation** — floating glassmorphism nav + cart drawer
9. **Section 8** — Outro + footer + starfield
10. **Mobile responsive pass**
11. **Supabase wire-up** (tables: bookings, products, sessions, rentals, time_slots, orders)
12. **GitHub push + Vercel deploy**

---

## KNOWN ISSUES / GOTCHAS

1. **Multiple Three.js instances** — stats-gl bundles its own copy. Either remove @react-three/postprocessing or keep the webpack alias in next.config.ts resolving all three imports to one copy.
2. **HookahScene.tsx is unused** — page.tsx uses an inline Canvas instead. Either use HookahScene or delete it to avoid confusion.
3. **PCFSoftShadowMap deprecation warning** — harmless, Three.js 0.184 renamed it. Can fix with `gl={{ shadowMap: { type: THREE.PCFShadowMap } }}` on Canvas.
4. **GLB node names** — confirmed correct: hookah_base, hookah_plate, hookah_shaft, hookah_bowl, hookah_hose_port, hookah_hose, hookah_mouthpiece. HookahModel.tsx references these exactly.
5. **Environment preset="night"** in HookahScene.tsx fetches from CDN — can block render on slow connections. Use `<Environment files="/hdri/night.hdr" />` with a local file, or remove Environment entirely and rely on manual point lights (which page.tsx already does correctly).

---

## SECTION SPECS (for building remaining sections)

### Section 2 — Disassembly
- Pinned with GSAP ScrollTrigger (scrub: 1.5, pin: true)
- On scroll 0→1: hookah parts drift to EXPLODE_OFFSETS positions (already defined in HookahModel.tsx)
- HTML overlay cards (glassmorphism, position: absolute) appear next to each part
- Cards must NOT overlap each other or the 3D parts
- Label copy per part: see master brief

### Section 3 — Flavour Wall
- 25 flavours from src/data/flavours.ts
- 3D floating grid: 5 cols × 5 rows, varying Z depths
- Per card: emoji (48px), name (Bebas Neue 28px), category tag, intensity bar (3 segments), flavor note chips, price (gold Space Mono), stock badge, "ADD TO SESSION" button
- Stock rules: >20 normal | 5-20 "LOW STOCK" orange | <5 "ALMOST GONE" pulsing red | 0 greyed out disabled
- Filter bar: Classic, Fresh, Fruity, Tropical, Floral, Specialty, Novelty, Premium, Mystery
- Camera drifts forward through grid on scroll

### Section 4 — Sessions
- 8 session tiers from src/data/sessions.ts
- Cards tilt on hover (Framer Motion useMotionValue)
- "MOST POPULAR" badge on Squad Session
- Custom builder: sliders/steppers, live price calc, formula in master brief

### Section 5 — Booking Flow
- 4-step stepper inside glassmorphism modal
- Step 1: session picker | Step 2: date/time/location | Step 3: flavour selection | Step 4: review + pay
- Confirmation: particle burst, smoke fill, booking ref HKH-XXXXXX
- Supabase insert on confirm (wire when ready)

### Section 6 — Rentals
- 6 models from src/data/rentals.ts
- 3D showroom: camera pans left/right on scroll
- Use hookah GLB with material color swaps per model tier
- Spotlight on active model

### Section 7 — Flavour Shop
- Same 25 flavours, purchasable in 50g/100g/250g
- Standard ecommerce grid, glassmorphism styled

### Navigation
- Appears after hero scroll starts (scrollY > 60)
- Glassmorphism: rgba(10,10,15,0.85) + blur
- Logo left | Sessions, Flavours, Rentals links center | Book Now CTA + cart icon right
- Cart icon shows count badge, opens slide-out drawer

### Section 8 — Outro
- Camera rises through smoke → starfield
- Hookah constellation from stars
- Footer: 4-column links, social, copyright

---

## CUSTOM SESSION PRICE FORMULA
```
base: $15.00
+ per hookah: $18.00/unit
+ per person: $4.50/person
+ per flavour: $8.00/flavour
+ hours beyond 1: $12.00/hr
+ host add-on: $25.00/host/hr
+ catering: $3.50/person
+ delivery: $15.00 flat
```

---

## SUPABASE TABLES NEEDED (not yet created)
```sql
bookings (id, user_id, session_type, date, time_slot, location, flavours[], total_price, status, reference_code, created_at)
products (id, name, category, intensity, notes[], price, stock_count, color, active)
sessions (id, name, tagline, duration, people, equipment[], price, popular)
rentals (id, name, tagline, height, material, hose_type, daily_rate, session_rate, available, tier)
time_slots (id, date, time, capacity, booked_count)
orders (id, user_id, items[], total, status, created_at)
```

---

## GITHUB (NOT YET PUSHED)
Repo needs to be created and code pushed. Do this:
```bash
cd /home/shannara/Hookah
git init
git add .
git commit -m "Initial commit — hero section, data layer, 3D model"
# then create repo on GitHub and push
```

---

## ABSOLUTE BUILD RULES
1. Legibility first — text always has backing (glass card or dark scrim)
2. No element overlaps another — deliberate z-indexing always
3. Bebas Neue for ALL headlines — never generic sans, never sci-fi font
4. Every section has real data — no Lorem ipsum, no placeholder names
5. Single scroll journey — no page reloads, React state persists across sections
6. 3D world reacts to user choices — flavour selection changes bowl color, time selection changes lighting
7. Drive Blender via MCP tools for any new models — user does not click manually
