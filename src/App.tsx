import { ThemeProvider } from '@/lib/theme'
import { RouterProvider } from '@/lib/router'
import { ToastProvider } from '@/components'
import { StoreProvider } from '@/data/store'
import { AppShell } from '@/app/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <RouterProvider>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </RouterProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
