# SystemBoom Chat — Interactive Prototype

> 🧊 **v1.0.0-prototype — FROZEN baseline** (2026-07-17, commit `cfb4ef1`, tag `v1.0.0-prototype`). See [RELEASE.md](RELEASE.md). No feature work without a new approved phase.

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
| 2 | Registered communication — chat list, private/group chat, new chat, search, calls, notifications, settings | ✅ Complete |
| 3 | Anonymous communication — identity, QR pairing, anonymous chats/groups, identity switching & manager | ✅ Complete |
| 4 | Conversation commerce — marketplace, product, offers, orders, payment, tracking, reviews | ✅ Complete |
| 5 | Polish — loading skeletons, offline + error recovery, empty states, motion, accessibility | ✅ Complete |
| 5.1B | Privacy model alignment — Standard/Private modes (PD-057–PD-067), contact-first creation, dual threads, Continue privately, anonymous E2EE calls, honest security copy | ✅ Complete |

### Phase 2 highlights

- **State store** (`src/data/`) — mock users, conversations, messages (all PS-001 content types), calls, notifications; optimistic send with status progression + mock replies.
- **Conversation experience** (SC-021/022) — text, image, video, voice, document, contact, location, product card & link messages; reply, react, copy, forward, edit, delete; day separators, sender colours, typing indicator, read receipts; announcement-mode lock for group members.
- **Chat list** (SC-020) with All/Unread/Groups, pin/mute/archive, search; **New chat** + **Create group** (SC-023); **Chat info / Shared media / Pinned / In-chat search** (SC-025/026/027/024); **Calls** history + in-call UI (SC-063/061/062); **Notifications**; **Settings** with Privacy/Security/Notifications/Devices (SC-101–105).
- Conversations hide the bottom nav on mobile so the conversation stays the hero (PD-047).

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

### Prototype Assumptions (Phase 5.1B — privacy model)

5. **Seller/commerce conversations default to Standard** (server-assisted commerce);
   PS-003 does not define a mode. "Continue privately" remains available, but commerce
   records are never moved into Private threads.
6. **Anonymous call history is isolated**: anonymous calls are not recorded in the
   registered Call History (SC-063) and no anonymous call-history UI exists yet —
   the documentation does not define one (PD-033 isolation applied).
7. **"Continue privately" is direct-chat only** in this phase; group escalation is
   not defined in the documentation and was not invented.
8. **Multi-device readiness (PD-067):** `privacyMode` is an explicit, extensible
   conversation property; no UI copy promises device sync for Private chats, and
   nothing in the model precludes adding authorized-device key sharing later.
9. **No real cryptography** — privacy modes are a UX prototype; no production
   encryption is implemented or claimed.
