import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Icon } from './Icon'
import { Button } from './primitives'

/*
  Graceful recovery from unexpected render errors (PD-046). Keeps a crash from
  becoming a blank screen in front of an investor — offers a clear way back.
*/
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="sb-app">
        <div className="sb-frame">
          <div className="sb-center" style={{ flex: 1 }}>
            <div className="sb-empty">
              <div className="sb-empty__art" style={{ background: 'var(--sb-error-soft)', color: 'var(--sb-error)' }}>
                <Icon as={AlertTriangle} size={38} strokeWidth={1.7} />
              </div>
              <h2 className="sb-empty__title">Something went wrong</h2>
              <p className="sb-empty__text">
                An unexpected error interrupted the app. Your data is safe — reload to continue.
              </p>
              <Button iconStart={RotateCcw} onClick={() => window.location.reload()}>
                Reload
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
