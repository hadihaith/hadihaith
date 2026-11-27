import { useCallback, useEffect, useRef } from 'react'
import { useScrub, useVisibleLoop } from '../engine/hooks'
import { CAP_30, reducedMotion } from '../engine/ticker'

export const readToken = (token: string) => {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${token})`
  document.body.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

/* ---------- The chequered dissolve ---------- */
const CELL = 24
const SOLID_UNTIL = 0.16
const LIFT = 2
const ACCENT_SHARE = 0.06
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const noise = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

export function Chequer({ carry, className = '' }: { carry: 'light' | 'dark'; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const progress = useRef(0)
  const colours = useRef<{ surface: string; accent: string } | null>(null)
  // Measured by the ResizeObserver, not on each draw: reading the size inside
  // a scroll frame would force a layout after the other effects' writes.
  const size = useRef({ width: 0, height: 0 })

  const render = useCallback(() => {
    const canvas = ref.current
    if (!canvas) return
    const { width, height } = size.current
    if (!width || !height) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio)
    if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio)
    const context = canvas.getContext('2d')!
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    // Read once: a token lookup forces a style recalc, and this runs on every scroll frame.
    colours.current ??= { surface: readToken(carry === 'light' ? '--background' : '--surface-black'), accent: readToken('--accent') }
    const { surface, accent } = colours.current
    const cell = CELL
    const columns = Math.ceil(width / cell)
    const rows = Math.ceil(height / cell)
    const lift = progress.current * LIFT
    for (let y = 0; y < rows; y += 1) {
      const depth = y / Math.max(1, rows - 1) + lift
      if (depth > 1) break
      const solid = depth <= SOLID_UNTIL
      const fade = clamp01(1 - (depth - SOLID_UNTIL) / (1 - SOLID_UNTIL))
      if (!solid && fade <= 0) break
      for (let x = 0; x < columns; x += 1) {
        if (!solid) {
          if ((x + y) % 2 !== 0) continue
          if (noise(x, y) > fade) continue
        }
        context.fillStyle = !solid && noise(x + 101, y + 57) < ACCENT_SHARE ? accent : surface
        context.fillRect(x * cell, y * cell, cell, cell)
      }
    }
  }, [carry])

  useScrub(
    ref,
    'top_bottom',
    'top_top',
    (p) => {
      progress.current = p
      render()
    },
    true,
  )

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      size.current = { width: entry.contentRect.width, height: entry.contentRect.height }
      render()
    })
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [render])

  return <canvas ref={ref} className={`chequer ${className}`} aria-hidden="true" />
}

/* ---------- Corner brackets ---------- */
export const BRACKET_PATH = 'M0 0.5H10V10.5'
export function Brackets({ className = '' }: { className?: string }) {
  const corner = (pos: string, t: string) => (
    <svg className={`bracket bracket-${pos}`} viewBox="0 0 10.5 10.5" style={{ transform: t }} aria-hidden="true">
      <path d={BRACKET_PATH} fill="none" stroke="currentColor" />
    </svg>
  )
  return (
    <span className={`brackets ${className}`} aria-hidden="true">
      {corner('tr', '')}
      {corner('tl', 'scaleX(-1)')}
      {corner('bl', 'scale(-1)')}
      {corner('br', 'scaleY(-1)')}
    </span>
  )
}

/* ---------- Chamfered button ---------- */
export const ARROW_PATH = 'M0 5.35355H13M8 10.3536L13 5.35355L8 0.353553'
export function Arrow() {
  return (
    <svg className="cta-arrow" viewBox="0 0 13.7071 10.7071" aria-hidden="true">
      <path d={ARROW_PATH} fill="none" stroke="currentColor" />
    </svg>
  )
}

export function Chamfer({
  href,
  label,
  w,
  cut,
  variant,
  className = '',
  external,
  onClick,
}: {
  href: string
  label: string
  w: number
  cut: number
  variant: 'solid' | 'hollow'
  className?: string
  external?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  const path = `M0.5 0.5H${w - 0.5}V${50 - cut}L${w - cut} 49.5H0.5Z`
  return (
    <a
      href={href}
      className={`chamfer chamfer-${variant} ${className}`}
      style={{ '--cta-ratio': w / 50 } as React.CSSProperties}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={onClick}
    >
      <svg viewBox={`0 0 ${w} 50`} preserveAspectRatio="none" aria-hidden="true">
        <path className="chamfer-body" d={path} />
        <path className="chamfer-flood" d={path} />
        <path className="chamfer-ring" d={path} />
      </svg>
      <span className="chamfer-label">
        {label}
        <Arrow />
      </span>
    </a>
  )
}

/* ---------- Contour backdrop (marching squares over the hero's field) ---------- */
const LINE_SCALE = 3.8
const LINE_COUNT = 2.5
const WAVE_AMOUNT = 0.37
const WAVE_SPEED = 1.66
const LINE_OPACITY = 0.85
const CELLS = 96
const field = (x: number, y: number, t: number) => {
  let f = Math.sin(x * 1.0 + t * 0.6) * 0.5
  f += Math.sin(y * 0.85 - t * 0.45) * 0.45
  f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35
  f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25
  return f * 0.5 + 0.5
}

export function Contours({ token }: { token: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<(now: number) => void>(() => {})
  useEffect(() => {
    const canvas = ref.current!
    const context = canvas.getContext('2d')!
    const colour = readToken(token)
    const start = performance.now()
    let values = new Float32Array(0)
    const draw = (now: number) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio)
      if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio)
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const t = ((now - start) / 1000) * WAVE_SPEED
      const cols = width >= height ? CELLS : Math.max(8, Math.round((CELLS * width) / height))
      const rows = Math.max(8, Math.round((cols * height) / width))
      const stepX = width / cols
      const stepY = height / rows
      const aspect = width / height
      const size = (cols + 1) * (rows + 1)
      if (values.length !== size) values = new Float32Array(size)
      for (let j = 0; j <= rows; j += 1)
        for (let i = 0; i <= cols; i += 1) {
          const nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE
          const ny = ((j / rows) * 2 - 1) * LINE_SCALE
          const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE_AMOUNT
          const qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE_AMOUNT
          values[j * (cols + 1) + i] = field(qx, qy, t) * LINE_COUNT
        }
      context.strokeStyle = colour
      context.lineWidth = 1
      context.globalAlpha = LINE_OPACITY
      context.beginPath()
      const seg = (p: number[], q: number[]) => {
        context.moveTo(p[0], p[1])
        context.lineTo(q[0], q[1])
      }
      for (let level = 0.5; level < LINE_COUNT; level += 1)
        for (let j = 0; j < rows; j += 1)
          for (let i = 0; i < cols; i += 1) {
            const a = values[j * (cols + 1) + i]
            const b = values[j * (cols + 1) + i + 1]
            const c = values[(j + 1) * (cols + 1) + i + 1]
            const d = values[(j + 1) * (cols + 1) + i]
            const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0)
            if (index === 0 || index === 15) continue
            const x0 = i * stepX
            const y0 = j * stepY
            const top = [x0 + stepX * ((level - a) / (b - a)), y0]
            const right = [x0 + stepX, y0 + stepY * ((level - b) / (c - b))]
            const bottom = [x0 + stepX * ((level - d) / (c - d)), y0 + stepY]
            const left = [x0, y0 + stepY * ((level - a) / (d - a))]
            switch (index) {
              case 1: case 14: seg(left, bottom); break
              case 2: case 13: seg(bottom, right); break
              case 3: case 12: seg(left, right); break
              case 4: case 11: seg(top, right); break
              case 6: case 9: seg(top, bottom); break
              case 7: case 8: seg(left, top); break
              case 5: seg(left, top); seg(bottom, right); break
              case 10: seg(left, bottom); seg(top, right); break
            }
          }
      context.stroke()
      context.globalAlpha = 1
    }
    drawRef.current = draw
    draw(performance.now())
  }, [token])
  // The field drifts slowly: 30fps is indistinguishable here and halves the cost.
  useVisibleLoop(ref, (now) => drawRef.current(now), () => CAP_30, !reducedMotion)
  return <canvas ref={ref} className="contours" aria-hidden="true" />
}

/* ---------- Parallax layer: moves its content with a transform ---------- */
export function Parallax({
  travel,
  start = 'top_bottom',
  end = 'bottom_top',
  from,
  to,
  className = '',
  children,
}: {
  travel?: number
  start?: Parameters<typeof useScrub>[1]
  end?: Parameters<typeof useScrub>[2]
  from?: number
  to?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const a = from ?? travel ?? 0
  const b = to ?? -(travel ?? 0)
  useScrub(ref, start, end, (p) => {
    // A transform, not `top`: moving it never re-lays out the page.
    if (inner.current) inner.current.style.transform = `translate3d(0, ${(((a + (b - a) * p) / 1440) * 100).toFixed(4)}cqw, 0)`
  })
  return (
    <div ref={ref} className={`parallax ${className}`}>
      <div ref={inner} className="parallax-inner">
        {children}
      </div>
    </div>
  )
}
