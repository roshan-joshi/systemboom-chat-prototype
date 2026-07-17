# SystemBoom Chat — Prototype Release Baseline

| | |
|---|---|
| **Prototype Version** | v1.0.0-prototype |
| **Status** | 🧊 **FROZEN** — official Version 1 baseline for future development |
| **Freeze Date** | 2026-07-17 |
| **Frozen Commit** | `cfb4ef1` (tagged `v1.0.0-prototype`) |
| **Deployment** | https://roshan-joshi.github.io/systemboom-chat-prototype/ |
| **Documentation Version** | Chat docs @ `862854d` — SB-CHAT-07 v1.3 · PS-001 v1.4 · PS-002 v1.3 · PS-004 v1.2 · SM-001 v1.2 · SM-002 v1.2 · SM-003 v1.1 · SM-004 v1.2 · PD-001–PD-067 |
| **Approval trail** | Phase 4 audit → 4.1 stabilization → 5 polish → 5.1B privacy model → 5.1C UX validation ("Ready to Freeze After Minor Polish") → 5.1D polish ("Ready to Freeze") |

## Release Notes (v1.0.0-prototype)

**Foundation & system** — SystemBoom brand v1 (bomb mascot, red/gold/ink; violet anonymous), design-token system with equal-weight light/dark themes, DS-003 component library, hash routing keyed to SM-002 screen IDs, mobile-first responsive shell (bottom nav ↔ desktop rail), accessibility layer (focus traps, ARIA, reduced motion, skip links).

**Registered Communication** — chat list with filters/pin/mute/archive, Direct & Group chat with all PS-001 message types, replies/reactions/edit/delete/pin, read receipts, typing, announcement mode, chat info/shared media/pinned/search, notifications, settings (privacy/security/notifications/devices).

**Privacy model (PD-057–PD-067)** — Standard (silent default; "secured in transit and at rest") and Private (E2EE) modes for direct + group conversations; contact-first creation with pre-creation mode selection, locked at first message; Standard/Private coexistence per contact with separate histories; **Continue privately** escalation; steel-lock indicator system (list, header, chat info, composer); honest security wording everywhere.

**Anonymous Communication (PD-033/060/061)** — separate violet environment with device-generated identities, QR/public-key pairing, fingerprints, identity manager, anonymous direct/group chat, **anonymous E2EE voice & video calls** on the shared call screens, zero-knowledge messaging.

**Conversation Commerce (PS-003)** — marketplace, product details, in-chat product/offer/order cards, negotiation with offers, order creation at negotiated price, mock payment providers, live delivery tracking in-conversation, reviews; orders permanently linked to conversations.

**Calls** — voice/video from any conversation, security captions per mode (Secure call / E2EE / E2EE · zero-knowledge), environment-correct return.

**Polish** — loading skeletons, offline mode with failed-send retry, payment/QR-scan failure recovery, error boundary, motion, empty states.

## Known Limitations

1. **No production cryptography** — privacy modes and all E2EE/zero-knowledge claims are UX prototype states only; nothing is actually encrypted. This build must never be represented as implementing real security.
2. No backend — all data is in-memory mock state; refresh resets runtime changes.
3. SC-060 Incoming Call, SC-120–126 shared screens (global search, media viewer, camera, pickers, share sheet) are simulated or absent per prototype scope.
4. "Continue privately" is direct-chat only (group escalation undefined in docs).
5. Anonymous call history is not surfaced (isolation assumption, PD-033).
6. Multi-device support deferred (model is PD-067-compatible).
7. Auth screens (SC-010–013) intentionally excluded (no-auth prototype brief).
8. AI assistant intentionally deferred (PD-062 governs future placement).

## Future Roadmap (post-freeze, subject to product approval)

- Global search (SC-120) & media viewer (SC-121)
- Incoming-call experience (SC-060)
- Group-level "Continue privately" (needs product ruling)
- Private-mode fingerprint verification (reuse anonymous pattern)
- AI assistant surfaces per PD-062 (server-assisted in Standard only)
- Multi-device key model (Open Question #13) & account recovery (#5)
- Anonymous discovery mechanism (Open Question #2)
- Enterprise workspaces / desktop two-pane exploration

---
*This document records release metadata only. The frozen product behaviour is defined by the documentation set and commit `cfb4ef1`.*
