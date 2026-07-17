import { useMemo, useState } from 'react'
import {
  Search,
  MoreVertical,
  Pin,
  BellOff,
  Bell,
  Archive,
  CheckCheck,
  Users,
  MessageSquarePlus,
  Settings2,
  ArchiveRestore,
  MessageSquare,
} from 'lucide-react'
import { useRouter } from '@/lib/router'
import {
  TopAppBar,
  IconButton,
  SearchInput,
  Segmented,
  Fab,
  ConversationListItem,
  ActionSheet,
  EmptyState,
  Icon,
  previewOf,
  ConversationListSkeleton,
  useToast,
} from '@/components'
import { useFirstLoad } from '@/lib/hooks'
import {
  useStore,
  useConversationList,
  conversationTitle,
  latestMessage,
} from '@/data/store'
import type { Conversation } from '@/data/types'

type Filter = 'all' | 'unread' | 'groups'

export function ChatListScreen({ archived = false }: { archived?: boolean }) {
  const { navigate } = useRouter()
  const toast = useToast()
  const store = useStore()
  const { state } = store
  const list = useConversationList({ archived })
  const archivedCount = state.conversations.filter((c) => c.archived).length

  const loading = useFirstLoad(archived ? 'archived' : 'chats')
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [menuFor, setMenuFor] = useState<Conversation | null>(null)
  const [topMenu, setTopMenu] = useState(false)

  const users = state.users

  const filtered = useMemo(() => {
    return list.filter((c) => {
      if (filter === 'unread' && c.unread === 0) return false
      if (filter === 'groups' && c.kind !== 'group') return false
      if (query.trim()) {
        const t = conversationTitle(c, users).toLowerCase()
        if (!t.includes(query.trim().toLowerCase())) return false
      }
      return true
    })
  }, [list, filter, query, users])

  const lastOf = (c: Conversation) => latestMessage(c, state.messages)

  const rowPreview = (c: Conversation) => {
    if (state.typing[c.id]) return <span style={{ color: 'var(--sb-online)' }}>typing…</span>
    const last = lastOf(c)
    if (!last) return <span style={{ opacity: 0.7 }}>Tap to start chatting</span>
    const prefix =
      c.kind === 'group' && last.type !== 'system'
        ? `${last.authorId === store.me ? 'You' : users[last.authorId]?.name?.split(' ')[0]}: `
        : last.authorId === store.me && c.kind === 'private'
          ? ''
          : ''
    return (
      <>
        {prefix}
        {previewOf(last)}
      </>
    )
  }

  return (
    <div className="sb-fill">
      <TopAppBar
        title={archived ? 'Archived' : 'Chats'}
        onBack={archived ? () => navigate('/chats') : undefined}
        actions={
          !archived ? (
            <>
              <IconButton icon={Bell} label="Notifications" onClick={() => navigate('/notifications')} />
              <IconButton icon={MoreVertical} label="More options" onClick={() => setTopMenu(true)} />
            </>
          ) : undefined
        }
      />

      {!archived && (
        <div style={{ padding: '0 var(--sb-space-4) var(--sb-space-2)' }} className="sb-col sb-gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Search conversations" className="sb-chatsearch" />
          <Segmented
            ariaLabel="Filter conversations"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'groups', label: 'Groups' },
            ]}
          />
        </div>
      )}

      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-1) var(--sb-space-2) var(--sb-space-10)' }}>
        {loading ? (
          <ConversationListSkeleton />
        ) : (
        <>
        {!archived && archivedCount > 0 && filter === 'all' && !query && (
          <button className="sb-convo" onClick={() => navigate('/archived')} style={{ color: 'var(--sb-text-secondary)' }}>
            <span className="sb-settings-row__icon" style={{ width: 44, height: 44, borderRadius: '50%' }}>
              <Icon as={Archive} size="md" />
            </span>
            <span className="sb-convo__body">
              <span className="sb-convo__name">Archived</span>
            </span>
            <span className="sb-count sb-count--muted">{archivedCount}</span>
          </button>
        )}

        {filtered.length === 0 ? (
          <div style={{ paddingTop: 40 }}>
            <EmptyState
              icon={query ? Search : filter === 'groups' ? Users : MessageSquare}
              title={
                query ? 'No matches'
                : archived ? 'No archived chats'
                : filter === 'unread' ? 'You’re all caught up'
                : filter === 'groups' ? 'No group chats yet'
                : 'No conversations yet'
              }
              description={
                query
                  ? 'Try a different name or keyword.'
                  : archived
                    ? 'Chats you archive will appear here, out of the way but never lost.'
                    : filter === 'unread'
                      ? 'Every conversation is read. Enjoy the calm.'
                      : filter === 'groups'
                        ? 'Create a group to collaborate with several people in one conversation.'
                        : 'Start your first conversation — everything in SystemBoom begins with a chat.'
              }
            />
          </div>
        ) : (
          filtered.map((c) => {
            const last = lastOf(c)
            const user = c.userId ? users[c.userId] : undefined
            return (
              <ConversationListItem
                key={c.id}
                title={conversationTitle(c, users)}
                avatarName={conversationTitle(c, users)}
                kind={c.kind === 'group' ? (c.groupType === 'business' ? 'business' : 'group') : 'private'}
                privateMode={c.privacyMode === 'private'}
                presence={c.kind === 'private' ? user?.presence : undefined}
                verified={c.kind === 'private' ? user?.verified : c.groupType === 'business'}
                preview={rowPreview(c)}
                time={last?.createdAt ?? 0}
                unread={c.unread}
                pinned={c.pinned}
                muted={c.muted}
                status={last && last.authorId === store.me ? last.status : undefined}
                onClick={() => {
                  store.markRead(c.id)
                  navigate(`/chats/${c.id}`)
                }}
                onContext={() => setMenuFor(c)}
              />
            )
          })
        )}
        </>
        )}
      </div>

      {!archived && (
        <div className="sb-fab-anchor">
          <Fab icon={MessageSquarePlus} label="New chat" onClick={() => navigate('/new-chat')} />
        </div>
      )}

      {/* Per-conversation context actions */}
      <ActionSheet
        open={!!menuFor}
        onClose={() => setMenuFor(null)}
        title={menuFor ? conversationTitle(menuFor, users) : undefined}
        actions={
          menuFor
            ? [
                { label: menuFor.pinned ? 'Unpin' : 'Pin', icon: Pin, onSelect: () => { store.togglePin(menuFor.id); toast.show(menuFor.pinned ? 'Unpinned' : 'Pinned to top') } },
                { label: menuFor.muted ? 'Unmute' : 'Mute', icon: menuFor.muted ? Bell : BellOff, onSelect: () => { store.toggleMute(menuFor.id); toast.show(menuFor.muted ? 'Unmuted' : 'Muted') } },
                { label: menuFor.unread ? 'Mark as read' : 'Mark as unread', icon: CheckCheck, onSelect: () => store.markRead(menuFor.id) },
                { label: menuFor.archived ? 'Unarchive' : 'Archive', icon: menuFor.archived ? ArchiveRestore : Archive, onSelect: () => { store.toggleArchive(menuFor.id); toast.show(menuFor.archived ? 'Unarchived' : 'Archived') } },
              ]
            : []
        }
      />

      {/* Top-bar overflow */}
      <ActionSheet
        open={topMenu}
        onClose={() => setTopMenu(false)}
        actions={[
          { label: 'New group', icon: Users, onSelect: () => navigate('/new-group') },
          { label: 'Archived chats', icon: Archive, onSelect: () => navigate('/archived') },
          { label: 'Settings', icon: Settings2, onSelect: () => navigate('/settings') },
        ]}
      />
    </div>
  )
}
