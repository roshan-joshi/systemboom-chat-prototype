import { useEffect, useMemo, useRef } from 'react'
import { Palette, CloudOff } from 'lucide-react'
import { useRouter, Link } from '@/lib/router'
import { useBreakpoint } from '@/lib/hooks'
import { useConnectivity } from '@/lib/connectivity'
import { BottomNav, NavRail, BrandMark, Tooltip, Icon, useToast } from '@/components'
import { useStore } from '@/data/store'
import { resolveRoute, NAV_ITEMS, ANON_NAV_ITEMS, isAnonPath } from './routes'

/** Sticky offline strip + reconnect toast (SM-004 No-Internet recovery). */
function OfflineBanner() {
  const { effectiveOnline } = useConnectivity()
  const toast = useToast()
  const wasOffline = useRef(false)
  useEffect(() => {
    if (!effectiveOnline) wasOffline.current = true
    else if (wasOffline.current) {
      wasOffline.current = false
      toast.success('Back online')
    }
  }, [effectiveOnline, toast])
  if (effectiveOnline) return null
  return (
    <div className="sb-offline-bar" role="status" aria-live="polite">
      <Icon as={CloudOff} size={14} /> You’re offline — messages will send when you reconnect
    </div>
  )
}

export function AppShell() {
  const { path, query } = useRouter()
  const breakpoint = useBreakpoint()
  const { state } = useStore()
  const { route } = resolveRoute(path)
  // Include query so query-differentiated screens (e.g. call kind) remount.
  const pageKey = query.toString() ? `${path}?${query.toString()}` : path

  // Anonymous environment (PD-033): distinct nav + violet accent.
  const anon = isAnonPath(path)

  // Live unread total for the Chats destination (hidden at zero).
  const unreadChats = useMemo(
    () =>
      state.conversations
        .filter((c) => (c.env ?? 'registered') === 'registered' && !c.archived)
        .reduce((sum, c) => sum + c.unread, 0),
    [state.conversations],
  )
  const navItems = useMemo(
    () =>
      (anon ? ANON_NAV_ITEMS : NAV_ITEMS).map((item) =>
        item.id === 'chats' && unreadChats > 0 ? { ...item, badge: unreadChats } : item,
      ),
    [anon, unreadChats],
  )

  // Keep the document title in sync with the active screen.
  useEffect(() => {
    const label = navItems.find((n) => n.id === route.tab)?.label
    document.title = anon
      ? 'SYSTEMBOOM · Anonymous'
      : label
        ? `SYSTEMBOOM · ${label}`
        : 'SYSTEMBOOM Chat'
  }, [route, anon, navItems])

  const isDesktop = breakpoint === 'desktop'

  // Full-screen chrome (Splash, Welcome) — no nav.
  if (route.chrome === 'full') {
    return (
      <div className="sb-app">
        <div className="sb-frame">
          <main className="sb-shell" id="main" data-scroll-region>
            <OfflineBanner />
            <div className="sb-shell__main" data-scroll-region data-fill="true">
              <div key={pageKey} className="sb-page sb-fill">
                {route.element}
              </div>
            </div>
          </main>
          <div className="sb-overlay-root" id="sb-overlay-root" />
        </div>
      </div>
    )
  }

  return (
    <div className="sb-app">
      <a href="#main" className="sb-skip-link">
        Skip to content
      </a>
      <div className="sb-frame" data-anon={anon ? 'true' : undefined}>
        {isDesktop && (
          <NavRail
            items={navItems}
            activeId={route.tab ?? ''}
            brand={
              <Link to={anon ? '/anon' : '/home'} aria-label="SYSTEMBOOM home">
                <BrandMark size={40} />
              </Link>
            }
            footer={
              anon ? undefined : (
                <Tooltip label="Design System">
                  <Link to="/design" className="sb-navrail__item" aria-label="Design System">
                    <Palette size={20} strokeWidth={1.9} />
                    <span>Design</span>
                  </Link>
                </Tooltip>
              )
            }
          />
        )}

        <main className="sb-shell" id="main">
          <OfflineBanner />
          <div className="sb-shell__main" data-scroll-region data-fill="true">
            <div key={pageKey} className="sb-page sb-fill">
              {route.element}
            </div>
          </div>
          {!isDesktop && !route.deep && <BottomNav items={navItems} activeId={route.tab ?? ''} />}
        </main>
        <div className="sb-overlay-root" id="sb-overlay-root" />
      </div>
    </div>
  )
}
