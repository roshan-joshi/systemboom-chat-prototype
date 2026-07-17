import { useMemo, useState } from 'react'
import { Users, UserPlus, Check, Camera, Lock } from 'lucide-react'
import { useRouter } from '@/lib/router'
import {
  TopAppBar,
  SearchInput,
  Avatar,
  Icon,
  Button,
  Field,
  TextInput,
  Badge,
  useToast,
} from '@/components'
import { useStore } from '@/data/store'
import type { User } from '@/data/types'

function useContacts(query: string): User[] {
  const { state } = useStore()
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    return Object.values(state.users)
      .filter((u) => u.id !== 'me')
      .filter((u) => !q || u.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [state.users, query])
}

/* SC-023 — New Chat. Contacts + entries to group creation and Private chat
   (FLOW-003 contact-first, PD-063/PD-065). */
export function NewChatScreen() {
  const { navigate, back, query: routeQuery } = useRouter()
  const store = useStore()
  const [query, setQuery] = useState('')
  const contacts = useContacts(query)
  // '?mode=private' → intent-first Private creation (5.1A discoverability path).
  const privateIntent = routeQuery.get('mode') === 'private'

  const openChat = (u: User) => {
    const wanted = privateIntent ? 'private' : 'standard'
    const existing = store.state.conversations.find(
      (c) =>
        c.kind === 'private' &&
        (c.env ?? 'registered') === 'registered' &&
        c.userId === u.id &&
        (c.privacyMode ?? 'standard') === wanted,
    )
    if (existing) {
      // Never silently open the wrong mode — route to the exact-mode thread.
      navigate(`/chats/${existing.id}`, { replace: true })
      return
    }
    // Pre-creation state: mode chosen before the first message (PD-063).
    navigate(`/draft-chat/${u.id}${privateIntent ? '?mode=private' : ''}`, { replace: true })
  }

  return (
    <div className="sb-fill">
      <TopAppBar
        title={privateIntent ? 'New private chat' : 'New chat'}
        subtitle={privateIntent ? 'End-to-end encrypted' : `${contacts.length} contacts`}
        onBack={back}
      />
      <div style={{ padding: '0 var(--sb-space-4) var(--sb-space-3)' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search name or number" autoFocus />
      </div>
      <div className="sb-shell__main" data-scroll-region style={{ padding: '0 var(--sb-space-2) var(--sb-space-8)' }}>
        {!privateIntent && (
          <>
            <button className="sb-convo" onClick={() => navigate('/new-group')}>
              <span className="sb-hub__tile-icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--sb-primary)', color: '#fff' }}>
                <Icon as={Users} size="md" />
              </span>
              <span className="sb-convo__body">
                <span className="sb-convo__name" style={{ color: 'var(--sb-primary)' }}>New group</span>
                <span className="sb-convo__preview">Create a group conversation</span>
              </span>
            </button>
            <button className="sb-convo" onClick={() => navigate('/new-chat?mode=private')}>
              <span className="sb-hub__tile-icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--sb-info)', color: '#fff' }}>
                <Icon as={Lock} size="md" />
              </span>
              <span className="sb-convo__body">
                <span className="sb-convo__name" style={{ color: 'var(--sb-info)' }}>New private chat</span>
                <span className="sb-convo__preview">End-to-end encrypted conversation</span>
              </span>
            </button>
          </>
        )}

        <p className="sb-section-label" style={{ padding: '12px 12px 6px' }}>Contacts on SystemBoom</p>

        {contacts.map((u) => (
          <button key={u.id} className="sb-convo" onClick={() => openChat(u)}>
            <Avatar name={u.name} kind={u.business ? 'business' : 'user'} size="lg" presence={u.presence} />
            <span className="sb-convo__body">
              <span className="sb-convo__name">
                {u.name}
                {u.verified && <Icon as={Check} size={13} className="sb-inline-verified" label="Verified" />}
              </span>
              <span className="sb-convo__preview">{u.about ?? u.phone ?? 'SystemBoom user'}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* Create Group — PS-002 (Name → Photo → Members), condensed to one calm step
   (Prototype Assumption: single step reduces friction — PD-045). */
export function CreateGroupScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const toast = useToast()
  const contacts = useContacts('')
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [photoSeed, setPhotoSeed] = useState('Group')
  const [privacyMode, setPrivacyMode] = useState<'standard' | 'private'>('standard')

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const canCreate = name.trim().length > 0 && selected.length > 0

  const create = () => {
    const id = store.createGroup(name.trim(), selected, { privacyMode })
    toast.success(privacyMode === 'private' ? 'Private group created' : 'Group created')
    navigate(`/chats/${id}`, { replace: true })
  }

  return (
    <div className="sb-fill">
      <TopAppBar
        title="New group"
        onBack={back}
        actions={
          <Button size="sm" disabled={!canCreate} onClick={create}>
            Create
          </Button>
        }
      />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-4)' }}>
        {/* Name + photo */}
        <div className="sb-row sb-gap-4" style={{ marginBottom: 'var(--sb-space-5)' }}>
          <button
            aria-label="Choose group photo"
            onClick={() => { setPhotoSeed((s) => s + '•'); toast.show('Photo picker (prototype)') }}
            style={{ position: 'relative' }}
          >
            <Avatar name={photoSeed} kind="group" size={64} />
            <span style={{ position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--sb-primary)', color: '#fff', display: 'grid', placeItems: 'center', border: '2px solid var(--sb-surface)' }}>
              <Icon as={Camera} size={13} />
            </span>
          </button>
          <div className="sb-grow">
            <Field label="Group name">
              <TextInput placeholder="e.g. Weekend Trip" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
          </div>
        </div>

        {/* Group privacy (PD-057/PD-065): Standard default, permanent after creation */}
        <div style={{ marginBottom: 'var(--sb-space-4)' }}>
          <p className="sb-section-label" style={{ marginBottom: 8 }}>Group privacy</p>
          <div className="sb-col sb-gap-2" role="radiogroup" aria-label="Group privacy">
            <button className="sb-paymethod" role="radio" aria-checked={privacyMode === 'standard'} aria-pressed={privacyMode === 'standard'} onClick={() => setPrivacyMode('standard')}>
              <span className="sb-paymethod__icon" style={{ background: 'var(--sb-text-tertiary)' }}><Icon as={Users} size="sm" /></span>
              <span className="sb-grow">
                <span style={{ display: 'block', fontWeight: 600 }}>Standard <span style={{ fontWeight: 500, color: 'var(--sb-text-tertiary)', fontSize: 'var(--sb-text-label)' }}>· default</span></span>
                <span style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-tertiary)' }}>Secured in transit and at rest</span>
              </span>
              <span className="sb-paymethod__radio" />
            </button>
            <button className="sb-paymethod" role="radio" aria-checked={privacyMode === 'private'} aria-pressed={privacyMode === 'private'} onClick={() => setPrivacyMode('private')}>
              <span className="sb-paymethod__icon" style={{ background: 'var(--sb-info)' }}><Icon as={Lock} size="sm" /></span>
              <span className="sb-grow">
                <span style={{ display: 'block', fontWeight: 600 }}>Private</span>
                <span style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-tertiary)' }}>End-to-end encrypted — only members’ devices can read it</span>
              </span>
              <span className="sb-paymethod__radio" />
            </button>
          </div>
          <p style={{ fontSize: 'var(--sb-text-label)', color: 'var(--sb-text-tertiary)', marginTop: 6 }}>
            Privacy type can’t be changed after the group is created.
          </p>
        </div>

        <div className="sb-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="sb-section-label">Add members</p>
          {selected.length > 0 && <Badge tone="primary">{selected.length} selected</Badge>}
        </div>

        {contacts.map((u) => {
          const on = selected.includes(u.id)
          return (
            <button key={u.id} className="sb-convo" aria-pressed={on} onClick={() => toggle(u.id)}>
              <Avatar name={u.name} kind={u.business ? 'business' : 'user'} size="lg" presence={u.presence} />
              <span className="sb-convo__body">
                <span className="sb-convo__name">{u.name}</span>
                <span className="sb-convo__preview">{u.about ?? u.phone ?? 'SystemBoom user'}</span>
              </span>
              <span
                aria-hidden
                style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  border: on ? 'none' : '2px solid var(--sb-border-strong)',
                  background: on ? 'var(--sb-primary)' : 'transparent',
                  color: '#fff',
                }}
              >
                {on && <Icon as={Check} size={15} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
