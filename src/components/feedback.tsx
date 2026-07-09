import type { ReactNode } from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'
import { Icon } from './Icon'

/* ---------------- Banner ---------------- */
type BannerTone = 'info' | 'success' | 'warning' | 'error' | 'anon'
const BANNER_ICON: Record<BannerTone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  anon: Shield,
}

export function Banner({
  tone = 'info',
  icon,
  children,
  action,
  className,
}: {
  tone?: BannerTone
  icon?: LucideIcon
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('sb-banner', `sb-banner--${tone}`, className)} role="status">
      <span className="sb-banner__icon">
        <Icon as={icon ?? BANNER_ICON[tone]} size="sm" />
      </span>
      <div className="sb-banner__body">{children}</div>
      {action}
    </div>
  )
}

/* ---------------- Empty State (DS-002 Empty States) ---------------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'primary',
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  tone?: 'primary' | 'anon'
}) {
  return (
    <div className="sb-empty">
      <div
        className="sb-empty__art"
        style={
          tone === 'anon'
            ? { background: 'var(--sb-anon-soft)', color: 'var(--sb-anon)' }
            : undefined
        }
      >
        <Icon as={icon} size={38} strokeWidth={1.7} />
      </div>
      <h2 className="sb-empty__title">{title}</h2>
      <p className="sb-empty__text">{description}</p>
      {action}
    </div>
  )
}

/* ---------------- Progress ---------------- */
export function Progress({
  value,
  indeterminate,
  label,
}: {
  value?: number
  indeterminate?: boolean
  label?: string
}) {
  return (
    <div
      className={cx('sb-progress', indeterminate && 'sb-progress--indeterminate')}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="sb-progress__bar"
        style={{ width: indeterminate ? undefined : `${value ?? 0}%` }}
      />
    </div>
  )
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({
  width,
  height = 14,
  radius,
  circle,
  className,
  style,
}: {
  width?: number | string
  height?: number | string
  radius?: number | string
  circle?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden
      className={cx('sb-skeleton', className)}
      style={{
        display: 'block',
        width: width ?? '100%',
        height,
        borderRadius: circle ? '50%' : radius,
        ...style,
      }}
    />
  )
}
