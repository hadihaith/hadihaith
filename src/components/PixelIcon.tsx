import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { LED } from '../data'

type Props = {
  frames: string[][]
  size?: number
  color?: string // used for the 'c' key
  off?: boolean // render every pixel unlit (locked state)
  interval?: number
  playing?: boolean
}

/** A small LED screen that flips between pixel-art frames. */
export default function PixelIcon({ frames, size = 64, color, off, interval = 520, playing = true }: Props) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const animate = playing && !reduce && frames.length > 1

  useEffect(() => {
    if (!animate) return setI(0)
    const id = setInterval(() => setI((n) => (n + 1) % frames.length), interval)
    return () => clearInterval(id)
  }, [animate, frames.length, interval])

  const f = frames[i]
  const n = f.length
  return (
    <svg className="pixel-icon" width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} aria-hidden="true">
      <rect x={-1} y={-1} width={n + 2} height={n + 2} rx={1.6} className="pixel-icon-bg" />
      {f.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = ch === '.' ? undefined : ch === 'c' ? color : LED[ch]
          return (
            <circle
              key={`${x}-${y}`}
              cx={x + 0.5}
              cy={y + 0.5}
              r={0.38}
              fill={fill && !off ? fill : 'var(--led-off)'}
              opacity={fill && off ? 0.9 : 1}
            />
          )
        }),
      )}
    </svg>
  )
}
