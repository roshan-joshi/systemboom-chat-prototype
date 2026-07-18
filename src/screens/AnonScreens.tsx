import { useEffect, useMemo, useState } from 'react'
import {
  VenetianMask,
  ShieldCheck,
  ScanLine,
  QrCode,
  Users,
  UserCog,
  ArrowLeftRight,
  Copy,
  Share2,
  Check,
  Plus,
  KeyRound,
  Fingerprint,
  Ban,
  Flag,
  Trash2,
  ChevronRight,
  Lock,
  EyeOff,
  Info,
  MessageSquarePlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter, useParams } from '@/lib/router'
import {
  TopAppBar,
  IconButton,
  Avatar,
  Icon,
  Badge,
  Banner,
  Button,
  Card,
  Field,
  TextInput,
  SearchInput,
  Fab,
  EmptyState,
  ConfirmDialog,
  ConversationListItem,
  QRCode,
  useToast,
} from '@/components'
import {
  useStore,
  useConversationList,
  useActiveAnon,
  useAnonIdentities,
  useUser,
  conversationTitle,
  latestMessage,
} from '@/data/store'
import { previewOf } from '@/components'
import type { AnonIdentity, Conversation } from '@/data/types'

const ANON_KEY = 'sb.anonOnboarded'

/* ---------- helper: exit to registered ---------- */
function useExitAnon() {
  const { navigate } = useRouter()
  return () => navigate('/chats', { replace: true })
}

/* =====================================================================
   SC-040 — Anonymous Home (+ first-run onboarding, FLOW-010)
   ===================================================================== */
export function AnonymousHomeScreen() {
  const [onboarded, setOnboarded] = useState(() => {
    try {
      return localStorage.getItem(ANON_KEY) === '1'
    } catch {
      return false
    }
  })
  if (!onboarded) return <AnonOnboarding onDone={() => setOnboarded(true)} />
  return <AnonHubScreen />
}

function AnonOnboarding({ onDone }: { onDone: () => void }) {
  const exit = useExitAnon()
  const [generating, setGenerating] = useState(false)

  const generate = () => {
    setGenerating(true)
    window.setTimeout(() => {
      try {
        localStorage.setItem(ANON_KEY, '1')
      } catch {
        /* ignore */
      }
      onDone()
    }, 1400)
  }

  const POINTS: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: EyeOff, title: 'No real identity', text: 'A temporary, device-generated identity — no name, email or phone.' },
    { icon: Lock, title: 'Always end-to-end encrypted', text: 'Zero-knowledge protection that can’t be turned off — servers can never read your messages, media or keys.' },
    { icon: QrCode, title: 'You choose who connects', text: 'Share a QR code or public key. Nothing is discoverable without it.' },
    { icon: ShieldCheck, title: 'Still safe', text: 'Block, report and exit are always available. Anonymous is not unmoderated.' },
  ]

  return (
    <div className="sb-fill" data-anon="true">
      <TopAppBar title="Anonymous mode" onBack={exit} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 88, height: 88, borderRadius: 24, margin: '0 auto var(--sb-space-4)', display: 'grid', placeItems: 'center', background: 'var(--sb-primary-soft)', color: 'var(--sb-primary)' }}>
              <Icon as={VenetianMask} size={44} strokeWidth={1.7} />
            </div>
            <h1 style={{ fontSize: 'var(--sb-text-heading)', fontWeight: 700, letterSpacing: '-0.01em' }}>Speak freely, privately</h1>
            <p style={{ color: 'var(--sb-text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
              Anonymous mode is a separate, self-contained space. Your registered
              identity stays completely independent — no one can link the two.
            </p>
          </div>

          <div className="sb-settings-group">
            {POINTS.map((p) => (
              <div key={p.title} className="sb-settings-row">
                <span className="sb-settings-row__icon" style={{ background: 'var(--sb-primary-soft)', color: 'var(--sb-primary)' }}>
                  <Icon as={p.icon} size="sm" />
                </span>
                <span className="sb-settings-row__body">
                  <span className="sb-settings-row__title">{p.title}</span>
                  <span className="sb-settings-row__sub">{p.text}</span>
                </span>
              </div>
            ))}
          </div>

          <Banner tone="info" icon={Info}>
            Anonymous mode covers messaging and end-to-end encrypted calls — commerce and other modules stay in your registered account.
          </Banner>
        </div>
      </div>
      <div className="sb-composer" style={{ borderTop: '1px solid var(--sb-border-subtle)' }} data-anon="true">
        <Button size="lg" block loading={generating} iconStart={KeyRound} onClick={generate} data-anon="true">
          {generating ? 'Generating key pair…' : 'Generate anonymous identity'}
        </Button>
      </div>
    </div>
  )
}

function AnonHubScreen() {
  const { navigate } = useRouter()
  const exit = useExitAnon()
  const store = useStore()
  const me = useActiveAnon()
  const chats = useConversationList({ env: 'anonymous' })
  const [switchBack, setSwitchBack] = useState(false)

  const actions: { icon: LucideIcon; label: string; to: string }[] = [
    { icon: ScanLine, label: 'Scan QR', to: '/anon/scan' },
    { icon: QrCode, label: 'My QR code', to: '/anon/qr' },
    { icon: Users, label: 'New group', to: '/anon/new-group' },
    { icon: UserCog, label: 'Identities', to: '/anon/identities' },
  ]

  return (
    <div className="sb-fill" data-anon="true">
      <TopAppBar
        title="Anonymous"
        leading={<span style={{ display: 'grid', placeItems: 'center', width: 44 }}><Icon as={VenetianMask} size="md" /></span>}
        actions={<IconButton icon={ArrowLeftRight} label="Switch to registered" onClick={() => setSwitchBack(true)} />}
      />
      <div className="sb-anon-strip"><Icon as={EyeOff} size={13} /> You are anonymous · identity hidden</div>

      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          {/* Active identity card */}
          <div className="sb-idcard">
            <div className="sb-idcard__top">
              <Avatar name={me.name} kind="anonymous" size={52} />
              <div className="sb-grow">
                <div className="sb-idcard__name">{me.name}</div>
                <div className="sb-idcard__sub"><Icon as={ShieldCheck} size={13} /> Active anonymous identity</div>
              </div>
            </div>
            <div className="sb-idcard__row">
              <div>
                <div className="sb-idcard__label">Session ID</div>
                <div className="sb-idcard__value">{me.sessionId}</div>
              </div>
              <Button variant="secondary" size="sm" iconStart={QrCode} onClick={() => navigate('/anon/qr')}>My QR</Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="sb-hub__grid">
            {actions.map((a) => (
              <Card key={a.label} interactive as="button" className="sb-hub__tile" onClick={() => navigate(a.to)}>
                <span className="sb-hub__tile-icon" style={{ background: 'var(--sb-primary-soft)', color: 'var(--sb-primary)' }}>
                  <Icon as={a.icon} size="md" />
                </span>
                <span className="sb-hub__tile-title">{a.label}</span>
              </Card>
            ))}
          </div>

          {/* Recent anonymous chats */}
          <div className="sb-block">
            <div className="sb-block__head">
              <p className="sb-section-label">Anonymous chats</p>
              <Button variant="tertiary" size="sm" onClick={() => navigate('/anon/chats')}>See all</Button>
            </div>
            {chats.length === 0 ? (
              <Card pad flat>
                <EmptyState icon={ScanLine} tone="anon" title="No anonymous chats yet" description="Scan a QR code or share yours to start a private, identity-free conversation." action={<Button onClick={() => navigate('/anon/scan')}>Scan a QR code</Button>} />
              </Card>
            ) : (
              <div>
                {chats.slice(0, 3).map((c) => (
                  <AnonRow key={c.id} conv={c} onClick={() => { store.markRead(c.id); navigate(`/anon/chats/${c.id}`) }} />
                ))}
              </div>
            )}
          </div>

          <Button variant="secondary" block iconStart={ArrowLeftRight} onClick={() => setSwitchBack(true)}>
            Switch back to registered
          </Button>
          <p style={{ textAlign: 'center', fontSize: 'var(--sb-text-label)', color: 'var(--sb-text-tertiary)' }}>
            Registered and anonymous identities are permanently independent.
          </p>
        </div>
      </div>

      <div className="sb-fab-anchor">
        <Fab icon={ScanLine} label="Pair via QR" onClick={() => navigate('/anon/scan')} />
      </div>

      <ConfirmDialog
        open={switchBack}
        onClose={() => setSwitchBack(false)}
        onConfirm={exit}
        icon={ArrowLeftRight}
        title="Switch back to registered?"
        description="Your anonymous conversations stay isolated and will be here when you return."
        confirmLabel="Switch back"
      />
    </div>
  )
}

/* shared anon conversation row */
function AnonRow({ conv, onClick }: { conv: Conversation; onClick: () => void }) {
  const store = useStore()
  const users = store.state.users
  const last = latestMessage(conv, store.state.messages)
  const user = conv.userId ? users[conv.userId] : undefined
  return (
    <ConversationListItem
      title={conversationTitle(conv, users)}
      avatarName={conversationTitle(conv, users)}
      kind={conv.kind === 'group' ? 'group' : 'private'}
      anonAvatar={conv.kind !== 'group'}
      preview={last ? previewOf(last) : 'Say hello'}
      time={last?.createdAt ?? 0}
      unread={conv.unread}
      onClick={onClick}
    />
  )
}

/* =====================================================================
   SC-041 — Anonymous Chat List
   ===================================================================== */
export function AnonChatListScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const chats = useConversationList({ env: 'anonymous' })
  const [query, setQuery] = useState('')
  const users = store.state.users

  const filtered = useMemo(
    () => chats.filter((c) => !query.trim() || conversationTitle(c, users).toLowerCase().includes(query.toLowerCase())),
    [chats, query, users],
  )

  return (
    <div className="sb-fill" data-anon="true">
      <TopAppBar title="Anonymous chats" onBack={back} />
      <div className="sb-anon-strip"><Icon as={EyeOff} size={13} /> You are anonymous · identity hidden</div>
      <div style={{ padding: '0 var(--sb-space-4) var(--sb-space-2)', marginTop: 'var(--sb-space-2)' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search anonymous chats" />
      </div>
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-1) var(--sb-space-2) var(--sb-space-10)' }}>
        {filtered.length === 0 ? (
          <div style={{ paddingTop: 30 }}>
            <EmptyState icon={ScanLine} tone="anon" title={query ? 'No matches' : 'No anonymous chats yet'} description={query ? 'Try another name.' : 'Scan a QR code to connect with someone privately.'} action={!query ? <Button onClick={() => navigate('/anon/scan')}>Scan a QR code</Button> : undefined} />
          </div>
        ) : (
          filtered.map((c) => (
            <AnonRow key={c.id} conv={c} onClick={() => { store.markRead(c.id); navigate(`/anon/chats/${c.id}`) }} />
          ))
        )}
      </div>
      <div className="sb-fab-anchor">
        <Fab icon={ScanLine} label="Pair via QR" onClick={() => navigate('/anon/scan')} />
      </div>
    </div>
  )
}

/* =====================================================================
   SC-045 — My QR Code
   ===================================================================== */
export function MyQRScreen() {
  const { navigate, back } = useRouter()
  const me = useActiveAnon()
  const toast = useToast()
  return (
    <div className="sb-fill" data-anon="true">
      <TopAppBar title="My QR code" onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 'var(--sb-space-5)' }}>
          <Avatar name={me.name} kind="anonymous" size={64} />
          <div>
            <div style={{ fontSize: 'var(--sb-text-title)', fontWeight: 700 }}>{me.name}</div>
            <div style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-secondary)' }}>{me.sessionId}</div>
          </div>
          <div className="sb-qrframe">
            <QRCode value={me.publicKey} size={220} fg="var(--sb-primary)" />
          </div>
          <p style={{ color: 'var(--sb-text-secondary)', maxWidth: 320, lineHeight: 1.6 }}>
            Others scan this to start an anonymous, end-to-end encrypted chat with you.
            It shares only your public key — never your real identity.
          </p>
          <div className="sb-row sb-gap-3" style={{ width: '100%', maxWidth: 360 }}>
            <Button variant="secondary" block iconStart={Copy} onClick={() => { navigator.clipboard?.writeText(me.publicKey); toast.show('Public key copied') }}>Copy key</Button>
            <Button block iconStart={Share2} onClick={() => toast.show('Share sheet (prototype)')}>Share</Button>
          </div>
          <Button variant="tertiary" iconStart={KeyRound} onClick={() => navigate('/anon/key/anon-me')}>View public key details</Button>
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   SC-044 — QR Scanner (pairing, FLOW-013)
   ===================================================================== */
export function QRScannerScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const [found, setFound] = useState<{ name: string; fingerprint: string } | null>(null)

  const [scanError, setScanError] = useState(false)

  useEffect(() => {
    if (found || scanError) return
    const t = window.setTimeout(() => {
      // Simulate detecting a nearby anonymous QR.
      const id = `preview-${Math.floor(Math.random() * 9000)}`
      // Peek a plausible identity without committing yet.
      setFound({ name: randomName(), fingerprint: fakeFingerprint(id) })
    }, 2400)
    return () => window.clearTimeout(t)
  }, [found, scanError])

  const connect = () => {
    if (!found) return
    const convId = store.pairViaQR(found.name)
    navigate(`/anon/chats/${convId}`, { replace: true })
  }
  const rescan = () => {
    setScanError(false)
    setFound(null)
  }

  return (
    <div className="sb-fill" data-anon="true" style={{ background: 'var(--sb-bg)' }}>
      <TopAppBar title="Scan QR code" onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 'var(--sb-space-6)' }}>
          <div className="sb-scanner">
            <span className="sb-scanner__corner sb-scanner__corner--tl" />
            <span className="sb-scanner__corner sb-scanner__corner--tr" />
            <span className="sb-scanner__corner sb-scanner__corner--bl" />
            <span className="sb-scanner__corner sb-scanner__corner--br" />
            {!found && !scanError && <span className="sb-scanner__line" />}
            {scanError && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#f0503f' }}>
                <Icon as={ScanLine} size={56} />
              </div>
            )}
            {found && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff' }}>
                <Icon as={Check} size={56} />
              </div>
            )}
          </div>

          {scanError ? (
            <Card pad style={{ width: '100%', maxWidth: 360 }}>
              <Banner tone="error" icon={ScanLine}>
                <strong>Couldn’t read the code.</strong> Make sure it’s a SYSTEMBOOM anonymous QR and that it’s well lit, then try again.
              </Banner>
              <Button block iconStart={ScanLine} onClick={rescan} style={{ marginTop: 12 }}>Try again</Button>
            </Card>
          ) : !found ? (
            <>
              <p style={{ color: 'var(--sb-text-secondary)' }}>Point at a SYSTEMBOOM anonymous QR code…</p>
              <div className="sb-row sb-gap-3" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button variant="tertiary" onClick={() => setFound({ name: randomName(), fingerprint: fakeFingerprint('now') })}>Simulate a scan</Button>
                <Button variant="tertiary" onClick={() => setScanError(true)}>Simulate scan error</Button>
              </div>
            </>
          ) : (
            <Card pad style={{ width: '100%', maxWidth: 360 }}>
              <div className="sb-row sb-gap-3" style={{ marginBottom: 12 }}>
                <Avatar name={found.name} kind="anonymous" size="lg" />
                <div className="sb-grow" style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{found.name}</div>
                  <div style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-secondary)' }}>Anonymous identity detected</div>
                </div>
              </div>
              <div className="sb-idcard__label" style={{ color: 'var(--sb-text-tertiary)', textAlign: 'left', marginBottom: 4 }}>Fingerprint</div>
              <div className="sb-fingerprint" style={{ marginBottom: 14 }}>{found.fingerprint}</div>
              <Button block iconStart={MessageSquarePlus} onClick={connect}>Start anonymous chat</Button>
            </Card>
          )}
          <Button variant="tertiary" iconStart={Copy} onClick={() => setFound({ name: randomName(), fingerprint: fakeFingerprint('paste') })}>Paste public key instead</Button>
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   SC-046 — Public Key Details
   ===================================================================== */
export function PublicKeyScreen() {
  const { back } = useRouter()
  const { id } = useParams('/anon/key/:id')
  const me = useActiveAnon()
  const identities = useAnonIdentities()
  const contact = useUser(id)
  const toast = useToast()
  const [verified, setVerified] = useState(false)

  // Resolve in order: active alias → any of my identities → anonymous contact.
  const ownIdentity = id === 'anon-me' ? me : identities.find((a) => a.id === id)
  const isSelf = !!ownIdentity
  const source = ownIdentity ?? contact
  const name = source?.name ?? 'Unknown'
  const publicKey = source?.publicKey ?? ''
  const fingerprint = source?.fingerprint ?? ''
  const sessionId = source?.sessionId ?? ''

  return (
    <div className="sb-fill" data-anon="true">
      <TopAppBar title="Public key" onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          <div className="sb-profile__header">
            <Avatar name={name} kind="anonymous" size="xl" />
            <div>
              <div className="sb-profile__name">{name}</div>
              <div className="sb-profile__handle">{sessionId}</div>
            </div>
            {verified && <Badge tone="success" icon={ShieldCheck}>Verified</Badge>}
          </div>

          <div className="sb-block">
            <p className="sb-section-label">Safety number (fingerprint)</p>
            <Card pad flat>
              <div className="sb-fingerprint">{fingerprint}</div>
              <p style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-secondary)', textAlign: 'center', marginTop: 10 }}>
                Compare this in person or over another trusted channel to confirm no one is in the middle.
              </p>
            </Card>
            {!isSelf && (
              <Button variant={verified ? 'secondary' : 'primary'} block iconStart={verified ? Check : Fingerprint} onClick={() => { setVerified((v) => !v); toast.show(verified ? 'Marked unverified' : 'Fingerprint verified') }}>
                {verified ? 'Verified' : 'Mark as verified'}
              </Button>
            )}
          </div>

          <div className="sb-block">
            <p className="sb-section-label">Public key</p>
            <div className="sb-keyblock">{publicKey}</div>
            <Button variant="secondary" block iconStart={Copy} onClick={() => { navigator.clipboard?.writeText(publicKey); toast.show('Public key copied') }}>Copy public key</Button>
          </div>

          {!isSelf && (
            <div className="sb-settings-group">
              <button className="sb-settings-row sb-settings-row--btn" style={{ color: 'var(--sb-error)' }} onClick={() => toast.show(`${name} blocked`)}>
                <span className="sb-settings-row__icon" style={{ color: 'var(--sb-error)' }}><Icon as={Ban} size="sm" /></span>
                <span className="sb-settings-row__body"><span className="sb-settings-row__title">Block this identity</span></span>
              </button>
              <button className="sb-settings-row sb-settings-row--btn" style={{ color: 'var(--sb-error)' }} onClick={() => toast.show('Report submitted')}>
                <span className="sb-settings-row__icon" style={{ color: 'var(--sb-error)' }}><Icon as={Flag} size="sm" /></span>
                <span className="sb-settings-row__body"><span className="sb-settings-row__title">Report</span></span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   SC-047 — Anonymous Identity Manager
   ===================================================================== */
export function IdentityManagerScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const identities = useAnonIdentities()
  const active = useActiveAnon()
  const toast = useToast()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [del, setDel] = useState<AnonIdentity | null>(null)

  const create = () => {
    store.createAnonIdentity(name)
    setName('')
    setCreating(false)
    toast.success('New anonymous identity created')
  }

  return (
    <div className="sb-fill" data-anon="true">
      <TopAppBar title="Anonymous identities" onBack={back} actions={<IconButton icon={Plus} label="New identity" onClick={() => setCreating(true)} />} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          <Banner tone="info" icon={KeyRound}>
            Each identity is a separate key pair generated on this device. Switching changes who you appear as — never revealing your registered account.
          </Banner>

          <div className="sb-settings-group">
            {identities.map((idn) => {
              const isActive = idn.id === active.id
              return (
                <div key={idn.id} className="sb-settings-row">
                  <Avatar name={idn.name} kind="anonymous" size="md" />
                  <button className="sb-settings-row__body" style={{ textAlign: 'left' }} onClick={() => navigate('/anon/key/' + (idn.id === active.id ? 'anon-me' : idn.id))}>
                    <span className="sb-settings-row__title">{idn.name}</span>
                    <span className="sb-settings-row__sub" style={{ fontFamily: 'var(--sb-font-mono)' }}>{idn.sessionId}</span>
                  </button>
                  {isActive ? (
                    <Badge tone="primary">Active</Badge>
                  ) : (
                    <div className="sb-row sb-gap-1">
                      <Button variant="soft" size="sm" onClick={() => { store.setActiveAnon(idn.id); toast.show(`Now appearing as ${idn.name}`) }}>Use</Button>
                      <IconButton icon={Trash2} label={`Delete ${idn.name}`} size="sm" onClick={() => setDel(idn)} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Button variant="secondary" block iconStart={Plus} onClick={() => setCreating(true)}>Create new identity</Button>
        </div>
      </div>

      {/* create sheet — reuse ConfirmDialog-like modal via inline */}
      <ConfirmDialog
        open={creating}
        onClose={() => { setCreating(false); setName('') }}
        onConfirm={create}
        icon={VenetianMask}
        title="New anonymous identity"
        description="A fresh key pair will be generated on your device."
        confirmLabel="Generate"
      />

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => { if (del) store.deleteAnonIdentity(del.id); toast.show('Identity deleted') }}
        icon={Trash2}
        tone="danger"
        title={`Delete ${del?.name}?`}
        description="Its key pair is removed from this device. Conversations using it will no longer be reachable."
        confirmLabel="Delete"
      />
    </div>
  )
}

/* =====================================================================
   Anonymous group creation (FLOW-014)
   ===================================================================== */
export function AnonCreateGroupScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const toast = useToast()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const contacts = useMemo(
    () => Object.values(store.state.users).filter((u) => u.anon),
    [store.state.users],
  )
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const canCreate = name.trim().length > 0 && selected.length > 0

  const create = () => {
    const id = store.createGroup(name.trim(), selected, { env: 'anonymous' })
    toast.success('Anonymous group created')
    navigate(`/anon/chats/${id}`, { replace: true })
  }

  return (
    <div className="sb-fill" data-anon="true">
      <TopAppBar title="New anonymous group" onBack={back} actions={<Button size="sm" disabled={!canCreate} onClick={create}>Create</Button>} />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-4)' }}>
        <Field label="Group name">
          <TextInput placeholder="e.g. Night Owls" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <div style={{ marginTop: 'var(--sb-space-3)' }}>
          <Banner tone="info" icon={QrCode}>
            Members join anonymously via QR or public key. No real identities are shared.
          </Banner>
        </div>
        <div className="sb-row" style={{ justifyContent: 'space-between', margin: '16px 0 8px' }}>
          <p className="sb-section-label">Add anonymous contacts</p>
          {selected.length > 0 && <Badge tone="primary">{selected.length} selected</Badge>}
        </div>
        {contacts.length === 0 ? (
          <EmptyState icon={QrCode} tone="anon" title="No anonymous contacts" description="Pair with people via QR first, then create a group." action={<Button onClick={() => navigate('/anon/scan')}>Scan a QR code</Button>} />
        ) : (
          contacts.map((u) => {
            const on = selected.includes(u.id)
            return (
              <button key={u.id} className="sb-convo" aria-pressed={on} onClick={() => toggle(u.id)}>
                <Avatar name={u.name} kind="anonymous" size="lg" presence={u.presence} />
                <span className="sb-convo__body">
                  <span className="sb-convo__name">{u.name}</span>
                  <span className="sb-convo__preview" style={{ fontFamily: 'var(--sb-font-mono)' }}>{u.sessionId}</span>
                </span>
                <span aria-hidden style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', border: on ? 'none' : '2px solid var(--sb-border-strong)', background: on ? 'var(--sb-primary)' : 'transparent', color: '#fff' }}>
                  {on && <Icon as={Check} size={15} />}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ---------- local mock helpers ---------- */
const NAMES_A = ['Crimson', 'Violet', 'Silent', 'Midnight', 'Amber', 'Cobalt', 'Ember', 'Shadow', 'Lunar', 'Ivory', 'Onyx', 'Scarlet']
const NAMES_B = ['Fox', 'Heron', 'Falcon', 'Otter', 'Wolf', 'Cipher', 'Raven', 'Lynx', 'Moth', 'Owl', 'Koi', 'Hawk']
function randomName() {
  return `${NAMES_A[Math.floor(Math.random() * NAMES_A.length)]} ${NAMES_B[Math.floor(Math.random() * NAMES_B.length)]} ${1000 + Math.floor(Math.random() * 9000)}`
}
function fakeFingerprint(seed: string) {
  let h = 2166136261
  let out = ''
  for (let i = 0; i < 32; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i * 97
    h = Math.imul(h, 16777619) >>> 0
    out += '0123456789ABCDEF'[(h >>> (i % 24)) & 15]
    if (i % 4 === 3 && i < 31) out += ' '
  }
  return out
}
