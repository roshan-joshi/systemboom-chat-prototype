import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { Icon } from './Icon'
import { cx } from '@/lib/utils'

type ToastTone = 'default' | 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  message: string
  tone: ToastTone
  action?: { label: string; onClick: () => void }
}

interface ToastApi {
  show: (
    message: string,
    opts?: { tone?: ToastTone; action?: ToastItem['action']; duration?: number },
  ) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback<ToastApi['show']>(
    (message, opts) => {
      const id = ++idRef.current
      const tone = opts?.tone ?? 'default'
      setToasts((prev) => [...prev.slice(-2), { id, message, tone, action: opts?.action }])
      const duration = opts?.duration ?? 3400
      window.setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m) => show(m, { tone: 'success' }),
      error: (m) => show(m, { tone: 'error' }),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="sb-toast-region" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="sb-toast">
            {t.tone !== 'default' && (
              <span className={cx('sb-toast__icon', `sb-toast__icon--${t.tone}`)}>
                <Icon
                  as={t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? XCircle : Info}
                  size="sm"
                />
              </span>
            )}
            <span className="sb-toast__msg">{t.message}</span>
            {t.action && (
              <button
                className="sb-toast__action"
                onClick={() => {
                  t.action?.onClick()
                  dismiss(t.id)
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
