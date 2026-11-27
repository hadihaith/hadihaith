import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Arrow } from './Shared'
import { SHEET, Spring } from '../engine/spring'
import { lenis } from '../engine/ticker'

export type Slide = {
  key: string
  src: string
  alt: string
  caption: string
  w?: number
  h?: number
  /** A link shown beside the caption, opening in a new tab. */
  link?: { href: string; label: string }
}

/** The full view: slides shown large, with arrows, keys and position dots. */
export default function Viewer({
  title,
  subtitle,
  slides,
  start,
  onClose,
}: {
  title: string
  subtitle?: string
  slides: Slide[]
  start: number
  onClose: () => void
}) {
  const [i, setI] = useState(start)
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const n = slides.length
  const step = useCallback((d: number) => setI((v) => (v + d + n) % n), [n])

  useEffect(() => {
    const el = root.current!
    const s = new Spring(0, SHEET, (v) => (el.style.opacity = String(v)))
    s.to(1)
    const before = document.activeElement as HTMLElement | null
    lenis?.stop()
    document.documentElement.classList.add('locked')
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      s.stop()
      lenis?.start()
      document.documentElement.classList.remove('locked')
      window.removeEventListener('keydown', onKey)
      before?.focus()
    }
  }, [onClose, step])

  // Warm the neighbours so stepping through is instant.
  useEffect(() => {
    for (const d of [1, -1]) {
      const img = new Image()
      img.src = slides[(i + d + n) % n].src
    }
  }, [i, slides, n])

  const current = slides[i]
  return createPortal(
    <div ref={root} className="viewer" role="dialog" aria-modal="true" aria-label={title} style={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="viewer-top">
        <p className="viewer-title">
          {title}
          {subtitle && <span>{subtitle}</span>}
        </p>
        <button ref={closeBtn} type="button" className="sheet-close viewer-close" aria-label="Close" onClick={onClose}>
          <span />
          <span />
        </button>
      </div>
      <figure className="viewer-figure">
        <img key={current.key} src={current.src} width={current.w} height={current.h} alt={current.alt} decoding="async" />
        <figcaption>
          <span>{current.caption}</span>
          {current.link && (
            <a className="viewer-link" href={current.link.href} target="_blank" rel="noreferrer">
              {current.link.label}
              <Arrow />
            </a>
          )}
          {n > 1 && (
            <span className="viewer-dots" aria-hidden="true">
              {slides.map((s, k) => (
                <span key={s.key} className={k === i ? 'is-on' : undefined} />
              ))}
            </span>
          )}
        </figcaption>
      </figure>
      {n > 1 && (
        <>
          <button type="button" className="viewer-step viewer-prev" aria-label="Previous" onClick={() => step(-1)}>
            <Arrow />
          </button>
          <button type="button" className="viewer-step viewer-next" aria-label="Next" onClick={() => step(1)}>
            <Arrow />
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}
