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
    title: string
    price: string
    image: string
    seller: string
    availability: 'In stock' | 'Low stock' | 'Made to order'
  }
  link?: { url: string; title: string; desc: string; host: string }
}

export type Role = 'owner' | 'admin' | 'member'

export interface Participant {
  userId: ID
  role: Role
}

export type GroupType = 'standard' | 'family' | 'business'

export interface Conversation {
  id: ID
  kind: 'private' | 'group'
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
