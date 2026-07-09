import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/*
  Minimal hash-based SPA router.
  Hash routing keeps the prototype trivially hostable (open index.html, any static
  server) with zero backend rewrites — appropriate for a UX blueprint.
*/

export interface RouteMatch {
  path: string
  params: Record<string, string>
  query: URLSearchParams
}

interface RouterContextValue extends RouteMatch {
  navigate: (to: string, opts?: { replace?: boolean }) => void
  back: () => void
  canGoBack: boolean
}

const RouterContext = createContext<RouterContextValue | null>(null)

function parseHash(): { path: string; query: URLSearchParams } {
  let raw = window.location.hash.replace(/^#/, '')
  if (!raw) raw = '/'
  const [pathPart, queryPart] = raw.split('?')
  const path = pathPart || '/'
  return { path, query: new URLSearchParams(queryPart || '') }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [{ path, query }, setState] = useState(parseHash)
  const [stackDepth, setStackDepth] = useState(0)

  useEffect(() => {
    const onHash = () => setState(parseHash())
    window.addEventListener('hashchange', onHash)
    // Ensure there's always a hash so the app boots at a known route.
    if (!window.location.hash) window.location.replace('#/')
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    const target = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`
    if (opts?.replace) {
      window.location.replace(target)
      setState(parseHash())
    } else {
      window.location.hash = target.slice(1)
      setStackDepth((d) => d + 1)
    }
    // Scroll active scroll regions to top on navigation.
    requestAnimationFrame(() => {
      document.querySelectorAll('[data-scroll-region]').forEach((el) => {
        ;(el as HTMLElement).scrollTop = 0
      })
    })
  }, [])

  const back = useCallback(() => {
    window.history.back()
    setStackDepth((d) => Math.max(0, d - 1))
  }, [])

  const value = useMemo<RouterContextValue>(
    () => ({ path, params: {}, query, navigate, back, canGoBack: stackDepth > 0 }),
    [path, query, navigate, back, stackDepth],
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within RouterProvider')
  return ctx
}

/** Extract params for a pattern against the current path (e.g. '/chats/:id'). */
export function useParams(pattern: string): Record<string, string> {
  const { path } = useRouter()
  return matchPath(pattern, path) ?? {}
}

/**
 * Match a path pattern like "/chats/:id" against a concrete path.
 * Returns extracted params, or null if no match.
 */
export function matchPath(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const pSeg = pattern.split('/').filter(Boolean)
  const aSeg = path.split('/').filter(Boolean)
  if (pSeg.length !== aSeg.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < pSeg.length; i++) {
    const p = pSeg[i]
    const a = aSeg[i]
    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(a)
    } else if (p !== a) {
      return null
    }
  }
  return params
}

/** Accessible in-app link that drives the hash router. */
export function Link({
  to,
  replace,
  className,
  children,
  onClick,
  ...rest
}: {
  to: string
  replace?: boolean
  className?: string
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const { navigate } = useRouter()
  const href = `#${to.startsWith('/') ? to : `/${to}`}`
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        onClick?.(e)
        navigate(to, { replace })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
