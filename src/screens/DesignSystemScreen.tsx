import { useState } from 'react'
import {
  Send,
  Plus,
  Heart,
  Trash2,
  Share2,
  Flag,
  Ban,
  BadgeCheck,
  Wifi,
} from 'lucide-react'
import { useRouter } from '@/lib/router'
import {
  TopAppBar,
  Button,
  IconButton,
  Fab,
  Card,
  Badge,
  CountBadge,
  Chip,
  Switch,
  Segmented,
  Avatar,
  Field,
  TextInput,
  SearchInput,
  Banner,
  Progress,
  Skeleton,
  Spinner,
  BottomSheet,
  ActionSheet,
  ConfirmDialog,
  Tooltip,
  Icon,
  useToast,
} from '@/components'

const COLORS = [
  { name: 'Primary', token: '--sb-primary' },
  { name: 'Secondary', token: '--sb-secondary' },
  { name: 'Success', token: '--sb-success' },
  { name: 'Warning', token: '--sb-warning' },
  { name: 'Error', token: '--sb-error' },
  { name: 'Info', token: '--sb-info' },
  { name: 'Anonymous', token: '--sb-anon' },
  { name: 'Surface', token: '--sb-surface' },
  { name: 'Bg', token: '--sb-bg' },
  { name: 'Text', token: '--sb-text' },
]

const TYPE = [
  { name: 'Display', var: '--sb-text-display', weight: 700 },
  { name: 'Heading', var: '--sb-text-heading', weight: 700 },
  { name: 'Title', var: '--sb-text-title', weight: 600 },
  { name: 'Body', var: '--sb-text-body', weight: 400 },
  { name: 'Caption', var: '--sb-text-caption', weight: 400 },
  { name: 'Label', var: '--sb-text-label', weight: 600 },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sb-block">
      <p className="sb-section-label">{title}</p>
      <Card pad flat>
        {children}
      </Card>
    </div>
  )
}

/* Design System gallery — foundation reference (DS-002 / DS-003). */
export function DesignSystemScreen() {
  const { back } = useRouter()
  const toast = useToast()
  const [toggle, setToggle] = useState(true)
  const [seg, setSeg] = useState<'all' | 'unread'>('all')
  const [chip, setChip] = useState(true)
  const [sheet, setSheet] = useState(false)
  const [actions, setActions] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <div className="sb-fill">
      <TopAppBar title="Design System" subtitle="DS-002 · DS-003 Foundation" onBack={back} />
      <div className="sb-content sb-block" data-scroll-region>
        <Banner tone="info">
          Every screen in SYSTEMBOOM is built from these tokens and components.
          Toggle the theme in <strong>Profile → Appearance</strong> to see them adapt.
        </Banner>

        {/* Colours */}
        <Section title="Colour · semantic tokens">
          <div className="sb-gallery__swatches">
            {COLORS.map((c) => (
              <div key={c.token} className="sb-swatch">
                <span
                  className="sb-swatch__chip"
                  style={{ background: `var(${c.token})` }}
                />
                <span className="sb-swatch__name">{c.name}</span>
                <span className="sb-swatch__token">{c.token}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography · scale">
          {TYPE.map((t) => (
            <div key={t.name} className="sb-type-sample">
              <span style={{ fontSize: `var(${t.var})`, fontWeight: t.weight, letterSpacing: '-0.01em' }}>
                {t.name} — Conversation is the hero
              </span>
              <small>{t.var}</small>
            </div>
          ))}
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="sb-col sb-gap-3">
            <div className="sb-demo-row">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="sb-demo-row">
              <Button size="sm" iconStart={Send}>Small</Button>
              <Button iconStart={Send}>Medium</Button>
              <Button size="lg" iconStart={Send}>Large</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="sb-demo-row">
              <Tooltip label="Icon button">
                <IconButton icon={Heart} label="Like" />
              </Tooltip>
              <IconButton icon={Share2} label="Share" active />
              <Fab icon={Plus} label="New" extended="New chat" />
            </div>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs">
          <div className="sb-col sb-gap-4">
            <Field label="Text input" hint="Single line field">
              <TextInput placeholder="Type something…" value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
            <SearchInput value={search} onChange={setSearch} placeholder="Search anything" />
            <div className="sb-row sb-gap-4" style={{ justifyContent: 'space-between' }}>
              <span className="sb-settings-row__title">Toggle</span>
              <Switch checked={toggle} onChange={setToggle} label="Demo toggle" />
            </div>
            <Segmented
              ariaLabel="Filter"
              value={seg}
              onChange={setSeg}
              options={[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread' }]}
            />
            <div className="sb-demo-row">
              <Chip selected={chip} icon={Wifi} onClick={() => setChip((v) => !v)}>Online</Chip>
              <Chip>Photos</Chip>
              <Chip>Links</Chip>
            </div>
          </div>
        </Section>

        {/* Badges & avatars */}
        <Section title="Badges & Avatars">
          <div className="sb-col sb-gap-3">
            <div className="sb-demo-row">
              <Badge tone="primary" icon={BadgeCheck}>Verified</Badge>
              <Badge tone="success">Online</Badge>
              <Badge tone="warning">Draft</Badge>
              <Badge tone="error">Failed</Badge>
              <Badge tone="anon">Anonymous</Badge>
              <CountBadge count={5} />
              <CountBadge count={128} />
            </div>
            <div className="sb-demo-row">
              <Avatar name="Aarav Sharma" presence="online" />
              <Avatar name="Design Team" kind="group" />
              <Avatar name="Boom Store" kind="business" />
              <Avatar name="anon" kind="anonymous" />
              <Avatar name="Sita Rai" size="lg" presence="away" />
            </div>
          </div>
        </Section>

        {/* Feedback */}
        <Section title="Feedback">
          <div className="sb-col sb-gap-3">
            <Banner tone="success">Your changes are saved.</Banner>
            <Banner tone="warning">Weak connection — retrying…</Banner>
            <Banner tone="error">Message failed to send.</Banner>
            <Progress value={64} label="Upload" />
            <Progress indeterminate label="Loading" />
            <div className="sb-row sb-gap-3">
              <Skeleton circle width={44} height={44} />
              <div className="sb-grow sb-col sb-gap-2">
                <Skeleton width="60%" />
                <Skeleton width="90%" />
              </div>
              <Spinner />
            </div>
          </div>
        </Section>

        {/* Overlays */}
        <Section title="Overlays & Toasts">
          <div className="sb-demo-row">
            <Button variant="secondary" onClick={() => setSheet(true)}>Bottom sheet</Button>
            <Button variant="secondary" onClick={() => setActions(true)}>Action sheet</Button>
            <Button variant="secondary" onClick={() => setConfirm(true)}>Confirm dialog</Button>
            <Button variant="secondary" onClick={() => toast.success('Saved successfully')}>Toast</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true)
                toast.show('Working…')
                window.setTimeout(() => {
                  setLoading(false)
                  toast.success('Done')
                }, 1400)
              }}
              loading={loading}
            >
              Async action
            </Button>
          </div>
        </Section>

        <p style={{ textAlign: 'center', fontSize: 'var(--sb-text-label)', color: 'var(--sb-text-tertiary)' }}>
          Build once. Reuse everywhere. Consistency is a feature. — DS-003
        </p>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Bottom sheet">
        <p style={{ color: 'var(--sb-text-secondary)', marginBottom: 16 }}>
          Bottom sheets present contextual actions without leaving the current screen —
          keeping the conversation in view (PD-006).
        </p>
        <Button block onClick={() => setSheet(false)}>Got it</Button>
      </BottomSheet>

      <ActionSheet
        open={actions}
        onClose={() => setActions(false)}
        title="Message"
        actions={[
          { label: 'Share', icon: Share2, onSelect: () => toast.show('Shared') },
          { label: 'Report', icon: Flag, onSelect: () => toast.show('Reported') },
          { label: 'Block', icon: Ban, danger: true, onSelect: () => toast.show('Blocked') },
          { label: 'Delete', icon: Trash2, danger: true, onSelect: () => toast.show('Deleted') },
        ]}
      />

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => toast.success('Confirmed')}
        icon={Trash2}
        tone="danger"
        title="Delete conversation?"
        description="This can't be undone in the real product. Here it's just a demo."
        confirmLabel="Delete"
      />
    </div>
  )
}
