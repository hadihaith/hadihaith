import { Children, useEffect, useRef, useState } from 'react'

const idle = (cb: () => void) =>
  typeof requestIdleCallback === 'function' ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 200)

/**
 * Renders its children on the first idle moment after the first screen, with
 * a same-coloured placeholder until then: the hero's first render only builds
 * what is on screen.
 */
export function Deferred({ children, placeholder }: { children: React.ReactNode; placeholder: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => void idle(() => setReady(true)), [])
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
    }))
    const phone = window.matchMedia('(max-width: 639px)')
    let raf = 0
    const apply = () => {
      raf = 0
      const view = window.innerHeight || 1
      const shrink = phone.matches ? 0 : 1 - RECEDE_SCALE
      for (const { layer, inner, shade, next } of pinned) {
        // A layer taller than the screen pins by its foot, not its head, so
        // all of it scrolls past before the next one comes over it.
        const top = `${Math.min(0, view - inner.offsetHeight)}px`
        if (layer.style.top !== top) layer.style.top = top
        const p = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / view))
        inner.style.transform = p > 0 && shrink > 0 ? `scale(${1 - shrink * p})` : ''
        inner.style.willChange = p > 0 && shrink > 0 ? 'transform' : ''
        shade.style.opacity = `${RECEDE_SHADE * p}`
        inner.style.visibility = p >= 1 ? 'hidden' : 'visible'
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    apply()
    const ro = new ResizeObserver(onScroll)
    pinned.forEach(({ inner }) => ro.observe(inner))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
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
