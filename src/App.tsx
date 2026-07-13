import { ThemeProvider } from '@/lib/theme'
import { RouterProvider } from '@/lib/router'
import { ConnectivityProvider } from '@/lib/connectivity'
import { ToastProvider, ErrorBoundary } from '@/components'
import { StoreProvider } from '@/data/store'
import { AppShell } from '@/app/AppShell'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <StoreProvider>
          <ConnectivityProvider>
            <RouterProvider>
              <ToastProvider>
                <AppShell />
              </ToastProvider>
            </RouterProvider>
          </ConnectivityProvider>
        </StoreProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
