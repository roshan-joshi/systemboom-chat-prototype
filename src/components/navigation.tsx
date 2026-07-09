import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'
import { Icon } from './Icon'
import { IconButton } from './primitives'
import { Link } from '@/lib/router'

/* ---------------- Top App Bar (DS-003 Navigation) ---------------- */
export function TopAppBar({
  title,
  subtitle,
  onBack,
  leading,
  actions,
  titleContent,
  transparent,
  className,
}: {
  title?: string
  subtitle?: string
  onBack?: () => void
  leading?: ReactNode
  actions?: ReactNode
  titleContent?: ReactNode
  transparent?: boolean
  className?: string
}) {
  return (
    <header
      className={cx('sb-topbar', className)}
      style={transparent ? { background: 'transparent', backdropFilter: 'none', borderColor: 'transparent' } : undefined}
    >
      {onBack ? (
        <IconButton icon={ChevronLeft} label="Go back" onClick={onBack} />
      ) : (
        leading
      )}
      {titleContent ?? (
        <div className="sb-topbar__title">
          {title && <h1 className="sb-topbar__heading">{title}</h1>}
          {subtitle && <span className="sb-topbar__subtitle">{subtitle}</span>}
        </div>
      )}
      {actions && <div className="sb-topbar__actions">{actions}</div>}
    </header>
  )
}

/* ---------------- Tabs (DS-003 Navigation) ---------------- */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
}: {
  tabs: { value: T; label: string; badge?: number }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="sb-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          className="sb-tab"
          onClick={() => onChange(t.value)}
        >
          {t.label}
          {typeof t.badge === 'number' && t.badge > 0 && (
            <span className="sb-badge sb-badge--primary" style={{ marginLeft: 6 }}>
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Nav item shape ---------------- */
export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  iconActive?: LucideIcon
  to: string
  badge?: number
}

/* ---------------- Bottom Navigation (mobile / tablet) ---------------- */
export function BottomNav({
  items,
  activeId,
}: {
  items: NavItem[]
  activeId: string
}) {
  return (
    <nav className="sb-bottomnav" aria-label="Primary">
      {items.map((item) => {
        const active = item.id === activeId
        const IconComp = active && item.iconActive ? item.iconActive : item.icon
        return (
          <Link
            key={item.id}
            to={item.to}
            className="sb-bottomnav__item"
            aria-current={active ? 'page' : undefined}
          >
            <span className="sb-bottomnav__icon">
              <Icon as={IconComp} size="md" strokeWidth={active ? 2.3 : 1.9} />
              {item.badge ? (
                <span className="sb-bottomnav__badge">
                  <span className="sb-count" aria-label={`${item.badge} new`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                </span>
              ) : null}
            </span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/* ---------------- Nav Rail (desktop) ---------------- */
export function NavRail({
  items,
  activeId,
  brand,
  footer,
}: {
  items: NavItem[]
  activeId: string
  brand?: ReactNode
  footer?: ReactNode
}) {
  return (
    <nav className="sb-navrail" aria-label="Primary">
      {brand && <div className="sb-navrail__brand">{brand}</div>}
      {items.map((item) => {
        const active = item.id === activeId
        const IconComp = active && item.iconActive ? item.iconActive : item.icon
        return (
          <Link
            key={item.id}
            to={item.to}
            className="sb-navrail__item"
            aria-current={active ? 'page' : undefined}
          >
            <Icon as={IconComp} size="md" strokeWidth={active ? 2.3 : 1.9} />
            <span>{item.label}</span>
            {item.badge ? (
              <span className="sb-navrail__badge">
                <span className="sb-count" aria-label={`${item.badge} new`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              </span>
            ) : null}
          </Link>
        )
      })}
      <div className="sb-navrail__spacer" />
      {footer}
    </nav>
  )
}
