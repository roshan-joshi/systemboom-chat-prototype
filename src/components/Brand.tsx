import { cx } from '@/lib/utils'

/*
  SystemBoom mark — an original geometric glyph: two overlapping conversation
  strokes forming a subtle "boom" burst. Distinct from any competitor mark
  (DS-002: recognisable as SystemBoom before the wordmark is read).
*/
export function BrandMark({
  size = 32,
  className,
  onDark,
}: {
  size?: number
  className?: string
  onDark?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill="url(#sb-grad)" />
      <path
        d="M11 20.5c0 1.7 1.5 3 3.6 3 2.2 0 3.7-1.1 3.7-2.8 0-1.6-1.1-2.4-3.3-2.9l-1-.2c-1-.2-1.4-.5-1.4-1 0-.6.6-1 1.5-1 .9 0 1.5.4 1.7 1.1l2.4-.7c-.5-1.6-2-2.6-4-2.6-2.2 0-3.8 1.2-3.8 2.9 0 1.6 1.1 2.4 3.1 2.8l1 .2c1.1.2 1.5.5 1.5 1.1 0 .6-.6 1-1.6 1-1 0-1.7-.5-1.9-1.3l-2.5.6z"
        fill={onDark ? '#0b0e14' : '#fff'}
      />
      <circle cx="22.5" cy="10" r="2.1" fill={onDark ? '#0b0e14' : '#fff'} opacity="0.9" />
      <defs>
        <linearGradient id="sb-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5f69e8" />
          <stop offset="1" stopColor="#3d45b4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Wordmark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const fontSize = size === 'lg' ? 22 : size === 'sm' ? 15 : 18
  const gap = size === 'lg' ? 12 : 9
  return (
    <span
      className={cx('sb-row', className)}
      style={{ gap, alignItems: 'center' }}
    >
      <BrandMark size={size === 'lg' ? 36 : size === 'sm' ? 26 : 30} />
      <span
        style={{
          fontSize,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--sb-text)',
        }}
      >
        SystemBoom
      </span>
    </span>
  )
}
