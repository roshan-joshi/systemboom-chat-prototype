import { useEffect } from 'react'
import { Palette } from 'lucide-react'
import { useRouter, Link } from '@/lib/router'
import { useBreakpoint } from '@/lib/hooks'
import { BottomNav, NavRail, BrandMark, Tooltip } from '@/components'
import { resolveRoute, NAV_ITEMS, ANON_NAV_ITEMS, isAnonPath } from './routes'

export function AppShell() {
  const { path, query } = useRouter()
  const breakpoint = useBreakpoint()
  const { route } = resolveRoute(path)
  // Include query so query-differentiated screens (e.g. call kind) remount.
  const pageKey = query.toString() ? `${path}?${query.toString()}` : path

  // Anonymous environment (PD-033): distinct nav + violet accent.
  const anon = isAnonPath(path)
  const navItems = anon ? ANON_NAV_ITEMS : NAV_ITEMS

  // Keep the document title in sync with the active screen.
  useEffect(() => {
    const label = navItems.find((n) => n.id === route.tab)?.label
    document.title = anon
      ? 'SystemBoom · Anonymous'
      : label
        ? `SystemBoom · ${label}`
        : 'SystemBoom Chat'
  }, [route, anon, navItems])

  const isDesktop = breakpoint === 'desktop'

  // Full-screen chrome (Splash, Welcome) — no nav.
  if (route.chrome === 'full') {
    return (
      <div className="sb-app">
        <div className="sb-frame">
          <main className="sb-shell" id="main" data-scroll-region>
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
              <Link to={anon ? '/anon' : '/home'} aria-label="SystemBoom home">
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
