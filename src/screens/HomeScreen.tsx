import {
  MessageSquare,
  Phone,
  Store,
  VenetianMask,
  Sparkles,
  ArrowRight,
  Palette,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter } from '@/lib/router'
import { Card, Icon, Badge } from '@/components'

interface Tile {
  title: string
  sub: string
  icon: LucideIcon
  to: string
  color: string
  bg: string
}

const TILES: Tile[] = [
  { title: 'Chats', sub: 'Private & group', icon: MessageSquare, to: '/chats', color: 'var(--sb-primary)', bg: 'var(--sb-primary-soft)' },
  { title: 'Calls', sub: 'Voice & video', icon: Phone, to: '/calls', color: 'var(--sb-secondary)', bg: 'var(--sb-secondary-soft)' },
  { title: 'Marketplace', sub: 'Shop in chat', icon: Store, to: '/marketplace', color: 'var(--sb-warning)', bg: 'var(--sb-warning-soft)' },
  { title: 'Anonymous', sub: 'Private mode', icon: VenetianMask, to: '/anonymous', color: 'var(--sb-anon)', bg: 'var(--sb-anon-soft)' },
]

/* SC-003 — Home. The launchpad; conversations are the centre (PD-024). */
export function HomeScreen() {
  const { navigate } = useRouter()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="sb-page">
      <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-5)' }}>
        <div>
          <p className="sb-section-label">{greeting}</p>
          <h2 className="sb-hub__greeting">Welcome to SystemBoom</h2>
        </div>

        {/* Spotlight — conversation first */}
        <button
          className="sb-hub__spotlight"
          onClick={() => navigate('/chats')}
          style={{ textAlign: 'left', width: '100%' }}
        >
          <div className="sb-grow">
            <h3>Start a conversation</h3>
            <p>Everything begins with a chat — decisions, calls, and purchases.</p>
          </div>
          <span
            className="sb-iconbtn sb-iconbtn--onprimary"
            style={{ background: 'rgba(255,255,255,0.16)' }}
            aria-hidden
          >
            <Icon as={ArrowRight} size="md" />
          </span>
        </button>

        {/* Quick access */}
        <div className="sb-block">
          <div className="sb-block__head">
            <p className="sb-section-label">Explore</p>
          </div>
          <div className="sb-hub__grid">
            {TILES.map((t) => (
              <Card
                key={t.title}
                interactive
                className="sb-hub__tile"
                as="button"
                onClick={() => navigate(t.to)}
              >
                <span className="sb-hub__tile-icon" style={{ background: t.bg, color: t.color }}>
                  <Icon as={t.icon} size="md" />
                </span>
                <span>
                  <span className="sb-hub__tile-title" style={{ display: 'block' }}>
                    {t.title}
                  </span>
                  <span className="sb-hub__tile-sub">{t.sub}</span>
                </span>
              </Card>
            ))}
          </div>
        </div>

        {/* AI assist — assists, never interrupts (PD-050) */}
        <Card pad interactive className="sb-row sb-gap-3" onClick={() => navigate('/chats')}>
          <span className="sb-hub__tile-icon" style={{ background: 'var(--sb-info-soft)', color: 'var(--sb-info)' }}>
            <Icon as={Sparkles} size="md" />
          </span>
          <div className="sb-grow">
            <div className="sb-hub__tile-title">SystemBoom AI</div>
            <div className="sb-hub__tile-sub">Smart replies, summaries & reminders — always on your terms.</div>
          </div>
          <Badge tone="info">Assist</Badge>
        </Card>

        {/* Foundation note (Prototype) */}
        <Card pad flat interactive className="sb-row sb-gap-3" onClick={() => navigate('/design')}
          style={{ background: 'var(--sb-surface-muted)' }}>
          <span className="sb-hub__tile-icon" style={{ background: 'var(--sb-surface)', color: 'var(--sb-text-secondary)' }}>
            <Icon as={Palette} size="md" />
          </span>
          <div className="sb-grow">
            <div className="sb-hub__tile-title">Design System</div>
            <div className="sb-hub__tile-sub">Explore the SystemBoom foundation — tokens & components.</div>
          </div>
          <Icon as={ArrowRight} size="sm" />
        </Card>
      </div>
    </div>
  )
}
