import { useMemo, useState } from 'react'
import { Users, UserPlus, Check, Camera } from 'lucide-react'
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

/* SC-023 — New Chat. Contacts + entry to group creation (FLOW-003 / FLOW-008). */
export function NewChatScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const [query, setQuery] = useState('')
  const contacts = useContacts(query)

  const openChat = (u: User) => {
    const id = store.openOrCreatePrivate(u.id)
    navigate(`/chats/${id}`, { replace: true })
  }

  return (
    <div className="sb-fill">
      <TopAppBar title="New chat" subtitle={`${contacts.length} contacts`} onBack={back} />
      <div style={{ padding: '0 var(--sb-space-4) var(--sb-space-3)' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search name or number" autoFocus />
      </div>
      <div className="sb-shell__main" data-scroll-region style={{ padding: '0 var(--sb-space-2) var(--sb-space-8)' }}>
        <button className="sb-convo" onClick={() => navigate('/new-group')}>
          <span className="sb-hub__tile-icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--sb-primary)', color: '#fff' }}>
            <Icon as={Users} size="md" />
          </span>
          <span className="sb-convo__body">
            <span className="sb-convo__name" style={{ color: 'var(--sb-primary)' }}>New group</span>
            <span className="sb-convo__preview">Create a group conversation</span>
          </span>
        </button>

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

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const canCreate = name.trim().length > 0 && selected.length > 0

  const create = () => {
    const id = store.createGroup(name.trim(), selected)
    toast.success('Group created')
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
