import { cx } from '@/lib/utils'
import logoUrl from '@/assets/systemboom-logo.png'
import markUrl from '@/assets/systemboom-mark.png'

/*
  Official SystemBoom identity. The mascot (bomb) is the app mark; the full
  logo (mascot + chrome wordmark) is used where the brand is presented at size.
*/

export function BrandMark({
  size = 32,
  className,
}: {
  size?: number
  className?: string
  onDark?: boolean
}) {
  // Mascot art is ~174×249 (portrait); contain within a square box.
  return (
    <img
      src={markUrl}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={cx(className)}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  )
}

/** Full SystemBoom logo (mascot + wordmark). `height` drives the size. */
export function BrandLogo({
  height = 32,
  className,
}: {
  height?: number
  className?: string
}) {
  return (
    <img
      src={logoUrl}
      alt="SystemBoom"
      height={height}
      className={cx(className)}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )
}

/** Compact lockup: mascot + wordmark text (used in tight nav contexts). */
export function Wordmark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const mark = size === 'lg' ? 40 : size === 'sm' ? 26 : 32
  const fontSize = size === 'lg' ? 22 : size === 'sm' ? 15 : 18
  const gap = size === 'lg' ? 10 : 8
  return (
    <span className={cx('sb-row', className)} style={{ gap, alignItems: 'center' }}>
      <BrandMark size={mark} />
      <span
        style={{
          fontSize,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          color: 'var(--sb-text)',
        }}
      >
        System<span style={{ color: 'var(--sb-brand)' }}>Boom</span>
      </span>
    </span>
  )
}
