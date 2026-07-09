import { Users, Store, VenetianMask } from 'lucide-react'
import { cx, hashString, initials } from '@/lib/utils'
import { Icon } from './Icon'

export type AvatarKind = 'user' | 'group' | 'business' | 'anonymous'
export type Presence = 'online' | 'away' | 'offline'

/* Stable, calm avatar palette (paired bg/fg) assigned deterministically by name. */
const PALETTE = [
  ['#4b54d6', '#ffffff'],
  ['#0fb0aa', '#ffffff'],
  ['#d9930b', '#ffffff'],
  ['#e05353', '#ffffff'],
  ['#6b52c9', '#ffffff'],
  ['#2f7ee0', '#ffffff'],
  ['#178a5c', '#ffffff'],
  ['#c2568f', '#ffffff'],
]

const SIZES: Record<string, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 96,
}

export function Avatar({
  name,
  src,
  kind = 'user',
  size = 'md',
  presence,
  className,
}: {
  name: string
  src?: string
  kind?: AvatarKind
  size?: keyof typeof SIZES | number
  presence?: Presence
  className?: string
}) {
  const px = typeof size === 'number' ? size : SIZES[size]
  const [bg, fg] = PALETTE[hashString(name) % PALETTE.length]
  const fontSize = Math.round(px * 0.4)
  const presenceSize = Math.max(8, Math.round(px * 0.26))

  const kindIcon = kind === 'group' ? Users : kind === 'business' ? Store : VenetianMask

  return (
    <span
      className={cx('sb-avatar', `sb-avatar--${kind}`, className)}
      style={{
        width: px,
        height: px,
        background: kind === 'anonymous' ? undefined : bg,
        color: fg,
        fontSize,
      }}
    >
      {src ? (
        <img className="sb-avatar__img" src={src} alt="" loading="lazy" />
      ) : (
        <span className="sb-avatar__fallback" aria-hidden>
          {kind === 'anonymous' ? (
            <Icon as={VenetianMask} size={Math.round(px * 0.5)} />
          ) : kind === 'user' ? (
            initials(name)
          ) : (
            <Icon as={kindIcon} size={Math.round(px * 0.5)} />
          )}
        </span>
      )}
      {presence && presence !== 'offline' && (
        <span
          className={cx('sb-avatar__presence', `sb-avatar__presence--${presence}`)}
          style={{ width: presenceSize, height: presenceSize }}
          aria-label={presence}
        />
      )}
    </span>
  )
}
