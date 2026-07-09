import type { LucideIcon } from 'lucide-react'

/*
  Consistent iconography (DS-002): one stroke weight, size presets, decorative by
  default (aria-hidden) so icons support text rather than replace it.
*/

export const ICON_STROKE = 1.9

export type IconSize = 'sm' | 'md' | 'lg' | number

const SIZES: Record<Exclude<IconSize, number>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
}

export function Icon({
  as: Component,
  size = 'md',
  label,
  className,
  strokeWidth = ICON_STROKE,
}: {
  as: LucideIcon
  size?: IconSize
  /** If provided, the icon is meaningful and gets an accessible label. */
  label?: string
  className?: string
  strokeWidth?: number
}) {
  const px = typeof size === 'number' ? size : SIZES[size]
  return (
    <Component
      size={px}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    />
  )
}
