import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Reply,
  Copy,
  Forward,
  Pencil,
  Trash2,
  Pin,
  ShieldCheck,
  Info,
  Camera,
  Image as ImageIcon,
  FileText,
  MapPin,
  Contact as ContactIcon,
  ShoppingBag,
  Megaphone,
} from 'lucide-react'
import { useRouter } from '@/lib/router'
import { VenetianMask, KeyRound, LogOut, Ban, Flag, Lock } from 'lucide-react'
import {
  TopAppBar,
  IconButton,
  Avatar,
  Icon,
  Banner,
  BottomSheet,
  ActionSheet,
  ConfirmDialog,
  Button,
  ChatBubble,
  DaySeparator,
  SystemMessage,
  TypingBubble,
  MessageComposer,
  AttachmentGrid,
  useToast,
} from '@/components'
import { useStore, useConversation, useMessages, useUser } from '@/data/store'
import { useOnline } from '@/lib/connectivity'
import { productGradient, money } from '@/components/commerce'
import { dayLabel } from '@/data/format'
import type { Message } from '@/data/types'

const QUICK_EMOJI = ['❤️', '😂', '👍', '😮', '😢', '🙏']

export function ConversationScreen() {
  const { navigate, back, path } = useRouter()
  // Works for both /chats/:id and /anon/chats/:id — id is the last segment.
  const id = path.split('/').filter(Boolean).pop()
  const store = useStore()
  const conv = useConversation(id)
  const isAnon = conv?.env === 'anonymous'
  // Registered Private (E2EE) mode — PD-057; Standard is the silent default.
  const isPriv = !isAnon && conv?.privacyMode === 'private'
  const chatsBase = isAnon ? '/anon/chats' : '/chats'
  const messages = useMessages(id)
  const other = useUser(conv?.kind === 'private' ? conv.userId : undefined)
  const toast = useToast()
  const online = useOnline()

  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editing, setEditing] = useState<Message | null>(null)
  const [attachOpen, setAttachOpen] = useState(false)
  const [productPicker, setProductPicker] = useState(false)
  const [actionFor, setActionFor] = useState<Message | null>(null)
  const [headerMenu, setHeaderMenu] = useState(false)
  const [deleteFor, setDeleteFor] = useState<Message | null>(null)

  const threadRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const myRole = conv?.participants?.find((p) => p.userId === store.me)?.role
  const announceLocked = !!conv?.announcementMode && conv.kind === 'group' && myRole === 'member'

  // Mark read on open.
  useEffect(() => {
    if (id) store.markRead(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Autoscroll to newest.
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, store.state.typing[id ?? '']])

  const rendered = useMemo(() => {
    const out: React.ReactNode[] = []
    let prevDay = ''
    let prevAuthor = ''
    let prevAt = 0
    messages.forEach((m) => {
      const dl = dayLabel(m.createdAt)
      if (dl !== prevDay) {
        out.push(<DaySeparator key={`d-${m.id}`} ts={m.createdAt} />)
        prevDay = dl
        prevAuthor = ''
      }
      if (m.type === 'system') {
        out.push(<SystemMessage key={m.id} text={m.text ?? ''} />)
        prevAuthor = ''
        return
      }
      const isMine = m.authorId === store.me
      const grouped =
        prevAuthor === m.authorId && m.createdAt - prevAt < 5 * 60_000
      const showSender = conv?.kind === 'group' && !isMine && !grouped
      const replyMsg = m.replyToId ? store.state.messages[m.replyToId] : undefined
      out.push(
        <div id={`msg-${m.id}`} key={m.id}>
          <ChatBubble
            message={m}
            author={store.state.users[m.authorId]}
            isMine={isMine}
            showSender={showSender}
            grouped={grouped}
            me={store.me}
            replyTo={replyMsg}
            replyAuthor={replyMsg ? store.state.users[replyMsg.authorId] : undefined}
            onOpenActions={setActionFor}
            onRetry={(msg) => store.retryMessage(msg.id, online)}
            onJumpToReply={(mid) => {
              const el = document.getElementById(`msg-${mid}`)
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              el?.animate([{ background: 'var(--sb-primary-soft)' }, { background: 'transparent' }], { duration: 1200 })
            }}
          />
        </div>,
      )
      prevAuthor = m.authorId
      prevAt = m.createdAt
    })
    return out
  }, [messages, conv, store.state.messages, store.state.users, store.me])

  if (!conv) {
    return (
      <div className="sb-fill">
        <TopAppBar title="Conversation" onBack={back} />
        <div className="sb-center">This conversation doesn’t exist.</div>
      </div>
    )
  }

  const title = conv.kind === 'group' ? conv.title ?? 'Group' : other?.name ?? 'Chat'
  const statusLine = isAnon
    ? conv.kind === 'group'
      ? `${conv.participants?.length ?? 0} members · anonymous`
      : 'anonymous · identity hidden'
    : conv.kind === 'group'
      ? `${conv.participants?.length ?? 0} members`
      : other?.presence === 'online'
        ? 'online'
        : other?.lastSeen
          ? `last seen ${other.lastSeen}`
          : 'offline'

  const send = () => {
    const text = draft.trim()
    if (!text) return
    if (editing) {
      store.editMessage(editing.id, text)
      setEditing(null)
    } else {
      store.sendMessage(id!, { type: 'text', text, replyToId: replyTo?.id }, online)
    }
    setDraft('')
    setReplyTo(null)
  }

  const attachOptions = [
    { label: 'Gallery', icon: ImageIcon, color: 'linear-gradient(135deg,#e5392b,#b21c13)', onSelect: () => { store.sendMessage(id!, { type: 'image', image: { url: 'grad-3', caption: '' } }, online); setAttachOpen(false) } },
    { label: 'Camera', icon: Camera, color: 'linear-gradient(135deg,#e05353,#cc3f3f)', onSelect: () => { store.sendMessage(id!, { type: 'image', image: { url: 'grad-1' } }, online); setAttachOpen(false) } },
    { label: 'Document', icon: FileText, color: 'linear-gradient(135deg,#2f7ee0,#2668bd)', onSelect: () => { store.sendMessage(id!, { type: 'document', document: { name: 'Shared-notes.pdf', size: '840 KB', ext: 'PDF' } }, online); setAttachOpen(false) } },
    { label: 'Location', icon: MapPin, color: 'linear-gradient(135deg,#1fa971,#178a5c)', onSelect: () => { store.sendMessage(id!, { type: 'location', location: { label: 'My location', area: 'Kathmandu, Nepal' } }, online); setAttachOpen(false) } },
    { label: 'Contact', icon: ContactIcon, color: 'linear-gradient(135deg,#d9930b,#b87a09)', onSelect: () => { store.sendMessage(id!, { type: 'contact', contact: { name: 'Rojan KC', phone: '+977 9806 789 012' } }, online); setAttachOpen(false) } },
    { label: 'Product', icon: ShoppingBag, color: 'linear-gradient(135deg,#c88a00,#9a6a00)', onSelect: () => { setAttachOpen(false); setProductPicker(true) } },
  // Commerce (Product) is not available in anonymous mode (PS-004 scope).
  ].filter((o) => !isAnon || o.label !== 'Product')

  const isMineMsg = actionFor?.authorId === store.me

  const openHeader = () => {
    if (isAnon) {
      if (conv.kind === 'private' && conv.userId) navigate(`/anon/key/${conv.userId}`)
    } else {
      navigate(`/chats/${id}/info`)
    }
  }

  return (
    <div className="sb-fill" data-anon={isAnon ? 'true' : undefined}>
      <TopAppBar
        titleContent={
          <button className="sb-chathead" onClick={openHeader}>
            <Avatar
              name={title}
              kind={isAnon ? (conv.kind === 'group' ? 'group' : 'anonymous') : conv.kind === 'group' ? (conv.groupType === 'business' ? 'business' : 'group') : 'user'}
              size="md"
              presence={!isAnon && conv.kind === 'private' ? other?.presence : undefined}
            />
            <span className="sb-chathead__body">
              <span className="sb-chathead__name">
                <span className="sb-name-text">{title}</span>
                {isPriv && (
                  <Icon as={Lock} size={14} className="sb-lock-private" label="Private — end-to-end encrypted" />
                )}
              </span>
              <span className={statusLine === 'online' ? 'sb-chathead__status sb-chathead__status--online' : 'sb-chathead__status'}>
                {isAnon && <Icon as={VenetianMask} size={12} />}
                {conv.announcementMode && <Icon as={Megaphone} size={12} />}
                {store.state.typing[id!] ? 'typing…' : statusLine}
              </span>
            </span>
          </button>
        }
        onBack={back}
        actions={
          <>
            {/* Calls are V1 in BOTH environments (PD-061); anonymous calls are E2EE. */}
            <IconButton icon={Video} label="Video call" onClick={() => navigate(`/call/${id}?kind=video`)} />
            <IconButton icon={Phone} label="Voice call" onClick={() => navigate(`/call/${id}?kind=voice`)} />
            <IconButton icon={MoreVertical} label="More" onClick={() => setHeaderMenu(true)} />
          </>
        }
      />

      {/* Honest privacy banners: silent for Standard (PD-059/065); E2EE claims
          only where E2EE truly applies (Private + Anonymous). */}
      {(isAnon || isPriv) && messages.length > 0 && (
        <div style={{ padding: '8px var(--sb-space-3) 0' }}>
          <Banner tone={isAnon ? 'anon' : 'info'} icon={isAnon ? VenetianMask : Lock}>
            {isAnon
              ? 'You are chatting anonymously. Always end-to-end encrypted — servers can never read your messages.'
              : 'Private conversation — end-to-end encrypted. Only participants’ devices can read it.'}
          </Banner>
        </div>
      )}

      <div className="sb-thread" data-scroll-region ref={threadRef}>
        {messages.length === 0 && (
          <div className="sb-center" style={{ flex: 1 }}>
            <div style={{ textAlign: 'center', color: 'var(--sb-text-tertiary)' }}>
              <Avatar name={title} kind={conv.kind === 'group' ? 'group' : 'user'} size="xl" />
              <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--sb-text)' }}>{title}</p>
              <p style={{ fontSize: 'var(--sb-text-caption)' }}>Say hello 👋</p>
            </div>
          </div>
        )}
        {rendered}
        {store.state.typing[id!] && <TypingBubble name={other?.name} />}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSend={send}
        onAttach={() => setAttachOpen(true)}
        onEmoji={() => setDraft((d) => d + '🙂')}
        replyTo={replyTo ?? undefined}
        replyAuthorName={replyTo ? store.state.users[replyTo.authorId]?.name : undefined}
        onCancelReply={() => setReplyTo(null)}
        locked={announceLocked}
        lockedLabel="Only admins can post in Announcement Mode"
        placeholder={editing ? 'Edit message' : isPriv ? 'Private message' : 'Message'}
        privateIndicator={isPriv}
      />

      {/* Attachments */}
      <BottomSheet open={attachOpen} onClose={() => setAttachOpen(false)} title="Share">
        <AttachmentGrid options={attachOptions} />
      </BottomSheet>

      {/* Product picker — share a product into the conversation (PS-003) */}
      <BottomSheet open={productPicker} onClose={() => setProductPicker(false)} title="Share a product">
        <div className="sb-col" style={{ gap: 2 }}>
          {store.state.products.map((p) => (
            <button
              key={p.id}
              className="sb-convo"
              onClick={() => {
                store.shareProduct(id!, p.id)
                setProductPicker(false)
              }}
            >
              <span
                className="sb-pimg"
                style={{ width: 48, height: 48, borderRadius: 10, background: productGradient(p.image), flexShrink: 0 }}
              >
                <Icon as={ShoppingBag} size={18} />
              </span>
              <span className="sb-convo__body">
                <span className="sb-convo__name">{p.title}</span>
                <span className="sb-convo__preview">
                  <span className="sb-price" style={{ fontSize: 'var(--sb-text-caption)' }}>{money(p.price)}</span>
                  · {store.state.users[p.sellerId]?.name}
                </span>
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Message actions */}
      <BottomSheet open={!!actionFor} onClose={() => setActionFor(null)}>
        {actionFor && (
          <div>
            <div className="sb-row" style={{ justifyContent: 'space-around', padding: '4px 0 12px' }}>
              {QUICK_EMOJI.map((e) => (
                <button
                  key={e}
                  className="sb-msg-actions__emoji"
                  style={{ fontSize: 26 }}
                  onClick={() => { store.react(actionFor.id, e); setActionFor(null) }}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="sb-col" style={{ gap: 2 }}>
              {!actionFor.deleted && (
                <button className="sb-actionsheet__item" onClick={() => { setReplyTo(actionFor); setActionFor(null) }}>
                  <Icon as={Reply} size="md" /> Reply
                </button>
              )}
              {actionFor.type === 'text' && !actionFor.deleted && (
                <button className="sb-actionsheet__item" onClick={() => { navigator.clipboard?.writeText(actionFor.text ?? ''); toast.show('Copied'); setActionFor(null) }}>
                  <Icon as={Copy} size="md" /> Copy
                </button>
              )}
              {!actionFor.deleted && (
                <button className="sb-actionsheet__item" onClick={() => { toast.show('Forward opens a picker (prototype)'); setActionFor(null) }}>
                  <Icon as={Forward} size="md" /> Forward
                </button>
              )}
              <button
                className="sb-actionsheet__item"
                onClick={() => {
                  store.togglePinMessage(actionFor.id)
                  toast.show(actionFor.pinned ? 'Unpinned' : 'Message pinned', {
                    action:
                      actionFor.pinned || isAnon
                        ? undefined
                        : { label: 'View', onClick: () => navigate(`/chats/${id}/pinned`) },
                  })
                  setActionFor(null)
                }}
              >
                <Icon as={Pin} size="md" /> {actionFor.pinned ? 'Unpin' : 'Pin'}
              </button>
              {isMineMsg && actionFor.type === 'text' && !actionFor.deleted && (
                <button className="sb-actionsheet__item" onClick={() => { setEditing(actionFor); setDraft(actionFor.text ?? ''); setActionFor(null) }}>
                  <Icon as={Pencil} size="md" /> Edit
                </button>
              )}
              {!actionFor.deleted && (
                <button className="sb-actionsheet__item sb-actionsheet__item--danger" onClick={() => { setDeleteFor(actionFor); setActionFor(null) }}>
                  <Icon as={Trash2} size="md" /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteFor}
        onClose={() => setDeleteFor(null)}
        onConfirm={() => { if (deleteFor) store.deleteMessage(deleteFor.id, deleteFor.authorId === store.me) }}
        icon={Trash2}
        tone="danger"
        title="Delete message?"
        description={deleteFor?.authorId === store.me ? 'This will delete the message for everyone in the chat.' : 'This will remove the message from your view.'}
        confirmLabel="Delete"
      />

      {/* Header overflow */}
      <ActionSheet
        open={headerMenu}
        onClose={() => setHeaderMenu(false)}
        title={title}
        actions={
          isAnon
            ? [
                ...(conv.kind === 'private' && conv.userId
                  ? [{ label: 'View public key', icon: KeyRound, onSelect: () => navigate(`/anon/key/${conv.userId}`) }]
                  : []),
                { label: 'Report', icon: Flag, onSelect: () => toast.show('Report submitted') },
                { label: 'Block', icon: Ban, danger: true, onSelect: () => { toast.show('Identity blocked'); navigate('/anon/chats') } },
                { label: 'Exit conversation', icon: LogOut, danger: true, onSelect: () => navigate('/anon/chats') },
              ]
            : [
                { label: 'View info', icon: Info, onSelect: () => navigate(`/chats/${id}/info`) },
                // Escalation verb (PD-063/064): opens the separate Private thread;
                // never converts this Standard conversation (PD-058).
                ...(!isPriv && conv.kind === 'private' && conv.userId
                  ? [{
                      label: 'Continue privately',
                      icon: Lock,
                      onSelect: () => {
                        const pid = store.continuePrivately(conv.userId!)
                        toast.show('Continuing in your private conversation')
                        navigate(`/chats/${pid}`)
                      },
                    }]
                  : []),
                { label: 'Search in chat', icon: Search, onSelect: () => navigate(`/chats/${id}/search`) },
                { label: conv.muted ? 'Unmute' : 'Mute', icon: MoreVertical, onSelect: () => { store.toggleMute(id!); toast.show(conv.muted ? 'Unmuted' : 'Muted') } },
              ]
        }
      />
    </div>
  )
}
