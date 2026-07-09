import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Play,
  Mic,
  FileText,
  MapPin,
  Phone,
  ShoppingBag,
  Link2,
  MoreHorizontal,
  BadgeCheck,
  Pin,
  BellOff,
  Users,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  Contact as ContactIcon,
  Plus,
  SendHorizontal,
  Camera,
  Smile,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'
import type { Message, MessageStatus, User, Conversation } from '@/data/types'
import { clockTime, dayLabel, listTime } from '@/data/format'
import { Icon } from './Icon'
import { Avatar } from './Avatar'
import { IconButton } from './primitives'

/* ---------- gradient placeholders (offline-safe stand-ins for media) ---------- */
const GRAD: Record<string, string> = {
  'grad-1': 'linear-gradient(135deg,#d92a20,#f0a007)',
  'grad-2': 'linear-gradient(135deg,#f0a007,#d92a20)',
  'grad-3': 'linear-gradient(135deg,#2d688f,#12303f)',
  'prod-1': 'linear-gradient(135deg,#d92a20,#3a0f0a)',
}
const grad = (key?: string) => GRAD[key ?? ''] ?? 'linear-gradient(135deg,#55606e,#1c2530)'

/* ---------------- Status ticks ---------------- */
export function StatusTicks({ status }: { status: MessageStatus }) {
  if (status === 'sending') return <Icon as={Clock} size={13} />
  if (status === 'failed') return <Icon as={AlertCircle} size={13} className="sb-ticks--fail" />
  if (status === 'sent') return <Icon as={Check} size={14} />
  return (
    <span className={cx('sb-ticks', status === 'read' && 'sb-ticks--read')}>
      <Icon as={CheckCheck} size={15} />
    </span>
  )
}

/* ---------------- Day separator & system message ---------------- */
export function DaySeparator({ ts }: { ts: number }) {
  return <div className="sb-daysep">{dayLabel(ts)}</div>
}
export function SystemMessage({ text }: { text: string }) {
  return <div className="sb-sysmsg">{text}</div>
}

/* ---------------- Conversation list item (SC-020) ---------------- */
export function ConversationListItem({
  title,
  avatarName,
  avatarSrc,
  kind,
  presence,
  preview,
  time,
  unread,
  pinned,
  muted,
  verified,
  active,
  status,
  onClick,
  onContext,
}: {
  title: string
  avatarName: string
  avatarSrc?: string
  kind: 'private' | 'group' | 'business'
  presence?: 'online' | 'away' | 'offline'
  preview: ReactNode
  time: number
  unread: number
  pinned?: boolean
  muted?: boolean
  verified?: boolean
  active?: boolean
  status?: MessageStatus
  onClick?: () => void
  onContext?: () => void
}) {
  const pressed = useRef(false)
  const longPress = useLongPress(() => {
    pressed.current = true
    onContext?.()
  })
  return (
    <button
      className="sb-convo"
      aria-current={active || undefined}
      {...(onContext ? longPress : {})}
      onContextMenu={
        onContext
          ? (e) => {
              e.preventDefault()
              onContext()
            }
          : undefined
      }
      onClick={() => {
        if (pressed.current) {
          pressed.current = false
          return
        }
        onClick?.()
      }}
    >
      <Avatar
        name={avatarName}
        src={avatarSrc}
        kind={kind === 'private' ? 'user' : kind}
        size="lg"
        presence={presence}
      />
      <span className="sb-convo__body">
        <span className="sb-convo__top">
          <span className="sb-convo__name">
            {title}
            {verified && (
              <Icon as={BadgeCheck} size={14} className="sb-inline-verified" label="Verified" />
            )}
          </span>
          <span className={cx('sb-convo__time', unread > 0 && 'sb-convo__time--unread')}>
            {listTime(time)}
          </span>
        </span>
        <span className="sb-convo__bottom">
          <span className={cx('sb-convo__preview', muted && 'sb-convo__preview--muted')}>
            {status && status !== 'read' && status !== 'sending' && (
              <StatusTicks status={status} />
            )}
            {preview}
          </span>
          <span className="sb-convo__meta">
            {pinned && <Icon as={Pin} size={13} className="sb-convo__pin" />}
            {muted && <Icon as={BellOff} size={13} />}
            {unread > 0 && (
              <span className={cx('sb-count', muted && 'sb-count--muted')}>
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </span>
        </span>
      </span>
    </button>
  )
}

/* ---------------- Reactions ---------------- */
function Reactions({ message, me }: { message: Message; me: string }) {
  if (!message.reactions?.length) return null
  return (
    <div className="sb-reacts">
      {message.reactions.map((r) => (
        <span key={r.emoji} className={cx('sb-react', r.by.includes(me) && 'sb-react--mine')}>
          {r.emoji}
          {r.by.length > 1 && <span className="sb-react__count">{r.by.length}</span>}
        </span>
      ))}
    </div>
  )
}

/* ---------------- Bubble content by type ---------------- */
function BubbleContent({ m }: { m: Message }) {
  switch (m.type) {
    case 'image':
      return (
        <div className="sb-media">
          <div className="sb-media__ph" style={{ background: grad(m.image?.url) }}>
            <Icon as={ImageIcon} size={30} />
          </div>
          {m.image?.caption && <div className="sb-media__caption">{m.image.caption}</div>}
        </div>
      )
    case 'video':
      return (
        <div className="sb-media">
          <div className="sb-media__ph" style={{ background: grad(m.video?.thumb) }} />
          <div className="sb-media__play">
            <span className="sb-media__playbtn"><Icon as={Play} size={22} /></span>
          </div>
          <span className="sb-media__dur">{m.video?.duration}</span>
          {m.video?.caption && <div className="sb-media__caption">{m.video.caption}</div>}
        </div>
      )
    case 'voice':
      return (
        <div className="sb-voice">
          <span className="sb-voice__btn"><Icon as={Play} size={16} /></span>
          <span className="sb-wave">
            {(m.voice?.waveform ?? [4,7,10,6,9,12,7,5,8,6,4,9,11,6,8,5,7]).map((h, i) => (
              <span key={i} style={{ height: `${Math.max(4, h * 1.8)}px` }} />
            ))}
          </span>
          <span className="sb-voice__time">{m.voice?.duration}</span>
        </div>
      )
    case 'document':
      return (
        <div className="sb-doc">
          <span className="sb-doc__icon"><Icon as={FileText} size={18} /></span>
          <span>
            <span className="sb-doc__name" style={{ display: 'block' }}>{m.document?.name}</span>
            <span className="sb-doc__size">{m.document?.ext} · {m.document?.size}</span>
          </span>
        </div>
      )
    case 'contact':
      return (
        <div className="sb-mcard">
          <span className="sb-mcard__icon"><Icon as={ContactIcon} size={20} /></span>
          <span>
            <span className="sb-mcard__title" style={{ display: 'block' }}>{m.contact?.name}</span>
            <span className="sb-mcard__sub">{m.contact?.phone}</span>
          </span>
        </div>
      )
    case 'location':
      return (
        <div>
          <div className="sb-map"><span className="sb-map__pin"><Icon as={MapPin} size={26} /></span></div>
          <div className="sb-mcard">
            <span className="sb-mcard__icon"><Icon as={MapPin} size={18} /></span>
            <span>
              <span className="sb-mcard__title" style={{ display: 'block' }}>{m.location?.label}</span>
              <span className="sb-mcard__sub">{m.location?.area}</span>
            </span>
          </div>
        </div>
      )
    case 'product':
      return (
        <div className="sb-prodmsg">
          <div className="sb-prodmsg__img" style={{ background: grad(m.product?.image) }}>
            <Icon as={ShoppingBag} size={30} />
          </div>
          <div className="sb-prodmsg__title">{m.product?.title}</div>
          <div className="sb-prodmsg__row">
            <span className="sb-prodmsg__price">{m.product?.price}</span>
            <span className="sb-badge sb-badge--success">{m.product?.availability}</span>
          </div>
        </div>
      )
    case 'link':
      return (
        <div>
          {m.text && <div className="sb-bubble__text" style={{ marginBottom: 6 }}>{m.text}</div>}
          <div className="sb-linkprev">
            <div className="sb-linkprev__img" style={{ background: grad('grad-3') }}>
              <Icon as={Link2} size={24} />
            </div>
            <div className="sb-linkprev__body">
              <div className="sb-linkprev__host">{m.link?.host}</div>
              <div className="sb-linkprev__title">{m.link?.title}</div>
              <div className="sb-linkprev__desc">{m.link?.desc}</div>
            </div>
          </div>
        </div>
      )
    default:
      return <span className="sb-bubble__text">{m.text}</span>
  }
}

/* ---------------- Chat bubble ---------------- */
export function ChatBubble({
  message,
  author,
  isMine,
  showSender,
  grouped,
  replyTo,
  replyAuthor,
  me,
  onOpenActions,
  onJumpToReply,
}: {
  message: Message
  author?: User
  isMine: boolean
  showSender?: boolean
  grouped?: boolean
  replyTo?: Message
  replyAuthor?: User
  me: string
  onOpenActions: (m: Message) => void
  onJumpToReply?: (id: string) => void
}) {
  const m = message
  const longPress = useLongPress(() => onOpenActions(m))
  const withMeta = m.type !== 'product' && m.type !== 'location'

  return (
    <div
      className={cx('sb-msgrow', isMine ? 'sb-msgrow--out' : 'sb-msgrow--in', grouped ? 'sb-msgrow--grouped' : 'sb-msgrow--first')}
    >
      {!isMine && (
        <span className="sb-msgrow__avatar" style={{ visibility: grouped ? 'hidden' : 'visible' }}>
          <Avatar name={author?.name ?? '?'} size="sm" />
        </span>
      )}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          className={cx(
            'sb-bubble',
            isMine ? 'sb-bubble--out' : 'sb-bubble--in',
            (m.type === 'image' || m.type === 'video') && !m.deleted && 'sb-bubble--media',
          )}
          {...longPress}
          onContextMenu={(e) => {
            e.preventDefault()
            onOpenActions(m)
          }}
          tabIndex={0}
          role="button"
          aria-label={`Message from ${isMine ? 'you' : author?.name}. Activate for options.`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onOpenActions(m)
          }}
        >
          {showSender && !isMine && !m.deleted && (
            <div className="sb-bubble__sender" style={{ color: senderColor(author?.name ?? '') }}>
              {author?.name}
            </div>
          )}

          {replyTo && !m.deleted && (
            <div
              className="sb-replyquote"
              onClick={(e) => {
                e.stopPropagation()
                onJumpToReply?.(replyTo.id)
              }}
            >
              <span className="sb-replyquote__name">
                {replyTo.authorId === me ? 'You' : replyAuthor?.name}
              </span>
              <span className="sb-replyquote__text">{previewOf(replyTo)}</span>
            </div>
          )}

          {m.deleted ? (
            <span className="sb-bubble__text" style={{ opacity: 0.7, fontStyle: 'italic' }}>
              🚫 This message was deleted
            </span>
          ) : (
            <BubbleContent m={m} />
          )}

          {withMeta && (
            <span className="sb-bubble__meta">
              {m.editedAt && !m.deleted && <span className="sb-bubble__edited">edited</span>}
              {m.pinned && <Icon as={Pin} size={11} />}
              {clockTime(m.createdAt)}
              {isMine && !m.deleted && <StatusTicks status={m.status} />}
            </span>
          )}
        </div>
        <Reactions message={m} me={me} />
      </div>
    </div>
  )
}

/* ---------------- Typing bubble ---------------- */
export function TypingBubble({ name }: { name?: string }) {
  return (
    <div className="sb-msgrow sb-msgrow--in sb-msgrow--first">
      <span className="sb-msgrow__avatar">
        <Avatar name={name ?? '?'} size="sm" />
      </span>
      <div className="sb-bubble sb-bubble--in" aria-label={`${name ?? 'Someone'} is typing`}>
        <span className="sb-typing"><span /><span /><span /></span>
      </div>
    </div>
  )
}

/* ---------------- Attachment options (bottom sheet body) ---------------- */
export interface AttachOption {
  label: string
  icon: LucideIcon
  color: string
  onSelect: () => void
}
export function AttachmentGrid({ options }: { options: AttachOption[] }) {
  return (
    <div className="sb-attach-grid">
      {options.map((o) => (
        <button key={o.label} className="sb-attach-opt" onClick={o.onSelect}>
          <span className="sb-attach-opt__icon" style={{ background: o.color }}>
            <Icon as={o.icon} size="lg" />
          </span>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export const DEFAULT_ATTACH_ICONS = {
  photo: ImageIcon,
  camera: Camera,
  video: VideoIcon,
  document: File,
  contact: ContactIcon,
  location: MapPin,
  product: ShoppingBag,
  call: Phone,
  group: Users,
  add: Plus,
  send: SendHorizontal,
  voice: Mic,
  more: MoreHorizontal,
}

/* ---------------- Message composer (PS-001 layout: primary interaction area) ---------------- */
export function MessageComposer({
  value,
  onChange,
  onSend,
  onAttach,
  onEmoji,
  replyTo,
  replyAuthorName,
  onCancelReply,
  locked,
  lockedLabel,
  placeholder = 'Message',
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onAttach: () => void
  onEmoji?: () => void
  replyTo?: Message
  replyAuthorName?: string
  onCancelReply?: () => void
  locked?: boolean
  lockedLabel?: string
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [value])

  if (locked) {
    return (
      <div className="sb-composer">
        <div className="sb-composer__locked">
          <Icon as={BellOff} size="sm" />
          {lockedLabel ?? 'Only admins can send messages'}
        </div>
      </div>
    )
  }

  const hasText = value.trim().length > 0

  return (
    <div className="sb-composer">
      {replyTo && (
        <div className="sb-composer__reply">
          <div className="sb-composer__reply-body">
            <div className="sb-composer__reply-name">
              Replying to {replyTo.authorId === 'me' ? 'yourself' : replyAuthorName}
            </div>
            <div className="sb-composer__reply-text">{previewOf(replyTo)}</div>
          </div>
          <IconButton icon={X} label="Cancel reply" size="sm" onClick={onCancelReply} />
        </div>
      )}
      <div className="sb-composer__row">
        <div className="sb-composer__field">
          <IconButton icon={Plus} label="Add attachment" onClick={onAttach} />
          <textarea
            ref={ref}
            className="sb-composer__input"
            rows={1}
            value={value}
            placeholder={placeholder}
            aria-label="Message"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (hasText) onSend()
              }
            }}
          />
          <IconButton icon={Smile} label="Emoji" onClick={onEmoji} />
        </div>
        <button
          className={cx('sb-composer__send', !hasText && 'sb-composer__send--mic')}
          aria-label={hasText ? 'Send message' : 'Record voice message'}
          onClick={() => hasText && onSend()}
        >
          <Icon as={hasText ? SendHorizontal : Mic} size="md" />
        </button>
      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */
export function previewOf(m: Message): string {
  if (m.deleted) return 'This message was deleted'
  switch (m.type) {
    case 'image': return '📷 Photo'
    case 'video': return '🎬 Video'
    case 'voice': return `🎤 Voice message`
    case 'document': return `📄 ${m.document?.name ?? 'Document'}`
    case 'contact': return `👤 ${m.contact?.name ?? 'Contact'}`
    case 'location': return `📍 ${m.location?.label ?? 'Location'}`
    case 'product': return `🛍️ ${m.product?.title ?? 'Product'}`
    case 'link': return m.text || m.link?.title || 'Link'
    case 'system': return m.text ?? ''
    default: return m.text ?? ''
  }
}

const SENDER_COLORS = ['#d33124', '#2d6f9c', '#b7791a', '#b83280', '#3f8f66', '#6b57c9', '#c85a3a', '#4a7a99']
function senderColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i)
  return SENDER_COLORS[Math.abs(h) % SENDER_COLORS.length]
}

/** Long-press (touch) that also works with mouse hold. */
function useLongPress(cb: () => void, ms = 450) {
  const timer = useRef<number | null>(null)
  const clear = () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }
  useEffect(() => clear, [])
  return {
    onPointerDown: () => {
      clear()
      timer.current = window.setTimeout(cb, ms)
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerMove: clear,
  }
}
