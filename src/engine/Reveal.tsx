import { createElement, useEffect, useRef } from 'react'
import { REVEAL, Spring, type SpringConfig } from './spring'
import { useEnabled, type Mode } from './hooks'
import { reducedMotion } from './ticker'

/**
 * The text engine: a string split into words or letters, each unit its own
 * spring from {opacity 0, y .35em|.3em} to {1, 0}. Unit i starts at
 * delay + i * stagger. A visually hidden copy carries the plain text.
 */
type SplitProps = {
  text: string
  by?: 'words' | 'letters'
  stagger?: number
  delay?: number
  config?: SpringConfig
  mode?: Mode
  /** When given, overrides the in-view gate (used by the hero's entrance). */
  enabled?: boolean
  gap?: string
  className?: string
  as?: string
  style?: React.CSSProperties
}

export function Split({
  text,
  by = 'words',
  stagger = 110,
  delay = 0,
  config = REVEAL,
  mode = 'forward',
  enabled,
  gap,
  className,
  as = 'span',
  style,
}: SplitProps) {
  const ref = useRef<HTMLElement>(null)
  const units = by === 'words' ? text.split(' ') : [...text]
  const spans = useRef<(HTMLSpanElement | null)[]>([])
  const springs = useRef<Spring[]>([])
  const seen = useEnabled(ref, mode, '0px', reducedMotion || enabled !== undefined)
  const on = enabled ?? seen
  const rise = by === 'words' ? 0.35 : 0.3

  useEffect(() => {
    springs.current = units.map(
      (_, i) =>
        new Spring(0, config, (v) => {
          const el = spans.current[i]
          if (!el) return
          el.style.opacity = String(v)
          el.style.transform = `translateY(${((1 - v) * rise).toFixed(4)}em)`
        }),
    )
    if (reducedMotion) springs.current.forEach((s) => s.set(1))
    return () => springs.current.forEach((s) => s.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, by])

  useEffect(() => {
    if (reducedMotion) return
    springs.current.forEach((s, i) => (on ? s.to(1, delay + i * stagger) : s.to(0)))
  }, [on, delay, stagger, text])

  return createElement(
    as,
    {
      ref,
      className: `split ${className ?? ''}`,
      style: { columnGap: gap ?? (by === 'words' ? '0.3em' : 0), ...style },
    },
    <span className="sr-only">{text}</span>,
    units.map((u, i) => (
      <span
        key={i}
        aria-hidden="true"
        ref={(el) => {
          spans.current[i] = el
        }}
        className="split-unit"
        style={{ opacity: reducedMotion ? 1 : 0 }}
      >
        {by === 'letters' && u === ' ' ? ' ' : u}
      </span>
    )),
  )
}

/** A block that rises {opacity 0, translateY(y)} → {1, 0}. */
type RiseProps = {
  children?: React.ReactNode
  delay?: number
  config?: SpringConfig
  y?: string
  mode?: Mode
  enabled?: boolean
  className?: string
  as?: string
  style?: React.CSSProperties
  /** Animate scaleX from the left instead of rising. */
  draw?: boolean
  fadeOnly?: boolean
  [key: string]: unknown
}

export function Rise({
  children,
  delay = 0,
  config = REVEAL,
  y = '0.75rem',
  mode = 'forward',
  enabled,
  className,
  as = 'div',
  style,
  draw,
  fadeOnly,
  ...rest
}: RiseProps) {
  const ref = useRef<HTMLElement>(null)
  const seen = useEnabled(ref, mode, '0px', reducedMotion || enabled !== undefined)
  const on = enabled ?? seen
  const spring = useRef<Spring | null>(null)

  useEffect(() => {
    const paint = (v: number) => {
      const el = ref.current
      if (!el) return
      el.style.opacity = String(v)
      if (draw) el.style.transform = `scaleX(${v})`
      else if (!fadeOnly) el.style.transform = v >= 1 ? '' : `translateY(calc(${y} * ${(1 - v).toFixed(4)}))`
    }
    spring.current = new Spring(reducedMotion ? 1 : 0, config, paint)
    paint(reducedMotion ? 1 : 0)
    return () => spring.current?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    if (on) spring.current?.to(1, delay)
    else spring.current?.to(0)
  }, [on, delay])

  return createElement(as, { ref, className, style, ...rest }, children)
}
