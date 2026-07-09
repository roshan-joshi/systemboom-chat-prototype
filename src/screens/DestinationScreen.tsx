import type { ReactNode } from 'react'
import { Search, MoreVertical } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  TopAppBar,
  IconButton,
  EmptyState,
  Button,
  Badge,
  useToast,
} from '@/components'

/*
  Level-1 destination scaffold used by Chats / Calls / Marketplace / Anonymous in
  Phase 1. Renders the real chrome (top bar + primary action) around a genuine,
  positive empty state (DS-002). Content is delivered in the phase noted.
*/
export function DestinationScreen({
  title,
  phase,
  icon,
  emptyTitle,
  emptyText,
  primaryLabel,
  tone = 'primary',
  extra,
}: {
  title: string
  phase: string
  icon: LucideIcon
  emptyTitle: string
  emptyText: string
  primaryLabel: string
  tone?: 'primary' | 'anon'
  extra?: ReactNode
}) {
  const toast = useToast()
  return (
    <div className="sb-fill">
      <TopAppBar
        title={title}
        actions={
          <>
            <IconButton
              icon={Search}
              label={`Search ${title}`}
              onClick={() => toast.show(`Search opens in a later phase`)}
            />
            <IconButton
              icon={MoreVertical}
              label="More options"
              onClick={() => toast.show('More options coming soon')}
            />
          </>
        }
      />
      <div className="sb-center">
        <div>
          <EmptyState
            icon={icon}
            tone={tone}
            title={emptyTitle}
            description={emptyText}
            action={
              <div className="sb-col sb-gap-3" style={{ alignItems: 'center' }}>
                <Button
                  variant={tone === 'anon' ? 'secondary' : 'primary'}
                  onClick={() => toast.show(`${title} is delivered in ${phase}`)}
                >
                  {primaryLabel}
                </Button>
                <Badge tone="neutral">Arriving in {phase}</Badge>
              </div>
            }
          />
          {extra}
        </div>
      </div>
    </div>
  )
}
