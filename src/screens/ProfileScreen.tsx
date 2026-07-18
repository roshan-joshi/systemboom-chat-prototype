import {
  Shield,
  Lock,
  Bell,
  Smartphone,
  Palette,
  CircleUser,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Monitor,
  BadgeCheck,
  VenetianMask,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from '@/lib/router'
import { useTheme, type ThemePreference } from '@/lib/theme'
import {
  TopAppBar,
  Avatar,
  Icon,
  Badge,
  Button,
  ConfirmDialog,
  useToast,
} from '@/components'

const ME = { name: 'Aarav Sharma', handle: '@aarav', status: 'Available' }

interface Row {
  icon: LucideIcon
  title: string
  sub: string
  scId: string
}
const SETTINGS: Row[] = [
  { icon: Shield, title: 'Privacy', sub: 'Control who sees your activity', scId: 'SC-102' },
  { icon: Lock, title: 'Security', sub: 'Encryption, sessions & 2-step', scId: 'SC-103' },
  { icon: Bell, title: 'Notifications', sub: 'Sounds, previews & alerts', scId: 'SC-104' },
  { icon: Smartphone, title: 'Devices', sub: 'Linked & active devices', scId: 'SC-105' },
]

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

/* SC-100 — Profile. Hosts the foundation Appearance controls (theme). */
export function ProfileScreen() {
  const { navigate } = useRouter()
  const { preference, setPreference } = useTheme()
  const toast = useToast()
  const [signOutOpen, setSignOutOpen] = useState(false)

  const signOut = () => {
    try {
      localStorage.removeItem('sb.onboarded')
    } catch {
      /* ignore */
    }
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="sb-fill">
      <TopAppBar title="Profile" />
      <div className="sb-content sb-block" data-scroll-region>
        {/* Identity header */}
        <div className="sb-profile__header">
          <Avatar name={ME.name} size="xl" presence="online" />
          <div>
            <div className="sb-profile__name sb-row sb-gap-2" style={{ justifyContent: 'center' }}>
              {ME.name}
              <Icon as={BadgeCheck} size="sm" label="Verified" />
            </div>
            <div className="sb-profile__handle">{ME.handle} · {ME.status}</div>
          </div>
          <Button variant="secondary" size="sm" iconStart={CircleUser} onClick={() => toast.show('Edit profile arrives in Phase 2')}>
            Edit profile
          </Button>
        </div>

        {/* Appearance (Phase 1 foundation) */}
        <div className="sb-block">
          <p className="sb-section-label">Appearance</p>
          <div className="sb-theme-choice" role="group" aria-label="Theme">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="sb-theme-swatch"
                aria-pressed={preference === opt.value}
                onClick={() => setPreference(opt.value)}
              >
                <span
                  className="sb-theme-swatch__preview"
                  aria-hidden
                  style={
                    opt.value === 'system'
                      ? { background: 'linear-gradient(90deg,#fff 50%,#0b0e14 50%)' }
                      : opt.value === 'dark'
                        ? { background: '#0b0e14' }
                        : { background: '#f6f7f9' }
                  }
                >
                  {opt.value !== 'system' && (
                    <span
                      style={{
                        margin: 'auto 8px',
                        width: 34,
                        height: 10,
                        borderRadius: 6,
                        background: 'var(--sb-brand)',
                      }}
                    />
                  )}
                </span>
                <span className="sb-row sb-gap-1">
                  <Icon as={opt.icon} size={13} />
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings groups */}
        <div className="sb-block">
          <p className="sb-section-label">Settings</p>
          <div className="sb-settings-group">
            {SETTINGS.map((row) => (
              <button
                key={row.scId}
                className="sb-settings-row sb-settings-row--btn"
                onClick={() => toast.show(`${row.title} (${row.scId}) arrives in Phase 2`)}
              >
                <span className="sb-settings-row__icon">
                  <Icon as={row.icon} size="sm" />
                </span>
                <span className="sb-settings-row__body">
                  <span className="sb-settings-row__title" style={{ display: 'block' }}>
                    {row.title}
                  </span>
                  <span className="sb-settings-row__sub">{row.sub}</span>
                </span>
                <Icon as={ChevronRight} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Anonymous communication (FLOW-011) */}
        <div className="sb-block">
          <p className="sb-section-label">Privacy mode</p>
          <div className="sb-settings-group">
            <button className="sb-settings-row sb-settings-row--btn" onClick={() => navigate('/anon')}>
              <span className="sb-settings-row__icon" style={{ background: 'var(--sb-anon-soft)', color: 'var(--sb-anon)' }}>
                <Icon as={VenetianMask} size="sm" />
              </span>
              <span className="sb-settings-row__body">
                <span className="sb-settings-row__title" style={{ display: 'block' }}>Switch to Anonymous</span>
                <span className="sb-settings-row__sub">A separate, identity-free space — kept fully independent</span>
              </span>
              <Icon as={ChevronRight} size="sm" />
            </button>
          </div>
        </div>

        {/* Foundation / prototype tools */}
        <div className="sb-block">
          <p className="sb-section-label">Prototype</p>
          <div className="sb-settings-group">
            <button
              className="sb-settings-row sb-settings-row--btn"
              onClick={() => navigate('/design')}
            >
              <span className="sb-settings-row__icon" style={{ background: 'var(--sb-primary-soft)', color: 'var(--sb-primary)' }}>
                <Icon as={Palette} size="sm" />
              </span>
              <span className="sb-settings-row__body">
                <span className="sb-settings-row__title" style={{ display: 'block' }}>
                  Design System
                </span>
                <span className="sb-settings-row__sub">Foundation tokens & components (DS-003)</span>
              </span>
              <Badge tone="primary">Phase 1</Badge>
            </button>
          </div>
        </div>

        <Button variant="ghost" block iconStart={LogOut} onClick={() => setSignOutOpen(true)}>
          Sign out
        </Button>

        <p style={{ textAlign: 'center', fontSize: 'var(--sb-text-label)', color: 'var(--sb-text-tertiary)' }}>
          SYSTEMBOOM Chat · Prototype · Phase 1 Foundation
        </p>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={signOut}
        icon={LogOut}
        title="Sign out?"
        description="You'll return to the welcome screen. This is a prototype, so no real data is affected."
        confirmLabel="Sign out"
        tone="danger"
      />
    </div>
  )
}
