import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'
import { Icon, type IconSize } from './Icon'

/* ---------------- Button ---------------- */
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'soft'
  | 'danger'
  | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
  iconStart?: LucideIcon
  iconEnd?: LucideIcon
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    block,
    loading,
    iconStart,
    iconEnd,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        'sb-btn',
        `sb-btn--${variant}`,
        size !== 'md' && `sb-btn--${size}`,
        block && 'sb-btn--block',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="sb-spinner" style={{ width: 16, height: 16 }} aria-hidden />
      ) : (
        iconStart && <Icon as={iconStart} size="sm" />
      )}
      {children}
      {iconEnd && !loading && <Icon as={iconEnd} size="sm" />}
    </button>
  )
})

/* ---------------- Icon Button ---------------- */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  label: string
  size?: 'sm' | 'md'
  iconSize?: IconSize
  active?: boolean
  onPrimary?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon, label, size = 'md', iconSize, active, onPrimary, className, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cx(
          'sb-iconbtn',
          size === 'sm' && 'sb-iconbtn--sm',
          active && 'sb-iconbtn--active',
          onPrimary && 'sb-iconbtn--onprimary',
          className,
        )}
        {...rest}
      >
        <Icon as={icon} size={iconSize ?? (size === 'sm' ? 'sm' : 'md')} />
      </button>
    )
  },
)

/* ---------------- FAB ---------------- */
export function Fab({
  icon,
  label,
  extended,
  className,
  ...rest
}: {
  icon: LucideIcon
  label: string
  extended?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx('sb-fab', className)}
      {...rest}
    >
      <Icon as={icon} size="md" />
      {extended && <span>{extended}</span>}
    </button>
  )
}

/* ---------------- Spinner ---------------- */
export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <span
      className="sb-spinner"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
    />
  )
}

/* ---------------- Card ---------------- */
export function Card({
  interactive,
  flat,
  pad,
  className,
  children,
  as: Tag = 'div',
  ...rest
}: {
  interactive?: boolean
  flat?: boolean
  pad?: boolean
  className?: string
  children: ReactNode
  as?: 'div' | 'button' | 'article'
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cx(
        'sb-card',
        flat && 'sb-card--flat',
        pad && 'sb-card--pad',
        interactive && 'sb-card--interactive',
        className,
      )}
      {...(rest as object)}
    >
      {children}
    </Tag>
  )
}

/* ---------------- Badge ---------------- */
type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'anon'

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: BadgeTone
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cx('sb-badge', `sb-badge--${tone}`, className)}>
      {icon && <Icon as={icon} size={13} />}
      {children}
    </span>
  )
}

/* ---------------- Count badge ---------------- */
export function CountBadge({ count, muted }: { count: number; muted?: boolean }) {
  if (count <= 0) return null
  return (
    <span
      className={cx('sb-count', muted && 'sb-count--muted')}
      aria-label={`${count} unread`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

/* ---------------- Chip ---------------- */
export function Chip({
  selected,
  icon,
  onClick,
  children,
}: {
  selected?: boolean
  icon?: LucideIcon
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="sb-chip"
      aria-pressed={selected}
      onClick={onClick}
    >
      {icon && <Icon as={icon} size="sm" />}
      {children}
    </button>
  )
}

/* ---------------- Switch ---------------- */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="sb-switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  )
}

/* ---------------- Segmented control ---------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="sb-segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          className="sb-segmented__item"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Divider ---------------- */
export function Divider({ className }: { className?: string }) {
  return <hr className={cx('sb-divider', className)} />
}
