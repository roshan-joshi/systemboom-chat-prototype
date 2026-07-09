import { useState } from 'react'
import {
  MessageSquare,
  AtSign,
  Heart,
  PhoneMissed,
  Users,
  BellRing,
  CheckCheck,
  ChevronRight,
  Shield,
  Lock,
  Bell,
  Smartphone,
  Palette,
  CircleHelp,
  Info,
  LogOut,
  Laptop,
  Monitor,
  Trash2,
  ShieldCheck,
  KeyRound,
  Eye,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter, useParams } from '@/lib/router'
import {
  TopAppBar,
  IconButton,
  Avatar,
  Icon,
  Badge,
  Switch,
  Segmented,
  Banner,
  Button,
  EmptyState,
  ConfirmDialog,
  useToast,
} from '@/components'
import { useStore } from '@/data/store'
import { callTime } from '@/data/format'
import type { NotificationKind } from '@/data/types'

const NOTIF_ICON: Record<NotificationKind, LucideIcon> = {
  message: MessageSquare,
  mention: AtSign,
  reaction: Heart,
  missed_call: PhoneMissed,
  group_invite: Users,
}

/* Notifications */
export function NotificationsScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const notifs = store.state.notifications
  const unread = notifs.filter((n) => !n.read).length

  return (
    <div className="sb-fill">
      <TopAppBar
        title="Notifications"
        subtitle={unread ? `${unread} new` : 'All caught up'}
        onBack={back}
        actions={unread ? <IconButton icon={CheckCheck} label="Mark all read" onClick={() => store.readAllNotifications()} /> : undefined}
      />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-2)' }}>
        {notifs.length === 0 ? (
          <div style={{ paddingTop: 40 }}>
            <EmptyState icon={BellRing} title="Nothing new" description="Mentions, reactions, missed calls and invites will show up here." />
          </div>
        ) : (
          notifs.map((n) => {
            const u = store.state.users[n.fromId]
            return (
              <button
                key={n.id}
                className="sb-convo"
                style={!n.read ? { background: 'var(--sb-primary-soft)' } : undefined}
                onClick={() => {
                  store.readNotification(n.id)
                  if (n.conversationId) navigate(`/chats/${n.conversationId}`)
                }}
              >
                <span style={{ position: 'relative' }}>
                  <Avatar name={u?.name ?? '?'} kind={u?.business ? 'business' : 'user'} size="lg" />
                  <span style={{ position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: '50%', background: 'var(--sb-surface)', display: 'grid', placeItems: 'center', color: 'var(--sb-primary)', border: '1px solid var(--sb-border)' }}>
                    <Icon as={NOTIF_ICON[n.kind]} size={12} />
                  </span>
                </span>
                <span className="sb-convo__body">
                  <span className="sb-convo__top">
                    <span className="sb-convo__name">{n.title}</span>
                    <span className={n.read ? 'sb-convo__time' : 'sb-convo__time sb-convo__time--unread'}>{callTime(n.at).split(',')[0]}</span>
                  </span>
                  <span className="sb-convo__preview">{n.body}</span>
                </span>
                {!n.read && <span className="sb-dot" />}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

/* SC-101 — Settings */
interface Row { icon: LucideIcon; title: string; sub?: string; to?: string; onClick?: () => void; danger?: boolean }
function Group({ rows }: { rows: Row[] }) {
  const { navigate } = useRouter()
  return (
    <div className="sb-settings-group">
      {rows.map((r) => (
        <button
          key={r.title}
          className="sb-settings-row sb-settings-row--btn"
          style={r.danger ? { color: 'var(--sb-error)' } : undefined}
          onClick={() => (r.onClick ? r.onClick() : r.to && navigate(r.to))}
        >
          <span className="sb-settings-row__icon" style={r.danger ? { color: 'var(--sb-error)' } : undefined}><Icon as={r.icon} size="sm" /></span>
          <span className="sb-settings-row__body">
            <span className="sb-settings-row__title">{r.title}</span>
            {r.sub && <span className="sb-settings-row__sub">{r.sub}</span>}
          </span>
          {!r.danger && <Icon as={ChevronRight} size="sm" />}
        </button>
      ))}
    </div>
  )
}

export function SettingsScreen() {
  const { navigate, back } = useRouter()
  const store = useStore()
  const me = store.state.users.me
  const toast = useToast()
  const [signOut, setSignOut] = useState(false)

  return (
    <div className="sb-fill">
      <TopAppBar title="Settings" onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block">
          <button className="sb-settings-group" style={{ display: 'block' }} onClick={() => navigate('/profile')}>
            <div className="sb-settings-row sb-settings-row--btn">
              <Avatar name={me.name} size="lg" presence="online" />
              <span className="sb-settings-row__body">
                <span className="sb-settings-row__title" style={{ fontSize: 'var(--sb-text-body-lg)' }}>{me.name}</span>
                <span className="sb-settings-row__sub">{me.about}</span>
              </span>
              <Icon as={ChevronRight} size="sm" />
            </div>
          </button>

          <p className="sb-section-label">Account</p>
          <Group rows={[
            { icon: Shield, title: 'Privacy', sub: 'Last seen, read receipts, blocking', to: '/settings/privacy' },
            { icon: Lock, title: 'Security', sub: 'Encryption, two-step verification', to: '/settings/security' },
            { icon: Bell, title: 'Notifications', sub: 'Messages, groups, calls', to: '/settings/notifications' },
            { icon: Smartphone, title: 'Devices', sub: 'Linked devices & sessions', to: '/settings/devices' },
          ]} />

          <p className="sb-section-label">Preferences</p>
          <Group rows={[
            { icon: Palette, title: 'Appearance', sub: 'Theme & display', to: '/profile' },
            { icon: CircleHelp, title: 'Help', sub: 'FAQ & support', onClick: () => toast.show('Help centre (prototype)') },
            { icon: Info, title: 'About', sub: 'SystemBoom Chat · Prototype', onClick: () => toast.show('SystemBoom Chat — Phase 2') },
          ]} />

          <Group rows={[{ icon: LogOut, title: 'Sign out', danger: true, onClick: () => setSignOut(true) }]} />
        </div>
      </div>

      <ConfirmDialog
        open={signOut}
        onClose={() => setSignOut(false)}
        onConfirm={() => { try { localStorage.removeItem('sb.onboarded') } catch { /* ignore */ }; navigate('/welcome', { replace: true }) }}
        icon={LogOut}
        tone="danger"
        title="Sign out?"
        description="You’ll return to the welcome screen. This is a prototype, so no real data is affected."
        confirmLabel="Sign out"
      />
    </div>
  )
}

/* SC-102/103/104/105 — Settings detail (Privacy / Security / Notifications / Devices) */
export function SettingsDetailScreen() {
  const { back } = useRouter()
  const { section } = useParams('/settings/:section')
  const toast = useToast()

  // Local prototype state
  const [privacy, setPrivacy] = useState({ lastSeen: 'contacts', readReceipts: true, online: true })
  const [notif, setNotif] = useState({ messages: true, groups: true, calls: true, previews: true, sound: true })
  const [twoStep, setTwoStep] = useState(false)
  const [removeDevice, setRemoveDevice] = useState<string | null>(null)

  const titles: Record<string, string> = {
    privacy: 'Privacy',
    security: 'Security',
    notifications: 'Notifications',
    devices: 'Devices',
  }

  return (
    <div className="sb-fill">
      <TopAppBar title={titles[section] ?? 'Settings'} onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block">
          {section === 'privacy' && (
            <>
              <Banner tone="info">Choose who can see your activity. Changes apply instantly.</Banner>
              <div className="sb-block">
                <p className="sb-section-label">Last seen &amp; online</p>
                <Segmented ariaLabel="Last seen" value={privacy.lastSeen} onChange={(v) => setPrivacy((p) => ({ ...p, lastSeen: v }))}
                  options={[{ value: 'everyone', label: 'Everyone' }, { value: 'contacts', label: 'Contacts' }, { value: 'nobody', label: 'Nobody' }]} />
              </div>
              <div className="sb-settings-group">
                <ToggleRow icon={Eye} title="Show online status" checked={privacy.online} onChange={(v) => setPrivacy((p) => ({ ...p, online: v }))} />
                <ToggleRow icon={CheckCheck} title="Read receipts" sub="If off, you won’t send or receive them" checked={privacy.readReceipts} onChange={(v) => setPrivacy((p) => ({ ...p, readReceipts: v }))} />
              </div>
              <Group2 rows={[{ icon: Shield, title: 'Blocked contacts', sub: '0 blocked', onClick: () => toast.show('Blocked list (prototype)') }]} />
            </>
          )}

          {section === 'security' && (
            <>
              <Banner tone="anon" icon={ShieldCheck}>Your personal chats and calls are end-to-end encrypted by default.</Banner>
              <div className="sb-settings-group">
                <ToggleRow icon={KeyRound} title="Two-step verification" sub="Add a PIN for extra protection" checked={twoStep} onChange={(v) => { setTwoStep(v); toast.show(v ? 'Two-step verification on' : 'Two-step verification off') }} />
              </div>
              <Group2 rows={[
                { icon: ShieldCheck, title: 'Encryption', sub: 'View security code & verify', onClick: () => toast.show('Security code (prototype)') },
                { icon: Shield, title: 'Login alerts', sub: 'Get notified of new sign-ins', onClick: () => toast.show('Login alerts on') },
              ]} />
            </>
          )}

          {section === 'notifications' && (
            <div className="sb-settings-group">
              <ToggleRow icon={MessageSquare} title="Message notifications" checked={notif.messages} onChange={(v) => setNotif((n) => ({ ...n, messages: v }))} />
              <ToggleRow icon={Users} title="Group notifications" checked={notif.groups} onChange={(v) => setNotif((n) => ({ ...n, groups: v }))} />
              <ToggleRow icon={Bell} title="Call notifications" checked={notif.calls} onChange={(v) => setNotif((n) => ({ ...n, calls: v }))} />
              <ToggleRow icon={Eye} title="Message previews" sub="Show text in notifications" checked={notif.previews} onChange={(v) => setNotif((n) => ({ ...n, previews: v }))} />
              <ToggleRow icon={BellRing} title="Sound" checked={notif.sound} onChange={(v) => setNotif((n) => ({ ...n, sound: v }))} />
            </div>
          )}

          {section === 'devices' && (
            <>
              <Banner tone="info">You’re signed in on these devices. Remove any you don’t recognise.</Banner>
              <div className="sb-settings-group">
                {[
                  { id: 'd1', icon: Smartphone, name: 'iPhone 15 · This device', meta: 'Kathmandu · active now', me: true },
                  { id: 'd2', icon: Laptop, name: 'MacBook Pro', meta: 'Kathmandu · 2 hours ago' },
                  { id: 'd3', icon: Monitor, name: 'Web · Chrome', meta: 'Lalitpur · yesterday' },
                ].map((d) => (
                  <div key={d.id} className="sb-settings-row">
                    <span className="sb-settings-row__icon"><Icon as={d.icon} size="sm" /></span>
                    <span className="sb-settings-row__body">
                      <span className="sb-settings-row__title">{d.name}</span>
                      <span className="sb-settings-row__sub">{d.meta}</span>
                    </span>
                    {d.me ? <Badge tone="success">This device</Badge> : (
                      <IconButton icon={Trash2} label={`Remove ${d.name}`} onClick={() => setRemoveDevice(d.name)} />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="secondary" block iconStart={LogOut} onClick={() => toast.show('Logged out of all other devices')}>Log out all other devices</Button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!removeDevice}
        onClose={() => setRemoveDevice(null)}
        onConfirm={() => toast.show(`${removeDevice} removed`)}
        icon={Trash2}
        tone="danger"
        title="Remove device?"
        description={`${removeDevice} will be signed out immediately.`}
        confirmLabel="Remove"
      />
    </div>
  )
}

function ToggleRow({ icon, title, sub, checked, onChange }: { icon: LucideIcon; title: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="sb-settings-row">
      <span className="sb-settings-row__icon"><Icon as={icon} size="sm" /></span>
      <span className="sb-settings-row__body">
        <span className="sb-settings-row__title">{title}</span>
        {sub && <span className="sb-settings-row__sub">{sub}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

function Group2({ rows }: { rows: Row[] }) {
  const toast = useToast()
  return (
    <div className="sb-settings-group">
      {rows.map((r) => (
        <button key={r.title} className="sb-settings-row sb-settings-row--btn" onClick={() => (r.onClick ? r.onClick() : toast.show('Prototype'))}>
          <span className="sb-settings-row__icon"><Icon as={r.icon} size="sm" /></span>
          <span className="sb-settings-row__body">
            <span className="sb-settings-row__title">{r.title}</span>
            {r.sub && <span className="sb-settings-row__sub">{r.sub}</span>}
          </span>
          <Icon as={ChevronRight} size="sm" />
        </button>
      ))}
    </div>
  )
}
