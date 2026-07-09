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
  AppNotification,
  CallRecord,
  Conversation,
  ID,
  Message,
  MessageStatus,
  User,
} from './types'
import { USERS, CONVERSATIONS, MESSAGES, CALLS, NOTIFICATIONS, ME } from './mock'

/* ---------------- State ---------------- */
interface State {
  users: Record<ID, User>
  conversations: Conversation[]
  messages: Record<ID, Message>
  calls: CallRecord[]
  notifications: AppNotification[]
  typing: Record<ID, boolean>
}

function initState(): State {
  return {
    users: { ...USERS },
    conversations: CONVERSATIONS.map((c) => ({ ...c })),
    messages: Object.fromEntries(MESSAGES.map((m) => [m.id, m])),
    calls: [...CALLS],
    notifications: [...NOTIFICATIONS],
    typing: {},
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
  toggleArchive: (id: ID) => void
  markRead: (conversationId: ID) => void
  createGroup: (name: string, memberIds: ID[], groupType?: Conversation['groupType']) => ID
  openOrCreatePrivate: (userId: ID) => ID
  readAllNotifications: () => void
  readNotification: (id: ID) => void
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
      toggleArchive: (id) => {
        const c = state.conversations.find((x) => x.id === id)
        dispatch({ type: 'patch_conversation', id, patch: { archived: !c?.archived } })
      },
      markRead: (conversationId) => dispatch({ type: 'mark_read', conversationId }),
      createGroup: (name, memberIds, groupType = 'standard') => {
        const id = `c_${Date.now()}`
        const conversation: Conversation = {
          id,
          kind: 'group',
          title: name,
          groupType,
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

/** Conversations sorted by last activity, excluding archived by default. */
export function useConversationList(opts?: { archived?: boolean }) {
  const { state } = useStore()
  return useMemo(() => {
    const lastAt = (c: Conversation) => {
      const last = c.messageIds[c.messageIds.length - 1]
      return last ? state.messages[last]?.createdAt ?? 0 : 0
    }
    return state.conversations
      .filter((c) => (opts?.archived ? c.archived : !c.archived))
      .sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
        return lastAt(b) - lastAt(a)
      })
  }, [state.conversations, state.messages, opts?.archived])
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
    return conv.messageIds.map((mid) => state.messages[mid]).filter(Boolean)
  }, [state.conversations, state.messages, conversationId])
}

/** Display title + subtitle for a conversation (private → user, group → title). */
export function conversationTitle(conv: Conversation, users: Record<ID, User>): string {
  if (conv.kind === 'group') return conv.title ?? 'Group'
  return users[conv.userId ?? '']?.name ?? 'Unknown'
}
