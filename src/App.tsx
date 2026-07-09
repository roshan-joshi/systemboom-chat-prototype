import { ThemeProvider } from '@/lib/theme'
import { RouterProvider } from '@/lib/router'
import { ToastProvider } from '@/components'
import { AppShell } from '@/app/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </RouterProvider>
    </ThemeProvider>
  )
}
