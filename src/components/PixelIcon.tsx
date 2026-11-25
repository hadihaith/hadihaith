import { useEffect, useMemo, useRef, useState } from 'react'
import { LED } from '../pixels'
import { reducedMotion } from '../engine/ticker'

type Props = {
  frames: string[][]
  /** Rendered size in any CSS length; the SVG is square. */
  size?: string
  interval?: number
  playing?: boolean
  /** Colour of unlit LEDs. */
  off?: string
  /** Draw a backing plate behind the grid. */
  plate?: string
  className?: string
  label?: string
}

const R = 0.36
/** Every LED of one colour as a single path of circles: a handful of nodes instead of 144. */
const dots = (cells: [number, number][]) =>
  cells.map(([x, y]) => `M${x + 0.5 - R} ${y + 0.5}a${R} ${R} 0 1 0 ${R * 2} 0a${R} ${R} 0 1 0 ${-R * 2} 0`).join('')

const cache = new WeakMap<string[], { colour: string; d: string }[]>()
const paths = (frame: string[]) => {
  let hit = cache.get(frame)
  if (hit) return hit
  const groups = new Map<string, [number, number][]>()
  frame.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const key = ch === '.' ? '.' : ch
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push([x, y])
    }),
  )
  hit = [...groups].map(([ch, cells]) => ({ colour: ch, d: dots(cells) }))
  cache.set(frame, hit)
  return hit
}

/**
 * A small LED screen that flips between pixel-art frames. Frames only flip
 * while the screen is on screen and the tab is visible.
 */
export default function PixelIcon({
  frames,
  size = '4rem',
  interval = 520,
  playing = true,
  off = 'rgb(255 255 255 / 0.08)',
  plate,
  className,
  label,
}: Props) {
  const ref = useRef<SVGSVGElement>(null)
  const [i, setI] = useState(0)
  const [visible, setVisible] = useState(false)
  const animate = playing && visible && !reducedMotion && frames.length > 1

  useEffect(() => {
    const el = ref.current
    if (!el || frames.length < 2) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [frames.length])

  useEffect(() => {
    if (!animate) return
    let id = 0
    const start = () => (id = window.setInterval(() => setI((n) => (n + 1) % frames.length), interval))
    const onVis = () => {
      clearInterval(id)
      if (!document.hidden) start()
    }
    start()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [animate, frames.length, interval])

  const f = frames[i] ?? frames[0]
  const n = f.length
  const layers = useMemo(() => paths(f), [f])
  return (
    <svg
      ref={ref}
      className={className}
      style={{ width: size, height: size, display: 'block' }}
      viewBox={`-0.5 -0.5 ${n + 1} ${n + 1}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {plate && <rect x={-0.5} y={-0.5} width={n + 1} height={n + 1} rx={1.2} fill={plate} />}
      {layers.map(({ colour, d }) => (
        <path key={colour} d={d} fill={colour === '.' ? off : LED[colour] ?? off} />
      ))}
    </svg>
  )
}
