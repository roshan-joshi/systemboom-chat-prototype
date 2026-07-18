import { useEffect } from 'react'
import { useRouter } from '@/lib/router'
import { BrandMark, BrandLogo } from '@/components'

/* SC-001 — Splash. Brief brand moment, then hands off to Welcome. */
export function SplashScreen() {
  const { navigate } = useRouter()
  useEffect(() => {
    const onboarded = (() => {
      try {
        return localStorage.getItem('sb.onboarded') === '1'
      } catch {
        return false
      }
    })()
    const t = window.setTimeout(() => {
      navigate(onboarded ? '/home' : '/welcome', { replace: true })
    }, 1700)
    return () => window.clearTimeout(t)
  }, [navigate])

  return (
    <div className="sb-splash" role="status" aria-label="SYSTEMBOOM Chat is starting">
      <div className="sb-splash__mark">
        <BrandMark size={104} />
      </div>
      <div className="sb-splash__word" style={{ marginTop: -6 }}>
        <BrandLogo height={26} />
      </div>
      <div className="sb-splash__tag">The conversation platform</div>
      <div className="sb-splash__loader">
        <span className="sb-spinner" style={{ width: 22, height: 22 }} />
      </div>
    </div>
  )
}
