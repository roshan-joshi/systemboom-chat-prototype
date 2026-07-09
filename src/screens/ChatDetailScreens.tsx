import { useMemo, useState } from 'react'
import {
  Phone,
  Video,
  Search,
  BellOff,
  Bell,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Link2,
  Pin,
  Star,
  Ban,
  Flag,
  LogOut,
  ChevronRight,
  UserPlus,
  Megaphone,
  Crown,
  Trash2,
} from 'lucide-react'
import { useRouter, useParams } from '@/lib/router'
import {
  TopAppBar,
  Avatar,
  Icon,
  Banner,
  Badge,
  Button,
  Switch,
  Segmented,
  SearchInput,
  EmptyState,
  ConfirmDialog,
  Tabs,
  useToast,
} from '@/components'
import { useStore, useConversation, useMessages, useUser } from '@/data/store'
import { clockTime } from '@/data/format'
import { previewOf } from '@/components'

function useConvFromRoute(pattern: string) {
  const { id } = useParams(pattern)
  const conv = useConversation(id)
  const messages = useMessages(id)
  return { id, conv, messages }
}

function mediaStats(messages: { type: string }[]) {
  return {
    media: messages.filter((m) => m.type === 'image' || m.type === 'video').length,
    docs: messages.filter((m) => m.type === 'document').length,
    links: messages.filter((m) => m.type === 'link').length,
  }
}

/* SC-025 — Chat Information */
export function ChatInfoScreen() {
  const { navigate, back } = useRouter()
  const { id, conv, messages } = useConvFromRoute('/chats/:id/info')
  const store = useStore()
  const other = useUser(conv?.kind === 'private' ? conv.userId : undefined)
  const toast = useToast()
  const [announce, setAnnounce] = useState(!!conv?.announcementMode)
  const [confirm, setConfirm] = useState<null | 'block' | 'leave' | 'delete'>(null)

  if (!conv) return <div className="sb-fill"><TopAppBar title="Info" onBack={back} /></div>
  const title = conv.kind === 'group' ? conv.title ?? 'Group' : other?.name ?? 'Chat'
  const stats = mediaStats(messages)
  const myRole = conv.participants?.find((p) => p.userId === store.me)?.role
  const canAdmin = myRole === 'owner' || myRole === 'admin'

  return (
    <div className="sb-fill">
      <TopAppBar title={conv.kind === 'group' ? 'Group info' : 'Contact info'} onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block">
          {/* Header */}
          <div className="sb-profile__header">
            <Avatar name={title} kind={conv.kind === 'group' ? (conv.groupType === 'business' ? 'business' : 'group') : 'user'} size="xl" presence={conv.kind === 'private' ? other?.presence : undefined} />
            <div>
              <div className="sb-profile__name">{title}</div>
              <div className="sb-profile__handle">
                {conv.kind === 'group'
                  ? `${conv.participants?.length ?? 0} members${conv.groupType && conv.groupType !== 'standard' ? ` · ${conv.groupType} group` : ''}`
                  : other?.presence === 'online' ? 'online' : other?.phone}
              </div>
            </div>
            <div className="sb-row sb-gap-3">
              <Button variant="soft" size="sm" iconStart={Phone} onClick={() => navigate(`/call/${id}?kind=voice`)}>Audio</Button>
              <Button variant="soft" size="sm" iconStart={Video} onClick={() => navigate(`/call/${id}?kind=video`)}>Video</Button>
              <Button variant="soft" size="sm" iconStart={Search} onClick={() => navigate(`/chats/${id}/search`)}>Search</Button>
            </div>
          </div>

          {conv.encrypted && (
            <Banner tone="anon" icon={ShieldCheck}>
              End-to-end encrypted. Messages, calls and media stay between members.
            </Banner>
          )}

          {other?.about && (
            <div className="sb-settings-group">
              <div className="sb-settings-row">
                <div className="sb-settings-row__body">
                  <div className="sb-settings-row__sub">About</div>
                  <div className="sb-settings-row__title" style={{ fontWeight: 400 }}>{other.about}</div>
                </div>
              </div>
            </div>
          )}

          {/* Media / docs / links */}
          <button className="sb-settings-group" style={{ display: 'block' }} onClick={() => navigate(`/chats/${id}/media`)}>
            <div className="sb-settings-row sb-settings-row--btn">
              <span className="sb-settings-row__icon"><Icon as={ImageIcon} size="sm" /></span>
              <span className="sb-settings-row__body"><span className="sb-settings-row__title">Media, links & docs</span></span>
              <span className="sb-row sb-gap-2" style={{ color: 'var(--sb-text-tertiary)' }}>
                <span>{stats.media + stats.docs + stats.links}</span>
                <Icon as={ChevronRight} size="sm" />
              </span>
            </div>
          </button>

          <div className="sb-settings-group">
            <button className="sb-settings-row sb-settings-row--btn" onClick={() => navigate(`/chats/${id}/pinned`)}>
              <span className="sb-settings-row__icon"><Icon as={Pin} size="sm" /></span>
              <span className="sb-settings-row__body"><span className="sb-settings-row__title">Pinned messages</span></span>
              <Icon as={ChevronRight} size="sm" />
            </button>
            <button className="sb-settings-row sb-settings-row--btn" onClick={() => toast.show('Starred messages (prototype)')}>
              <span className="sb-settings-row__icon"><Icon as={Star} size="sm" /></span>
              <span className="sb-settings-row__body"><span className="sb-settings-row__title">Starred messages</span></span>
              <Icon as={ChevronRight} size="sm" />
            </button>
            <div className="sb-settings-row">
              <span className="sb-settings-row__icon"><Icon as={conv.muted ? BellOff : Bell} size="sm" /></span>
              <span className="sb-settings-row__body"><span className="sb-settings-row__title">Mute notifications</span></span>
              <Switch checked={!!conv.muted} onChange={() => store.toggleMute(id!)} label="Mute" />
            </div>
          </div>

          {/* Group: announcement + members */}
          {conv.kind === 'group' && (
            <>
              {canAdmin && (
                <div className="sb-settings-group">
                  <div className="sb-settings-row">
                    <span className="sb-settings-row__icon"><Icon as={Megaphone} size="sm" /></span>
                    <span className="sb-settings-row__body">
                      <span className="sb-settings-row__title">Announcement mode</span>
                      <span className="sb-settings-row__sub">Only admins can post</span>
                    </span>
                    <Switch checked={announce} onChange={(v) => { setAnnounce(v); toast.show(v ? 'Announcement mode on' : 'Announcement mode off') }} label="Announcement mode" />
                  </div>
                </div>
              )}

              <div className="sb-block">
                <div className="sb-row" style={{ justifyContent: 'space-between' }}>
                  <p className="sb-section-label">{conv.participants?.length} members</p>
                  {canAdmin && <Button variant="tertiary" size="sm" iconStart={UserPlus} onClick={() => toast.show('Add members (prototype)')}>Add</Button>}
                </div>
                <div className="sb-settings-group">
                  {conv.participants?.map((p) => {
                    const u = store.state.users[p.userId]
                    return (
                      <div key={p.userId} className="sb-settings-row">
                        <Avatar name={u?.name ?? '?'} size="md" presence={u?.presence} />
                        <span className="sb-settings-row__body">
                          <span className="sb-settings-row__title">{p.userId === store.me ? 'You' : u?.name}</span>
                          {u?.about && <span className="sb-settings-row__sub">{u.about}</span>}
                        </span>
                        {p.role !== 'member' && (
                          <Badge tone={p.role === 'owner' ? 'warning' : 'primary'}>
                            {p.role === 'owner' ? <><Icon as={Crown} size={12} /> Owner</> : 'Admin'}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Danger zone */}
          <div className="sb-settings-group">
            {conv.kind === 'private' ? (
              <>
                <button className="sb-settings-row sb-settings-row--btn" style={{ color: 'var(--sb-error)' }} onClick={() => setConfirm('block')}>
                  <span className="sb-settings-row__icon" style={{ color: 'var(--sb-error)' }}><Icon as={Ban} size="sm" /></span>
                  <span className="sb-settings-row__body"><span className="sb-settings-row__title">Block {other?.name}</span></span>
                </button>
                <button className="sb-settings-row sb-settings-row--btn" style={{ color: 'var(--sb-error)' }} onClick={() => navigate(`/chats/${id}/report`)}>
                  <span className="sb-settings-row__icon" style={{ color: 'var(--sb-error)' }}><Icon as={Flag} size="sm" /></span>
                  <span className="sb-settings-row__body"><span className="sb-settings-row__title">Report {other?.name}</span></span>
                </button>
              </>
            ) : (
              <button className="sb-settings-row sb-settings-row--btn" style={{ color: 'var(--sb-error)' }} onClick={() => setConfirm('leave')}>
                <span className="sb-settings-row__icon" style={{ color: 'var(--sb-error)' }}><Icon as={LogOut} size="sm" /></span>
                <span className="sb-settings-row__body"><span className="sb-settings-row__title">Leave group</span></span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          toast.show(confirm === 'block' ? `${other?.name} blocked` : confirm === 'leave' ? 'You left the group' : 'Chat deleted')
          navigate('/chats')
        }}
        icon={confirm === 'block' ? Ban : confirm === 'leave' ? LogOut : Trash2}
        tone="danger"
        title={confirm === 'block' ? `Block ${other?.name}?` : confirm === 'leave' ? 'Leave group?' : 'Delete chat?'}
        description={
          confirm === 'block'
            ? 'They won’t be able to message or call you. You can unblock anytime.'
            : confirm === 'leave'
              ? 'You’ll stop receiving messages. The group history stays with remaining members.'
              : 'This removes the conversation from your device.'
        }
        confirmLabel={confirm === 'block' ? 'Block' : confirm === 'leave' ? 'Leave' : 'Delete'}
      />
    </div>
  )
}

/* SC-026 — Shared Media */
export function SharedMediaScreen() {
  const { back } = useRouter()
  const { messages } = useConvFromRoute('/chats/:id/media')
  const [tab, setTab] = useState<'media' | 'docs' | 'links'>('media')

  const media = messages.filter((m) => m.type === 'image' || m.type === 'video')
  const docs = messages.filter((m) => m.type === 'document')
  const links = messages.filter((m) => m.type === 'link')

  return (
    <div className="sb-fill">
      <TopAppBar title="Media, links & docs" onBack={back} />
      <Tabs
        ariaLabel="Shared content"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'media', label: `Media ${media.length}` },
          { value: 'docs', label: `Docs ${docs.length}` },
          { value: 'links', label: `Links ${links.length}` },
        ]}
      />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-4)' }}>
        {tab === 'media' && (
          media.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {media.map((m) => (
                <div key={m.id} style={{ aspectRatio: '1', borderRadius: 8, background: 'linear-gradient(135deg,#5f69e8,#0fb0aa)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                  <Icon as={ImageIcon} size="md" />
                </div>
              ))}
            </div>
          ) : <EmptyState icon={ImageIcon} title="No media yet" description="Photos and videos shared in this chat will appear here." />
        )}
        {tab === 'docs' && (
          docs.length ? docs.map((m) => (
            <div key={m.id} className="sb-settings-group" style={{ marginBottom: 8 }}>
              <div className="sb-settings-row">
                <span className="sb-settings-row__icon"><Icon as={FileText} size="sm" /></span>
                <span className="sb-settings-row__body">
                  <span className="sb-settings-row__title">{m.document?.name}</span>
                  <span className="sb-settings-row__sub">{m.document?.ext} · {m.document?.size} · {clockTime(m.createdAt)}</span>
                </span>
              </div>
            </div>
          )) : <EmptyState icon={FileText} title="No documents" description="Files shared in this chat will appear here." />
        )}
        {tab === 'links' && (
          links.length ? links.map((m) => (
            <div key={m.id} className="sb-settings-group" style={{ marginBottom: 8 }}>
              <div className="sb-settings-row">
                <span className="sb-settings-row__icon"><Icon as={Link2} size="sm" /></span>
                <span className="sb-settings-row__body">
                  <span className="sb-settings-row__title">{m.link?.title}</span>
                  <span className="sb-settings-row__sub">{m.link?.host}</span>
                </span>
              </div>
            </div>
          )) : <EmptyState icon={Link2} title="No links" description="Links shared in this chat will appear here." />
        )}
      </div>
    </div>
  )
}

/* SC-027 — Pinned Messages */
export function PinnedMessagesScreen() {
  const { back } = useRouter()
  const { messages } = useConvFromRoute('/chats/:id/pinned')
  const store = useStore()
  const pinned = messages.filter((m) => m.pinned)
  return (
    <div className="sb-fill">
      <TopAppBar title="Pinned messages" onBack={back} />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-4)' }}>
        {pinned.length ? pinned.map((m) => (
          <div key={m.id} className="sb-settings-group" style={{ marginBottom: 8 }}>
            <div className="sb-settings-row">
              <span className="sb-settings-row__icon"><Icon as={Pin} size="sm" /></span>
              <span className="sb-settings-row__body">
                <span className="sb-settings-row__title">{store.state.users[m.authorId]?.name ?? 'You'}</span>
                <span className="sb-settings-row__sub">{previewOf(m)}</span>
              </span>
            </div>
          </div>
        )) : <EmptyState icon={Pin} title="No pinned messages" description="Long-press any message and choose Pin to keep it here for quick access." />}
      </div>
    </div>
  )
}

/* SC-024 — Chat Search */
export function ChatSearchScreen() {
  const { back, navigate } = useRouter()
  const { id, messages } = useConvFromRoute('/chats/:id/search')
  const store = useStore()
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return messages.filter((m) => (m.text ?? previewOf(m)).toLowerCase().includes(s))
  }, [q, messages])

  return (
    <div className="sb-fill">
      <TopAppBar
        onBack={back}
        titleContent={
          <div style={{ flex: 1 }}>
            <SearchInput value={q} onChange={setQ} placeholder="Search this conversation" autoFocus />
          </div>
        }
      />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-3)' }}>
        {!q.trim() ? (
          <EmptyState icon={Search} title="Search messages" description="Find messages, media, documents and links in this conversation." />
        ) : results.length === 0 ? (
          <EmptyState icon={Search} title="No results" description={`Nothing matches “${q}”.`} />
        ) : (
          <>
            <p className="sb-section-label" style={{ padding: '4px 8px 8px' }}>{results.length} result{results.length > 1 ? 's' : ''}</p>
            {results.map((m) => (
              <button key={m.id} className="sb-convo" onClick={() => navigate(`/chats/${id}`)}>
                <Avatar name={store.state.users[m.authorId]?.name ?? 'You'} size="md" />
                <span className="sb-convo__body">
                  <span className="sb-convo__top">
                    <span className="sb-convo__name">{m.authorId === store.me ? 'You' : store.state.users[m.authorId]?.name}</span>
                    <span className="sb-convo__time">{clockTime(m.createdAt)}</span>
                  </span>
                  <span className="sb-convo__preview">{previewOf(m)}</span>
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
