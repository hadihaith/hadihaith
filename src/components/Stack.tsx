import { Children, useEffect, useRef, useState } from 'react'
import { onScrollFrame } from '../engine/ticker'

/**
 * Renders its children on the first idle moment after the first screen, with
 * a same-coloured placeholder until then: the hero's first render only builds
 * what is on screen.
 */
export function Deferred({ children, placeholder }: { children: React.ReactNode; placeholder: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const show = () => setReady(true)
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(show, { timeout: 500 })
      return () => cancelIdleCallback(id)
    }
    const id = window.setTimeout(show, 100)
    return () => clearTimeout(id)
  }, [])
  return ready ? <>{children}</> : <div className={placeholder} aria-hidden="true" />
}

const RECEDE_SCALE = 0.9
const RECEDE_SHADE = 0.55

/**
 * The sticky stack: each layer pins and the next comes out over it, the
 * covered one scaling to 0.9 and darkening to 55% black. The last layer is
 * relative and is never covered.
 */
export function Stack({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const layers = Children.toArray(children)

  useEffect(() => {
    const el = root.current!
    const items = [...el.querySelectorAll<HTMLElement>(':scope > .stack-layer')]
    const pinned = items.slice(0, -1).map((layer, i) => ({
      layer,
      inner: layer.querySelector<HTMLElement>(':scope > .stack-inner')!,
      shade: layer.querySelector<HTMLElement>(':scope > .stack-shade')!,
      next: items[i + 1],
      height: 0,
      top: '',
      p: -1,
    }))
    const phone = window.matchMedia('(max-width: 639px)')
    // Every scroll frame: read all the positions first, then write only what
    // changed, so the browser lays the page out at most once per frame.
    const apply = () => {
      const view = window.innerHeight || 1
      const shrink = phone.matches ? 0 : 1 - RECEDE_SCALE
      const progress = pinned.map(({ next }) => Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / view)))
      pinned.forEach((item, i) => {
        // A layer taller than the screen pins by its foot, not its head, so
        // all of it scrolls past before the next one comes over it.
        const top = `${Math.min(0, view - item.height)}px`
        if (item.top !== top) item.layer.style.top = item.top = top
        const p = progress[i]
        if (p === item.p) return
        item.inner.style.transform = p > 0 && p < 1 && shrink > 0 ? `scale(${1 - shrink * p})` : ''
        item.shade.style.opacity = `${RECEDE_SHADE * p}`
        if (p >= 1 !== item.p >= 1 || item.p < 0) {
          item.inner.style.visibility = p >= 1 ? 'hidden' : 'visible'
          item.inner.inert = p >= 1
        }
        item.p = p
      })
    }
    const ro = new ResizeObserver(() => {
      for (const item of pinned) {
        item.height = item.inner.offsetHeight
        item.p = -1 // a resize can change the scale (the phone breakpoint) at the same progress
      }
      apply()
    })
    pinned.forEach(({ inner }) => ro.observe(inner))
    const off = onScrollFrame(apply)
    return () => {
      ro.disconnect()
      off()
    }
  }, [])

  return (
    <div ref={root} className="stack">
      {layers.map((child, i) =>
        i < layers.length - 1 ? (
          <div key={i} className="stack-layer" style={{ zIndex: i * 10 }}>
            <div className="stack-inner">{child}</div>
            <div className="stack-shade" aria-hidden="true" />
          </div>
        ) : (
          <div key={i} className="stack-layer stack-last">
            {child}
          </div>
        ),
      )}
    </div>
  )
}
