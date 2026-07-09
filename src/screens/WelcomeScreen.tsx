import { MessageSquare, ShieldCheck, VenetianMask } from 'lucide-react'
import { useRouter } from '@/lib/router'
import { Button, BrandMark, Icon } from '@/components'

/* SC-002 — Welcome. Establishes the promise, offers entry into the product.
   (Prototype: no real auth — both actions lead into the experience.) */
export function WelcomeScreen() {
  const { navigate } = useRouter()

  const enter = (to: string) => {
    try {
      localStorage.setItem('sb.onboarded', '1')
    } catch {
      /* ignore */
    }
    navigate(to, { replace: true })
  }

  return (
    <div className="sb-welcome sb-page">
      <div className="sb-welcome__glow" aria-hidden />

      <div className="sb-welcome__hero">
        <BrandMark size={64} />
        <h1 className="sb-welcome__title">
          Where conversation <em>becomes action.</em>
        </h1>
        <p className="sb-welcome__sub">
          Messaging, calls, commerce and privacy — connected in one calm,
          trusted place. No app-switching. The conversation stays the hero.
        </p>

        <div className="sb-welcome__points">
          <div className="sb-welcome__point">
            <span className="sb-welcome__point-icon">
              <Icon as={MessageSquare} size="sm" />
            </span>
            Private &amp; group chat that flows into everything you need.
          </div>
          <div className="sb-welcome__point">
            <span className="sb-welcome__point-icon">
              <Icon as={ShieldCheck} size="sm" />
            </span>
            Trust by design — privacy and security are core, not add-ons.
          </div>
          <div className="sb-welcome__point">
            <span className="sb-welcome__point-icon">
              <Icon as={VenetianMask} size="sm" />
            </span>
            Anonymous mode for when you need to speak freely.
          </div>
        </div>
      </div>

      <div className="sb-welcome__actions">
        <Button size="lg" block onClick={() => enter('/home')}>
          Get started
        </Button>
        <Button size="lg" variant="tertiary" block onClick={() => enter('/home')}>
          I already have an account
        </Button>
      </div>
    </div>
  )
}
