import { MessageSquare, Phone, Store, VenetianMask } from 'lucide-react'
import { DestinationScreen } from './DestinationScreen'

/* SC-020 — Chat List (Phase 2) */
export function ChatsScreen() {
  return (
    <DestinationScreen
      title="Chats"
      phase="Phase 2"
      icon={MessageSquare}
      emptyTitle="Your conversations live here"
      emptyText="Private and group chats, calls, and commerce all start from a single, calm conversation list."
      primaryLabel="Start a conversation"
    />
  )
}

/* SC-063 — Call History (Phase 2) */
export function CallsScreen() {
  return (
    <DestinationScreen
      title="Calls"
      phase="Phase 2"
      icon={Phone}
      emptyTitle="No calls yet"
      emptyText="Voice and video calls flow straight from your conversations — and always return you to them."
      primaryLabel="Start a call"
    />
  )
}

/* SC-080 — Marketplace (Phase 4) */
export function MarketplaceScreen() {
  return (
    <DestinationScreen
      title="Marketplace"
      phase="Phase 4"
      icon={Store}
      emptyTitle="Discover, then talk"
      emptyText="Browse products, then continue the deal inside a conversation. Commerce always returns to chat."
      primaryLabel="Explore products"
    />
  )
}

/* Anonymous Home (Phase 3) — device-identity mode */
export function AnonymousScreen() {
  return (
    <DestinationScreen
      title="Anonymous"
      phase="Phase 3"
      icon={VenetianMask}
      tone="anon"
      emptyTitle="Speak freely, privately"
      emptyText="Anonymous mode uses a device-generated identity. Share a QR code to connect — your registered identity stays completely separate."
      primaryLabel="Create anonymous identity"
    />
  )
}
