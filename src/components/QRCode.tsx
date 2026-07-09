/*
  Faux QR — a deterministic module grid derived from a string, with the three
  finder patterns that make a QR recognisable. This is a visual stand-in for the
  prototype (no real payload is encoded); it pairs with the mock key-exchange.
*/

function hash(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

const N = 25 // modules per side

function sepBlank(x: number, y: number): boolean {
  const inSep = (cx: number, cy: number) =>
    x >= cx - 1 && x <= cx + 7 && y >= cy - 1 && y <= cy + 7 &&
    !(x >= cx && x < cx + 7 && y >= cy && y < cy + 7)
  return inSep(0, 0) || inSep(N - 7, 0) || inSep(0, N - 7)
}

function finderModule(x: number, y: number): boolean | null {
  const pat = (cx: number, cy: number): boolean | null => {
    const lx = x - cx
    const ly = y - cy
    if (lx < 0 || lx > 6 || ly < 0 || ly > 6) return null
    const border = lx === 0 || lx === 6 || ly === 0 || ly === 6
    const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
    return border || core
  }
  const a = pat(0, 0)
  if (a !== null) return a
  const b = pat(N - 7, 0)
  if (b !== null) return b
  const c = pat(0, N - 7)
  if (c !== null) return c
  return null
}

export function QRCode({
  value,
  size = 200,
  fg = 'currentColor',
  className,
}: {
  value: string
  size?: number
  fg?: string
  className?: string
}) {
  const base = hash(value)
  const cells: { x: number; y: number }[] = []
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const f = finderModule(x, y)
      if (f !== null) {
        if (f) cells.push({ x, y })
        continue
      }
      // separator quiet ring around finders stays blank
      if (sepBlank(x, y)) continue
      const on = (hash(`${value}:${x}:${y}:${base}`) & 3) === 0 || (hash(`${x}x${y}`) ^ base) % 5 === 0
      if (on) cells.push({ x, y })
    }
  }
  const m = size / (N + 2) // 1-module quiet zone each side
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="QR code"
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} rx={size * 0.06} fill="var(--sb-surface)" />
      {cells.map((c, i) => (
        <rect
          key={i}
          x={(c.x + 1) * m}
          y={(c.y + 1) * m}
          width={m}
          height={m}
          rx={m * 0.22}
          fill={fg}
        />
      ))}
    </svg>
  )
}
