# SystemBoom Chat — Interactive Prototype

A production-quality, interactive UX prototype of the SystemBoom Chat product.
This is **the product experience**, not a developer demo — suitable for investors,
partners, UX testing, product reviews, and as the frontend blueprint.

Built strictly from the documentation in `../docs` (the source of truth).
No backend, no APIs, no databases, no auth, no business logic — realistic mock data only.

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check + production bundle
```

## Stack

- **Vite + React 18 + TypeScript** — the standard for a maintainable frontend blueprint
- **Hash router** (`src/lib/router.tsx`) — zero-config static hosting; routes keyed to Screen IDs (SC-XXX)
- **CSS design tokens** (`src/styles/tokens.css`) — semantic light/dark themes; components consume tokens only
- **lucide-react** — one consistent icon set (DS-002 iconography)

## Architecture

```
src/
  styles/        tokens (DS-002) · global · components (DS-003) · screens
  lib/           theme · router · hooks (a11y, responsive) · utils
  components/    DS-003 component system (foundation, navigation, feedback, overlay, input)
  screens/       one component per screen, mapped to SC-XXX IDs
  app/           routes registry (SC-ID → screen) + responsive AppShell
```

## Documentation alignment

- **Navigation** — 5 Level-1 destinations (Home, Chats, Calls, Marketplace, Profile) per SM-001 / DS-003 (≤5)
- **Screen IDs** — every route carries its SM-002 `SC-XXX` id (PD-039)
- **Components** — built once, reused everywhere (PD-054/055/056)
- **Themes** — Light + Dark are equal-weight (DS-002); respects system preference + reduced motion
- **Experience** — conversation is the hero; calm, premium, minimal (DS-001, DS-002)

## Build phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Foundation — nav, routing, theme, responsive, dark mode, components, animation, a11y | ✅ Complete |
| 2 | Registered communication — chat list, private/group chat, search, calls, notifications, settings | ⏳ Planned |
| 3 | Anonymous communication — identity, QR pairing, anonymous chats, switching | ⏳ Planned |
| 4 | Conversation commerce — marketplace, product, order, payment, tracking | ⏳ Planned |
| 5 | Polish — motion, transitions, empty/loading/error/offline states | ⏳ Planned |

## Prototype Assumptions (Phase 1)

Recorded for later review — small UX decisions not fully specified by the docs:

1. **Concrete token values** (colours, type scale, spacing, motion). DS-002 owns their *purpose*
   and explicitly delegates values to implementation. A calm indigo brand hue was chosen to be
   recognisably SystemBoom and distinct from competitors.
2. **Design System screen** (`/design`) — a prototype-only foundation gallery (id `PT-design`),
   not an official SC screen.
3. **Desktop expansion** uses a left nav rail; mobile/tablet use bottom navigation. Docs specify
   mobile-first with desktop as an extension, not the exact desktop chrome.
4. **Level-1 destinations** shown as premium empty states until their delivery phase.
