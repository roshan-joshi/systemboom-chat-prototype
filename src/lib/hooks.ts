import { useCallback, useEffect, useRef, useState } from 'react'

/** Reactive media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * Mobile-first breakpoints (DS-001 principle 5).
 *  mobile  : < 720px  — single column, bottom nav
 *  tablet  : 720–1023 — single column, roomier
 *  desktop : >= 1024  — multi-pane, side rail
 */
export function useBreakpoint(): Breakpoint {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 720px)')
  if (isDesktop) return 'desktop'
  if (isTablet) return 'tablet'
  return 'mobile'
}

/** Lock body / element scroll while an overlay is open. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

/** Run a callback on Escape key. */
export function useEscapeKey(handler: () => void, active = true) {
  const saved = useRef(handler)
  saved.current = handler
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') saved.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}

/**
 * Trap focus within a container while it is mounted (for modals / sheets).
 * Returns a ref to attach to the container element.
 */
export function useFocusTrap<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const container = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const FOCUSABLE_SEL =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    const queryFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SEL))
    // Visible-only set, used by the Tab-cycling logic.
    const getFocusable = () =>
      queryFocusable().filter((el) => el.offsetParent !== null || el === document.activeElement)

    // Move initial focus into the trap synchronously. This effect runs after the
    // portal has painted, so the container has layout; use the UNFILTERED set so
    // a dialog whose buttons momentarily report offsetParent === null still
    // receives focus (part of the M2 fix). Running synchronously — rather than on
    // requestAnimationFrame, which is throttled while the tab is backgrounded —
    // guarantees focus lands inside the dialog and beats any restore from an
    // overlay closing in the same commit (setups run after cleanups).
    queryFocusable()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    container.addEventListener('keydown', onKey)
    return () => {
      container.removeEventListener('keydown', onKey)
      // Restore focus to the trigger — but never yank it away from an overlay
      // that opened as this one closed (e.g. Conversation Actions → Delete
      // confirmation). Only restore if focus is still ours or has fallen back to
      // <body>; if another dialog has already taken focus, leave it there. This
      // runs before the newly-opened trap's setup focuses its own content, so the
      // dialog still wins the M2 race. (fixes the M2 focus-containment defect).
      const active = document.activeElement
      if (!active || active === document.body || container.contains(active)) {
        previouslyFocused?.focus?.()
      }
    }
  }, [active])
  return ref
}

/**
 * Returns true the first time a given key is mounted this session, for `ms`,
 * then false. Lets a screen show a real loading skeleton once without making
 * every navigation feel slow (DS-001: never wait unnecessarily).
 */
const firstLoadSeen = new Set<string>()
export function useFirstLoad(key: string, ms = 480): boolean {
  const [loading, setLoading] = useState(() => !firstLoadSeen.has(key))
  useEffect(() => {
    if (firstLoadSeen.has(key)) return
    const t = window.setTimeout(() => {
      firstLoadSeen.add(key)
      setLoading(false)
    }, ms)
    return () => window.clearTimeout(t)
  }, [key, ms])
  return loading
}

/** Persisted state backed by localStorage. */
export function usePersistentState<T>(key: string, initial: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  const set = useCallback(
    (v: T) => {
      setState(v)
      try {
        localStorage.setItem(key, JSON.stringify(v))
      } catch {
        /* ignore */
      }
    },
    [key],
  )
  return [state, set]
}
