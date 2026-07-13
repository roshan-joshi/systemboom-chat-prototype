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
  Connectivity — drives offline UX (SM-004 "No Internet" recovery, DS-001 speed/trust).
  `online` reflects the real browser state; `simulateOffline` is a prototype demo
  control so reviewers can exercise the offline + retry flows on demand.
  Components should read `effectiveOnline`.
*/

interface ConnectivityValue {
  online: boolean
  simulateOffline: boolean
  effectiveOnline: boolean
  setSimulateOffline: (v: boolean) => void
}

const ConnectivityContext = createContext<ConnectivityValue | null>(null)

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [simulateOffline, setSimulateOffline] = useState(false)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const value = useMemo<ConnectivityValue>(
    () => ({
      online,
      simulateOffline,
      effectiveOnline: online && !simulateOffline,
      setSimulateOffline,
    }),
    [online, simulateOffline],
  )

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>
}

export function useConnectivity(): ConnectivityValue {
  const ctx = useContext(ConnectivityContext)
  if (!ctx) throw new Error('useConnectivity must be used within ConnectivityProvider')
  return ctx
}

/** Convenience: is the app effectively online right now? */
export function useOnline(): boolean {
  return useConnectivity().effectiveOnline
}
