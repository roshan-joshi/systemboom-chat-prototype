import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type {
  AnonIdentity,
  AppNotification,
  CallRecord,
  Conversation,
  ID,
  Message,
  MessageStatus,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Review,
  User,
} from './types'
import {
  USERS,
  CONVERSATIONS,
  MESSAGES,
  CALLS,
  NOTIFICATIONS,
  ME,
  MY_ANON,
  keyMaterial,
  ANON_ADJECTIVES,
  ANON_ANIMALS,
  PRODUCTS,
  ORDERS,
} from './mock'

/** Runtime randomness (fine in-app; only workflow scripts forbid it). */
function rand(n: number) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0] % n
  }
  return Math.floor(Math.random() * n)
}
function randomAnonName(): string {
  return `${ANON_ADJECTIVES[rand(ANON_ADJECTIVES.length)]} ${ANON_ANIMALS[rand(ANON_ANIMALS.length)]} ${1000 + rand(9000)}`
}

/* ---------------- State ---------------- */
interface State {
  users: Record<ID, User>
  conversations: Conversation[]
  messages: Record<ID, Message>
  calls: CallRecord[]
  notifications: AppNotification[]
  typing: Record<ID, boolean>
  // Anonymous environment (PS-004 / PD-033)
  anonIdentities: AnonIdentity[]
  activeAnonId: ID
  // Conversation Commerce (PS-003)
  products: Product[]
  orders: Record<ID, Order>
  reviews: Review[]
}

function initState(): State {
  return {
    users: { ...USERS },
    conversations: CONVERSATIONS.map((c) => ({ ...c })),
    messages: Object.fromEntries(MESSAGES.map((m) => [m.id, m])),
    calls: [...CALLS],
    notifications: [...NOTIFICATIONS],
    typing: {},
    anonIdentities: [{ ...MY_ANON }],
    activeAnonId: MY_ANON.id,
    products: [...PRODUCTS],
    orders: Object.fromEntries(ORDERS.map((o) => [o.id, o])),
    reviews: [],
  }
}

type Action =
  | { type: 'add_message'; message: Message }
  | { type: 'update_message'; id: ID; patch: Partial<Message> }
  | { type: 'set_status'; id: ID; status: MessageStatus }
  | { type: 'delete_message'; id: ID; forEveryone: boolean }
  | { type: 'react'; id: ID; emoji: string; userId: ID }
  | { type: 'patch_conversation'; id: ID; patch: Partial<Conversation> }
  | { type: 'add_conversation'; conversation: Conversation }
  | { type: 'set_typing'; conversationId: ID; typing: boolean }
  | { type: 'mark_read'; conversationId: ID }
  | { type: 'read_all_notifications' }
  | { type: 'read_notification'; id: ID }
  | { type: 'add_user'; user: User }
  | { type: 'add_anon_identity'; identity: AnonIdentity }
  | { type: 'set_active_anon'; id: ID }
  | { type: 'delete_anon_identity'; id: ID }
  | { type: 'add_order'; order: Order }
  | { type: 'patch_order'; id: ID; patch: Partial<Order> }
  | { type: 'add_review'; review: Review }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add_message': {
      const m = action.message
      const conv = state.conversations.find((c) => c.id === m.conversationId)
      return {
        ...state,
        messages: { ...state.messages, [m.id]: m },
        conversations: state.conversations.map((c) =>
          c.id === m.conversationId
            ? { ...c, messageIds: [...c.messageIds, m.id], draft: m.authorId === ME ? '' : c.draft }
            : c,
        ),
        // touch order handled by selector; keep as-is
        ...(conv ? {} : {}),
      }
    }
    case 'update_message':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: { ...state.messages[action.id], ...action.patch },
        },
      }
    case 'set_status':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: { ...state.messages[action.id], status: action.status },
        },
      }
    case 'delete_message': {
      const msg = state.messages[action.id]
      if (!msg) return state
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: { ...msg, deleted: true, text: undefined, reactions: undefined },
        },
      }
    }
    case 'react': {
      const msg = state.messages[action.id]
      if (!msg) return state
      const reactions = [...(msg.reactions ?? [])]
      const existing = reactions.find((r) => r.emoji === action.emoji)
      let next = reactions
      if (existing) {
        const has = existing.by.includes(action.userId)
        const by = has
          ? existing.by.filter((u) => u !== action.userId)
          : [...existing.by, action.userId]
        next = by.length
          ? reactions.map((r) => (r.emoji === action.emoji ? { ...r, by } : r))
          : reactions.filter((r) => r.emoji !== action.emoji)
      } else {
        next = [...reactions, { emoji: action.emoji, by: [action.userId] }]
      }
      return { ...state, messages: { ...state.messages, [action.id]: { ...msg, reactions: next } } }
    }
    case 'patch_conversation':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c,
        ),
      }
    case 'add_conversation':
      return { ...state, conversations: [action.conversation, ...state.conversations] }
    case 'set_typing':
      return { ...state, typing: { ...state.typing, [action.conversationId]: action.typing } }
    case 'mark_read':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, unread: 0 } : c,
        ),
      }
    case 'read_all_notifications':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'read_notification':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      }
    case 'add_user':
      return { ...state, users: { ...state.users, [action.user.id]: action.user } }
    case 'add_anon_identity':
      return {
        ...state,
        anonIdentities: [...state.anonIdentities, action.identity],
        activeAnonId: action.identity.id,
      }
    case 'set_active_anon':
      return { ...state, activeAnonId: action.id }
    case 'delete_anon_identity': {
      const remaining = state.anonIdentities.filter((a) => a.id !== action.id)
      if (remaining.length === 0) return state // never delete the last identity
      return {
        ...state,
        anonIdentities: remaining,
        activeAnonId: state.activeAnonId === action.id ? remaining[0].id : state.activeAnonId,
      }
    }
    case 'add_order':
      return { ...state, orders: { ...state.orders, [action.order.id]: action.order } }
    case 'patch_order':
      return {
        ...state,
        orders: { ...state.orders, [action.id]: { ...state.orders[action.id], ...action.patch } },
      }
    case 'add_review':
      return { ...state, reviews: [...state.reviews, action.review] }
    default:
      return state
  }
}

/* ---------------- Canned auto-replies (mock liveliness) ---------------- */
const REPLIES = [
  'Got it 👍',
  'Sounds good!',
  'Thanks for letting me know.',
  'Perfect, that works for me.',
  'Let me check and get back to you.',
  'Nice — really like that.',
  '😄 agreed',
  'Will do.',
]

interface StoreApi {
  state: State
  me: ID
  sendMessage: (conversationId: ID, partial: Partial<Message> & { type: Message['type'] }) => void
  retryMessage: (id: ID) => void
  react: (id: ID, emoji: string) => void
  deleteMessage: (id: ID, forEveryone: boolean) => void
  editMessage: (id: ID, text: string) => void
  setDraft: (conversationId: ID, draft: string) => void
  togglePin: (id: ID) => void
  toggleMute: (id: ID) => void
  setAnnouncementMode: (id: ID, on: boolean) => void
  togglePinMessage: (messageId: ID) => void
  toggleArchive: (id: ID) => void
  markRead: (conversationId: ID) => void
  createGroup: (
    name: string,
    memberIds: ID[],
    opts?: { groupType?: Conversation['groupType']; env?: 'registered' | 'anonymous' },
  ) => ID
  openOrCreatePrivate: (userId: ID) => ID
  readAllNotifications: () => void
  readNotification: (id: ID) => void
  // Anonymous environment
  createAnonIdentity: (name?: string) => ID
  setActiveAnon: (id: ID) => void
  deleteAnonIdentity: (id: ID) => void
  /** Simulate scanning/exchanging a QR public key → new anon contact + chat. */
  pairViaQR: (name?: string) => ID
  // Conversation Commerce (PS-003)
  shareProduct: (conversationId: ID, productId: ID) => void
  sendOffer: (conversationId: ID, offer: { productId: ID; price: number; qty: number; note?: string }) => void
  createOrder: (args: { conversationId: ID; sellerId: ID; items: OrderItem[]; deliveryFee: number; address: string }) => ID
  payOrder: (orderId: ID, method: string) => void
  reviewOrder: (orderId: ID, r: { sellerRating: number; productRating: number; text: string }) => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const idRef = useRef(1000)
  const nextId = () => `m${++idRef.current}`

  const sendMessage = useCallback<StoreApi['sendMessage']>((conversationId, partial) => {
    const id = nextId()
    const message: Message = {
      status: 'sending',
      ...partial,
      id,
      conversationId,
      authorId: ME,
      createdAt: Date.now(),
    }
    dispatch({ type: 'add_message', message })
    // Optimistic status progression.
    window.setTimeout(() => dispatch({ type: 'set_status', id, status: 'sent' }), 450)
    window.setTimeout(() => dispatch({ type: 'set_status', id, status: 'delivered' }), 1100)

    // Mock reply only for private, non-muted conversations.
    const conv = state.conversations.find((c) => c.id === conversationId)
    const canReply = conv && conv.kind === 'private' && conv.userId && conv.userId !== ME
    if (canReply && conv) {
      window.setTimeout(() => dispatch({ type: 'set_status', id, status: 'read' }), 1900)
      window.setTimeout(() => dispatch({ type: 'set_typing', conversationId, typing: true }), 1500)
      window.setTimeout(() => {
        dispatch({ type: 'set_typing', conversationId, typing: false })
        const reply: Message = {
          id: nextId(),
          conversationId,
          authorId: conv.userId!,
          type: 'text',
          text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
          status: 'delivered',
          createdAt: Date.now(),
        }
        dispatch({ type: 'add_message', message: reply })
      }, 2600)
    }
  }, [state.conversations])

  const api = useMemo<StoreApi>(
    () => ({
      state,
      me: ME,
      sendMessage,
      retryMessage: (id) => {
        dispatch({ type: 'set_status', id, status: 'sending' })
        window.setTimeout(() => dispatch({ type: 'set_status', id, status: 'sent' }), 500)
        window.setTimeout(() => dispatch({ type: 'set_status', id, status: 'delivered' }), 1100)
      },
      react: (id, emoji) => dispatch({ type: 'react', id, emoji, userId: ME }),
      deleteMessage: (id, forEveryone) => dispatch({ type: 'delete_message', id, forEveryone }),
      editMessage: (id, text) =>
        dispatch({ type: 'update_message', id, patch: { text, editedAt: Date.now() } }),
      setDraft: (conversationId, draft) =>
        dispatch({ type: 'patch_conversation', id: conversationId, patch: { draft } }),
      togglePin: (id) => {
        const c = state.conversations.find((x) => x.id === id)
        dispatch({ type: 'patch_conversation', id, patch: { pinned: !c?.pinned } })
      },
      toggleMute: (id) => {
        const c = state.conversations.find((x) => x.id === id)
        dispatch({ type: 'patch_conversation', id, patch: { muted: !c?.muted } })
      },
      setAnnouncementMode: (id, on) =>
        dispatch({ type: 'patch_conversation', id, patch: { announcementMode: on } }),
      togglePinMessage: (messageId) => {
        const m = state.messages[messageId]
        if (m) dispatch({ type: 'update_message', id: messageId, patch: { pinned: !m.pinned } })
      },
      toggleArchive: (id) => {
        const c = state.conversations.find((x) => x.id === id)
        dispatch({ type: 'patch_conversation', id, patch: { archived: !c?.archived } })
      },
      markRead: (conversationId) => dispatch({ type: 'mark_read', conversationId }),
      createGroup: (name, memberIds, opts) => {
        const env = opts?.env ?? 'registered'
        const id = `${env === 'anonymous' ? 'ac' : 'c'}_${Date.now()}`
        const conversation: Conversation = {
          id,
          kind: 'group',
          env,
          title: name,
          groupType: opts?.groupType ?? 'standard',
          encrypted: true,
          unread: 0,
          participants: [
            { userId: ME, role: 'owner' },
            ...memberIds.map((u) => ({ userId: u, role: 'member' as const })),
          ],
          messageIds: [],
        }
        dispatch({ type: 'add_conversation', conversation })
        const sys: Message = {
          id: nextId(),
          conversationId: id,
          authorId: ME,
          type: 'system',
          text: `You created the group “${name}”`,
          status: 'read',
          createdAt: Date.now(),
        }
        dispatch({ type: 'add_message', message: sys })
        return id
      },
      openOrCreatePrivate: (userId) => {
        const existing = state.conversations.find(
          (c) => c.kind === 'private' && c.userId === userId,
        )
        if (existing) {
          if (existing.archived) dispatch({ type: 'patch_conversation', id: existing.id, patch: { archived: false } })
          return existing.id
        }
        const id = `c_${Date.now()}`
        dispatch({
          type: 'add_conversation',
          conversation: { id, kind: 'private', userId, messageIds: [], unread: 0, encrypted: true },
        })
        return id
      },
      readAllNotifications: () => dispatch({ type: 'read_all_notifications' }),
      readNotification: (id) => dispatch({ type: 'read_notification', id }),

      createAnonIdentity: (name) => {
        const id = `anon-${Date.now()}`
        const nm = name?.trim() || randomAnonName()
        const identity: AnonIdentity = {
          id,
          name: nm,
          createdAt: Date.now(),
          ...keyMaterial(nm + id),
        }
        dispatch({ type: 'add_anon_identity', identity })
        return id
      },
      setActiveAnon: (id) => dispatch({ type: 'set_active_anon', id }),
      deleteAnonIdentity: (id) => dispatch({ type: 'delete_anon_identity', id }),

      pairViaQR: (name) => {
        const nm = name?.trim() || randomAnonName()
        const userId = `a_${Date.now()}`
        const km = keyMaterial(nm + userId)
        const user: User = { id: userId, name: nm, presence: 'online', anon: true, ...km }
        dispatch({ type: 'add_user', user })
        const convId = `ac_${Date.now()}`
        const conversation: Conversation = {
          id: convId,
          kind: 'private',
          env: 'anonymous',
          userId,
          messageIds: [],
          unread: 0,
          encrypted: true,
        }
        dispatch({ type: 'add_conversation', conversation })
        dispatch({
          type: 'add_message',
          message: {
            id: `m${++idRef.current}`,
            conversationId: convId,
            authorId: ME,
            type: 'system',
            text: 'Identities exchanged via QR. This conversation is end-to-end encrypted.',
            status: 'read',
            createdAt: Date.now(),
          },
        })
        return convId
      },

      /* ---------------- Conversation Commerce (PS-003) ---------------- */
      shareProduct: (conversationId, productId) => {
        const p = state.products.find((x) => x.id === productId)
        if (!p) return
        dispatch({
          type: 'add_message',
          message: {
            id: `m${++idRef.current}`,
            conversationId,
            authorId: ME,
            type: 'product',
            status: 'sent',
            createdAt: Date.now(),
            product: {
              productId: p.id,
              title: p.title,
              price: `Rs ${p.price.toLocaleString()}`,
              image: p.image,
              seller: state.users[p.sellerId]?.name ?? 'Seller',
              availability: p.availability,
            },
          },
        })
      },

      sendOffer: (conversationId, offer) => {
        const p = state.products.find((x) => x.id === offer.productId)
        const mid = `m${++idRef.current}`
        const base = { productId: offer.productId, title: p?.title ?? 'Product', price: offer.price, qty: offer.qty, by: 'buyer' as const, note: offer.note }
        dispatch({
          type: 'add_message',
          message: { id: mid, conversationId, authorId: ME, type: 'offer', status: 'sent', createdAt: Date.now(), offer: { ...base, status: 'pending' } },
        })
        const conv = state.conversations.find((c) => c.id === conversationId)
        const sellerId = conv?.userId ?? p?.sellerId
        // Mock seller accepts the offer.
        window.setTimeout(() => {
          dispatch({ type: 'update_message', id: mid, patch: { offer: { ...base, status: 'accepted' } } })
          if (sellerId)
            dispatch({
              type: 'add_message',
              message: { id: `m${++idRef.current}`, conversationId, authorId: sellerId, type: 'text', text: `Deal 🤝 Rs ${offer.price.toLocaleString()} × ${offer.qty} works for me. Tap “Create order” when you’re ready.`, status: 'delivered', createdAt: Date.now() },
            })
        }, 1900)
      },

      createOrder: ({ conversationId, sellerId, items, deliveryFee, address }) => {
        const id = `ord_${Date.now()}`
        const finalPrice = items.reduce((s, i) => s + i.unitPrice * i.qty, 0) + deliveryFee
        const order: Order = { id, conversationId, sellerId, items, finalPrice, deliveryFee, address, status: 'pending_payment', paymentStatus: 'unpaid', createdAt: Date.now() }
        dispatch({ type: 'add_order', order })
        dispatch({ type: 'add_message', message: { id: `m${++idRef.current}`, conversationId, authorId: ME, type: 'system', text: `Order created · Rs ${finalPrice.toLocaleString()}`, status: 'read', createdAt: Date.now() } })
        dispatch({ type: 'add_message', message: { id: `m${++idRef.current}`, conversationId, authorId: ME, type: 'order', status: 'sent', createdAt: Date.now(), orderRef: { orderId: id } } })
        return id
      },

      payOrder: (orderId, method) => {
        const order = state.orders[orderId]
        if (!order || order.paymentStatus === 'paid') return // never pay twice
        const tracking = { code: 'SB' + String(1000 + Math.floor(Math.random() * 9000)) + 'NP', courier: 'Boom Express' }
        dispatch({ type: 'patch_order', id: orderId, patch: { paymentStatus: 'paid', status: 'confirmed', paymentMethod: method, tracking } })
        const cid = order.conversationId
        // Only a status confirmation is posted — never payment details (PS-003).
        dispatch({ type: 'add_message', message: { id: `m${++idRef.current}`, conversationId: cid, authorId: ME, type: 'system', text: 'Payment confirmed ✓', status: 'read', createdAt: Date.now() } })
        const steps: [OrderStatus, string, number][] = [
          ['shipped', `Item shipped · ${tracking.courier} (${tracking.code})`, 4500],
          ['out_for_delivery', 'Out for delivery', 9000],
          ['delivered', 'Delivered ✓', 13500],
        ]
        steps.forEach(([status, text, delay]) =>
          window.setTimeout(() => {
            dispatch({ type: 'patch_order', id: orderId, patch: { status } })
            dispatch({ type: 'add_message', message: { id: `m${++idRef.current}`, conversationId: cid, authorId: order.sellerId, type: 'system', text, status: 'delivered', createdAt: Date.now() } })
          }, delay),
        )
      },

      reviewOrder: (orderId, r) => {
        const order = state.orders[orderId]
        if (!order) return
        dispatch({ type: 'patch_order', id: orderId, patch: { reviewed: true, status: 'completed' } })
        dispatch({ type: 'add_review', review: { id: `rev_${Date.now()}`, orderId, sellerId: order.sellerId, sellerRating: r.sellerRating, productRating: r.productRating, text: r.text, at: Date.now() } })
        dispatch({ type: 'add_message', message: { id: `m${++idRef.current}`, conversationId: order.conversationId, authorId: ME, type: 'system', text: `You reviewed this order · ${r.sellerRating}★`, status: 'read', createdAt: Date.now() } })
      },
    }),
    [state, sendMessage],
  )

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

/* ---------------- Selectors ---------------- */
export function useUser(id?: ID): User | undefined {
  const { state } = useStore()
  return id ? state.users[id] : undefined
}

/** Conversations sorted by last activity, scoped to an environment (PD-033). */
export function useConversationList(opts?: {
  archived?: boolean
  env?: 'registered' | 'anonymous'
}) {
  const { state } = useStore()
  const env = opts?.env ?? 'registered'
  return useMemo(() => {
    const lastAt = (c: Conversation) => latestMessage(c, state.messages)?.createdAt ?? 0
    return state.conversations
      .filter((c) => (c.env ?? 'registered') === env)
      .filter((c) => (opts?.archived ? c.archived : !c.archived))
      .sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
        return lastAt(b) - lastAt(a)
      })
  }, [state.conversations, state.messages, opts?.archived, env])
}

/** Anonymous identities + the currently active one (PS-006). */
export function useAnonIdentities(): AnonIdentity[] {
  const { state } = useStore()
  return state.anonIdentities
}
export function useActiveAnon(): AnonIdentity {
  const { state } = useStore()
  return state.anonIdentities.find((a) => a.id === state.activeAnonId) ?? state.anonIdentities[0]
}

/* ---------------- Commerce selectors (PS-003) ---------------- */
export function useProducts(): Product[] {
  return useStore().state.products
}
export function useProduct(id?: ID): Product | undefined {
  const { state } = useStore()
  return id ? state.products.find((p) => p.id === id) : undefined
}
export function useOrder(id?: ID): Order | undefined {
  const { state } = useStore()
  return id ? state.orders[id] : undefined
}
export function useOrders(): Order[] {
  const { state } = useStore()
  return useMemo(
    () => Object.values(state.orders).sort((a, b) => b.createdAt - a.createdAt),
    [state.orders],
  )
}

export function useConversation(id?: ID): Conversation | undefined {
  const { state } = useStore()
  return state.conversations.find((c) => c.id === id)
}

export function useMessages(conversationId?: ID): Message[] {
  const { state } = useStore()
  return useMemo(() => {
    const conv = state.conversations.find((c) => c.id === conversationId)
    if (!conv) return []
    return conv.messageIds
      .map((mid) => state.messages[mid])
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt) // chronological, regardless of insertion order
  }, [state.conversations, state.messages, conversationId])
}

/** Most recent message of a conversation by timestamp (not insertion order). */
export function latestMessage(
  conv: Conversation,
  messages: Record<ID, Message>,
): Message | undefined {
  let latest: Message | undefined
  for (const mid of conv.messageIds) {
    const m = messages[mid]
    if (m && (!latest || m.createdAt > latest.createdAt)) latest = m
  }
  return latest
}

/** Display title + subtitle for a conversation (private → user, group → title). */
export function conversationTitle(conv: Conversation, users: Record<ID, User>): string {
  if (conv.kind === 'group') return conv.title ?? 'Group'
  return users[conv.userId ?? '']?.name ?? 'Unknown'
}
