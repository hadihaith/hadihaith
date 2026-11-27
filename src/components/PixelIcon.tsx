import { useId } from 'react'
import { LED } from '../pixels'

type Props = {
  frames: string[][]
  size?: string
  off?: string
  className?: string
  label?: string
}

const cache = new WeakMap<string[], { colour: string; d: string }[]>()

function paths(frame: string[]) {
  const cached = cache.get(frame)
  if (cached) return cached
  const groups = new Map<string, string>()
  frame.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const colour = LED[row[x]]
      if (!colour) continue
      const circle = `M${x}.14 ${y}.5a.36 .36 0 1 0 .72 0a.36 .36 0 1 0 -.72 0`
      groups.set(colour, (groups.get(colour) ?? '') + circle)
    }
  })
  const result = [...groups].map(([colour, d]) => ({ colour, d }))
  cache.set(frame, result)
  return result
}

/** The first pixel-art frame is complete HTML and needs no animation timer. */
export default function PixelIcon({ frames, size = '4rem', off = 'rgb(255 255 255 / 0.08)', className, label }: Props) {
  const id = useId()
  const picture = frames[0]
  const n = picture.length
  return (
    <svg
      className={className}
      style={{ width: size, height: size, display: 'block' }}
      viewBox={`-0.5 -0.5 ${n + 1} ${n + 1}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <pattern id={id} width="1" height="1" patternUnits="userSpaceOnUse">
          <circle cx=".5" cy=".5" r=".36" fill={off} />
        </pattern>
      </defs>
      <rect width={n} height={n} fill={`url(#${id})`} />
      {paths(picture).map(({ colour, d }) => <path key={colour} d={d} fill={colour} />)}
    </svg>
  )
}
