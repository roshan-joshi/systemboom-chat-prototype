import { Compass } from 'lucide-react'
import { useRouter } from '@/lib/router'
import { TopAppBar, EmptyState, Button } from '@/components'

export function NotFoundScreen() {
  const { navigate, back, canGoBack } = useRouter()
  return (
    <div className="sb-fill">
      <TopAppBar title="Not found" onBack={canGoBack ? back : undefined} />
      <div className="sb-center">
        <EmptyState
          icon={Compass}
          title="This screen doesn't exist yet"
          description="Every screen in SystemBoom has a permanent ID (SC-XXX). This route isn't mapped — let's get you back to a conversation."
          action={<Button onClick={() => navigate('/home')}>Go home</Button>}
        />
      </div>
    </div>
  )
}
