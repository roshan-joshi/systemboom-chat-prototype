/*
  Mock data model for the SystemBoom Chat prototype (Phase 2 — Registered Comms).
  No backend: this shape is what a real API would hydrate. Message/content types
  and states follow PS-001 / PS-002.
*/

export type ID = string

export type Presence = 'online' | 'away' | 'offline'

export interface User {
  id: ID
  name: string
  avatar?: string
  about?: string
  phone?: string
  presence: Presence
  lastSeen?: string
  verified?: boolean
  business?: boolean
  // Anonymous (device-identity) fields — PS-004 / PS-006
  anon?: boolean
  sessionId?: string
  publicKey?: string
  fingerprint?: string
}

/**
 * An anonymous, device-generated cryptographic identity (PD-033).
 * The public key is shareable (QR); the private key never leaves the device.
 * Visible fields per PS-006: temporary display name, avatar, session id.
 */
export interface AnonIdentity {
  id: ID
  name: string // temporary display name
  sessionId: string
  publicKey: string
  fingerprint: string
  createdAt: number
}

/** PS-001 supported content types (Stickers are Future). */
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'voice'
  | 'document'
  | 'contact'
  | 'location'
  | 'product'
  | 'link'
  | 'system'
  | 'offer'
  | 'order'

/** PS-001 message states. */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Reaction {
  emoji: string
  by: ID[]
}

export interface Message {
  id: ID
  conversationId: ID
  authorId: ID // 'me' for the current user
  type: MessageType
  text?: string
  createdAt: number
  status: MessageStatus
  editedAt?: number
  deleted?: boolean
  starred?: boolean
  pinned?: boolean
  replyToId?: ID
  reactions?: Reaction[]
  // type-specific payloads
  image?: { url: string; caption?: string }
  video?: { thumb: string; duration: string; caption?: string }
  voice?: { duration: string; waveform?: number[] }
  document?: { name: string; size: string; ext: string }
  contact?: { name: string; phone: string }
  location?: { label: string; area: string }
  product?: {
    productId?: ID
    title: string
    price: string
    image: string
    seller: string
    availability: 'In stock' | 'Low stock' | 'Made to order'
  }
  link?: { url: string; title: string; desc: string; host: string }
  // Conversation Commerce (PS-003)
  offer?: {
    productId: ID
    title: string
    price: number // proposed unit price
    qty: number
    by: 'buyer' | 'seller'
    status: 'pending' | 'accepted' | 'declined'
    note?: string
  }
  orderRef?: { orderId: ID } // renders a live order card
}

/* ============ Conversation Commerce (PS-003) ============ */
export interface Product {
  id: ID
  title: string
  price: number // in NPR (Rs)
  image: string // gradient key / placeholder
  category: string
  sellerId: ID
  availability: 'In stock' | 'Low stock' | 'Made to order'
  rating: number
  reviews: number
  description: string
  gallery?: string[]
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface OrderItem {
  productId: ID
  title: string
  image: string
  unitPrice: number
  qty: number
}

export interface Order {
  id: ID
  conversationId: ID // permanently linked (PD-037)
  sellerId: ID
  items: OrderItem[]
  finalPrice: number
  deliveryFee: number
  address: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  createdAt: number
  reviewed?: boolean
  tracking?: { code: string; courier: string }
}

export interface Review {
  id: ID
  orderId: ID
  sellerId: ID
  sellerRating: number
  productRating: number
  text: string
  at: number
}

export type Role = 'owner' | 'admin' | 'member'

export interface Participant {
  userId: ID
  role: Role
}

export type GroupType = 'standard' | 'family' | 'business'

/**
 * Registered conversation privacy mode (PD-057). Chosen contact-first before the
 * first message; permanent once the conversation is created (PD-058, PD-063).
 * Anonymous conversations have no mode — they are always E2EE (PD-060).
 */
export type PrivacyMode = 'standard' | 'private'

export interface Conversation {
  id: ID
  kind: 'private' | 'group'
  /** Which communication environment this conversation belongs to (PD-033). */
  env?: 'registered' | 'anonymous'
  /**
   * Privacy mode for registered conversations (PD-057/PD-058). A pair of users
   * may hold one conversation per mode (PD-064). Undefined ⇒ 'standard'.
   * Note: `kind: 'private'` means one-to-one (Direct); the E2EE mode lives here.
   */
  privacyMode?: PrivacyMode
  messageIds: ID[]
  unread: number
  pinned?: boolean
  muted?: boolean
  archived?: boolean
  draft?: string
  // private
  userId?: ID
  // group
  title?: string
  photo?: string
  groupType?: GroupType
  participants?: Participant[]
  announcementMode?: boolean
  encrypted?: boolean
}

export interface CallRecord {
  id: ID
  userId: ID
  direction: 'incoming' | 'outgoing' | 'missed'
  kind: 'voice' | 'video'
  at: number
  duration?: string
}

export type NotificationKind =
  | 'message'
  | 'missed_call'
  | 'mention'
  | 'group_invite'
  | 'reaction'
  | 'order'

export interface AppNotification {
  id: ID
  kind: NotificationKind
  fromId: ID
  title: string
  body: string
  at: number
  read: boolean
  conversationId?: ID
}
