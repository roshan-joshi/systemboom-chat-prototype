import { useEffect, useState } from 'react'
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VideoOff,
  PhoneOff,
  Info,
} from 'lucide-react'
import { useRouter, useParams } from '@/lib/router'
import {
  TopAppBar,
  IconButton,
  Avatar,
  Icon,
  Fab,
  EmptyState,
  useToast,
} from '@/components'
import { useStore, useConversation, useUser } from '@/data/store'
import { callTime } from '@/data/format'

/* SC-063 — Call History */
export function CallHistoryScreen() {
  const { navigate } = useRouter()
  const { state } = useStore()
  const toast = useToast()

  return (
    <div className="sb-fill">
      <TopAppBar
        title="Calls"
        actions={<IconButton icon={PhoneCall} label="New call" onClick={() => navigate('/new-chat')} />}
      />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-2) var(--sb-space-2) var(--sb-space-10)' }}>
        {state.calls.length === 0 ? (
          <div style={{ paddingTop: 40 }}>
            <EmptyState icon={Phone} title="No calls yet" description="Voice and video calls flow from your conversations — and always return you to them." />
          </div>
        ) : (
          state.calls.map((c) => {
            const u = state.users[c.userId]
            const missed = c.direction === 'missed'
            const DirIcon = c.direction === 'incoming' ? PhoneIncoming : c.direction === 'outgoing' ? PhoneOutgoing : PhoneMissed
            const conv = state.conversations.find((x) => x.kind === 'private' && x.userId === c.userId)
            return (
              <div key={c.id} className="sb-convo">
                <Avatar name={u?.name ?? '?'} size="lg" presence={u?.presence} />
                <button className="sb-convo__body" style={{ textAlign: 'left' }} onClick={() => conv && navigate(`/chats/${conv.id}`)}>
                  <span className="sb-convo__top">
                    <span className="sb-convo__name" style={missed ? { color: 'var(--sb-error)' } : undefined}>{u?.name}</span>
                  </span>
                  <span className="sb-convo__bottom">
                    <span className="sb-convo__preview">
                      <Icon as={DirIcon} size={13} />
                      {callTime(c.at)}{c.duration ? ` · ${c.duration}` : ''}
                    </span>
                  </span>
                </button>
                <IconButton
                  icon={c.kind === 'video' ? Video : Phone}
                  label={`Call ${u?.name} back`}
                  onClick={() => conv ? navigate(`/call/${conv.id}?kind=${c.kind}`) : toast.show('Start a chat first')}
                />
              </div>
            )
          })
        )}
      </div>
      <div className="sb-fab-anchor">
        <Fab icon={PhoneCall} label="Start a call" onClick={() => navigate('/new-chat')} />
      </div>
    </div>
  )
}

/* SC-061 / SC-062 — Voice / Video Call (in-progress).
   Calls begin from a conversation and return to it (SM-003, FLOW-006/007). */
export function CallScreen() {
  const { navigate, back } = useRouter()
  const { id } = useParams('/call/:id')
  const { query } = useRouter()
  const kind = query.get('kind') === 'video' ? 'video' : 'voice'
  const conv = useConversation(id)
  const other = useUser(conv?.kind === 'private' ? conv.userId : undefined)
  const toast = useToast()

  const [phase, setPhase] = useState<'ringing' | 'connected'>('ringing')
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [videoOn, setVideoOn] = useState(kind === 'video')

  const title = conv?.kind === 'group' ? conv.title : other?.name ?? 'Call'

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('connected'), 1800)
    return () => window.clearTimeout(t)
  }, [])
  useEffect(() => {
    if (phase !== 'connected') return
    const iv = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(iv)
  }, [phase])

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const endCall = () => {
    if (id) navigate(`/chats/${id}`, { replace: true })
    else back()
  }

  return (
    <div
      className="sb-fill"
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--sb-space-8) var(--sb-space-6)',
        background: videoOn
          ? 'linear-gradient(160deg,#20242d,#0b0e14)'
          : 'radial-gradient(120% 80% at 50% 0%, var(--sb-indigo-800), var(--sb-neutral-950))',
        color: '#fff',
        textAlign: 'center',
      }}
    >
      {/* self PiP for video */}
      {videoOn && (
        <div style={{ position: 'absolute', top: 20, right: 20, width: 96, height: 132, borderRadius: 16, background: 'linear-gradient(135deg,#4b54d6,#0fb0aa)', border: '2px solid rgba(255,255,255,0.3)' }} />
      )}

      <div style={{ marginTop: 'var(--sb-space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={phase === 'ringing' ? { animation: 'sb-pulse-ring 1.6s infinite', borderRadius: '50%' } : undefined}>
          <Avatar name={title ?? '?'} kind={conv?.kind === 'group' ? 'group' : 'user'} size={128} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--sb-text-heading)', fontWeight: 700 }}>{title}</h1>
          <p style={{ opacity: 0.8, marginTop: 4 }}>
            {phase === 'ringing' ? `${kind === 'video' ? 'Video' : 'Voice'} call · Ringing…` : clock}
          </p>
          <p style={{ opacity: 0.6, fontSize: 'var(--sb-text-caption)', marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
            <Icon as={Info} size={13} /> End-to-end encrypted
          </p>
        </div>
      </div>

      {/* controls */}
      <div className="sb-row" style={{ gap: 18 }}>
        <CallBtn icon={muted ? MicOff : Mic} label="Mute" active={muted} onClick={() => setMuted((m) => !m)} />
        <CallBtn icon={Volume2} label="Speaker" onClick={() => toast.show('Speaker on')} />
        {kind === 'video' && <CallBtn icon={videoOn ? Video : VideoOff} label="Camera" active={!videoOn} onClick={() => setVideoOn((v) => !v)} />}
        <CallBtn icon={PhoneOff} label="End call" danger onClick={endCall} />
      </div>
    </div>
  )
}

function CallBtn({ icon, label, onClick, danger, active }: { icon: any; label: string; onClick: () => void; danger?: boolean; active?: boolean }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center',
        background: danger ? 'var(--sb-error)' : active ? '#fff' : 'rgba(255,255,255,0.16)',
        color: danger ? '#fff' : active ? 'var(--sb-neutral-900)' : '#fff',
        backdropFilter: 'blur(8px)',
        transition: 'transform var(--sb-duration-fast) var(--sb-ease-emphasized)',
      }}
    >
      <Icon as={icon} size="lg" />
    </button>
  )
}
