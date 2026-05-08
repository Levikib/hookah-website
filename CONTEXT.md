# HOOKAH WEBSITE — LIVE PROJECT CONTEXT
## Last Updated: 2026-05-08 | Session 4 complete — COSMIC OVERHAUL done

---

## WHAT THIS FILE IS
Single source of truth for any Claude session picking up this project. Read this first, read the code second, ask zero questions — just build.

---

## REPO + DEV
- **GitHub:** https://github.com/Levikib/hookah-website
- **Project dir:** `/home/shannara/Hookah` (WSL2)
- **Dev server:** `cd /home/shannara/Hookah && npm run dev` → `http://localhost:3000`
- **Node:** v24.11.1 via nvm (`source /home/shannara/.nvm/nvm.sh && nvm use v24.11.1`)
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
│   │   ├── globals.css           ← COSMIC design system (Session 4 overhaul)
│   │   ├── layout.tsx            ← fonts + NavAndCart wrapper
│   │   └── page.tsx              ← COSMIC hero: Sparkles, nebula orbs, clip-path, AnimatedTitle
│   ├── components/
│   │   ├── AnimatedTitle.tsx     ← NEW: GSAP ScrollTrigger word-split 3D reveal
│   │   ├── CustomCursor.tsx      ← NEW: Canvas ember cursor + smoke particle trail
│   │   ├── HookahModel.tsx       ← GLB loader (Draco path set), 7-part explode, mouse parallax
│   │   ├── SmokeParticles.tsx    ← GLSL shader, 2000 particles
│   │   ├── DisassemblySection.tsx← GSAP ScrollTrigger pinned, 7 label cards, progress bar
│   │   ├── FlavourWall.tsx       ← 25 flavours, category filter, AnimatedTitle heading
│   │   ├── SessionsSection.tsx   ← 8 session cards, custom builder, AnimatedTitle heading
│   │   ├── RentalsSection.tsx    ← 6 rental models, carousel, AnimatedTitle heading
│   │   ├── Navigation.tsx        ← floating glassmorphism nav (appears scrollY>80)
│   │   ├── CartDrawer.tsx        ← slide-out cart panel, qty steppers, total
│   │   ├── NavAndCart.tsx        ← client wrapper: CustomCursor + Navigation + CartDrawer
│   │   └── Footer.tsx            ← starfield canvas + hookah constellation + 4-col links
│   ├── data/
│   │   ├── flavours.ts           ← 25 flavours
│   │   ├── sessions.ts           ← 8 session tiers + CUSTOM_PRICING
│   │   └── rentals.ts            ← 6 rental models as RENTAL_MODELS
│   └── store/
│       └── useStore.ts           ← Zustand: cart + booking + UI
```

---

## COSMIC DESIGN SYSTEM (Session 4 overhaul)

**Palette (globals.css :root):**
```css
--void:         #05030a;   /* deepest background */
--nebula:       #0d0a1e;   /* section background */
--nebula-mid:   #120d28;   /* card backgrounds */
--nebula-light: #1a1235;   /* elevated surfaces */
--violet:       #7c3aed;   /* primary brand */
--violet-bright:#9d5cf5;
--cyan:         #06b6d4;   /* secondary */
--cyan-bright:  #22d3ee;
--magenta:      #e879f9;   /* pop/hover */
--gold:         #f59e0b;   /* warmth/ember */
--electric:     #edff66;   /* CTA yellow */
--text-primary: #f0f2fa;
--text-muted:   #a89bc4;
--text-dim:     #6b5f88;
/* Backward compat aliases: */
--black:  var(--void);
--teal:   var(--cyan-bright);
--purple: var(--violet-bright);
```

**Glassmorphism:** violet-tinted `.glass` class, `.glass-cyan`, `.glass-gold`, `.glass-hover`

**Buttons:** `.btn-primary` (electric yellow), `.btn-teal` (alias), `.btn-ghost`

**AnimatedTitle component:**
```tsx
<AnimatedTitle text={Line
