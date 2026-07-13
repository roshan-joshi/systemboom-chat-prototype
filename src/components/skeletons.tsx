import { Skeleton } from './feedback'

/*
  Loading skeletons (DS-003 Skeleton Loader). Mirror the real layout so the
  transition to content is calm and shift-free.
*/

export function ConversationListSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div aria-hidden style={{ padding: 'var(--sb-space-1) var(--sb-space-2)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sb-space-3)', padding: 'var(--sb-space-3)' }}>
          <Skeleton circle width={52} height={52} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={`${45 + ((i * 13) % 30)}%`} height={13} />
            <Skeleton width={`${60 + ((i * 7) % 30)}%`} height={11} />
          </div>
          <Skeleton width={30} height={11} />
        </div>
      ))}
    </div>
  )
}

export function MarketplaceGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="sb-mkt-grid" aria-hidden>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="sb-pcard">
          <Skeleton height={0} style={{ aspectRatio: '1 / 1', height: 'auto', borderRadius: 0 }} />
          <div className="sb-pcard__body" style={{ gap: 8 }}>
            <Skeleton width="90%" height={12} />
            <Skeleton width="45%" height={14} />
            <Skeleton width="60%" height={10} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ThreadSkeleton() {
  const rows: { mine: boolean; w: number }[] = [
    { mine: false, w: 62 },
    { mine: true, w: 48 },
    { mine: false, w: 70 },
    { mine: true, w: 40 },
    { mine: false, w: 55 },
  ]
  return (
    <div aria-hidden style={{ padding: 'var(--sb-space-4) var(--sb-space-3)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: r.mine ? 'flex-end' : 'flex-start' }}>
          <Skeleton width={`${r.w}%`} height={40} radius={16} />
        </div>
      ))}
    </div>
  )
}
