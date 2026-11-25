import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PageHead from '../components/PageHead'
import Footer from '../sections/Footer'
import { Arrow, Chequer } from '../components/Shared'
import { Rise, Split } from '../engine/Reveal'
import { SHEET, Spring } from '../engine/spring'
import { lenis } from '../engine/ticker'
import { GALLERY, type GalleryCard } from '../data'
import { photo } from '../media'
import { landed } from '../router'

/** The full view: one card's photos, large, with arrows, keys and position dots. */
function Viewer({ card, start, onClose }: { card: GalleryCard; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const n = card.photos.length
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
      const p = photo(card.photos[(i + d + n) % n].name)
      const img = new Image()
      img.src = p.large
    }
  }, [i, card, n])

  const current = card.photos[i]
  const p = photo(current.name)
  return createPortal(
    <div ref={root} className="viewer" role="dialog" aria-modal="true" aria-label={`Photos with ${card.title}`} style={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="viewer-top">
        <p className="viewer-title">
          {card.title}
          <span>{card.who}</span>
        </p>
        <button ref={closeBtn} type="button" className="sheet-close viewer-close" aria-label="Close" onClick={onClose}>
          <span />
          <span />
        </button>
      </div>
      <figure className="viewer-figure">
        <img key={current.name} src={p.large} width={p.w} height={p.h} alt={current.caption} decoding="async" />
        <figcaption>
          <span>{current.caption}</span>
          {n > 1 && (
            <span className="viewer-dots" aria-hidden="true">
              {card.photos.map((ph, k) => (
                <span key={ph.name} className={k === i ? 'is-on' : undefined} />
              ))}
            </span>
          )}
        </figcaption>
      </figure>
      {n > 1 && (
        <>
          <button type="button" className="viewer-step viewer-prev" aria-label="Previous photo" onClick={() => step(-1)}>
            <Arrow />
          </button>
          <button type="button" className="viewer-step viewer-next" aria-label="Next photo" onClick={() => step(1)}>
            <Arrow />
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}

function Card({ card, index, onOpen }: { card: GalleryCard; index: number; onOpen: (start: number) => void }) {
  const shown = card.feature ? card.photos.slice(0, 3) : card.photos.slice(0, 1)
  return (
    <Rise as="li" className={`g-card${card.feature ? ' g-feature' : ''}`} delay={index * 90}>
      <button type="button" className="g-open" onClick={() => onOpen(0)} aria-label={`Open photos with ${card.title}`}>
        <span className="g-media">
          {shown.map((ph, k) => {
            const p = photo(ph.name)
            return (
              <span key={ph.name} className={`g-shot g-shot-${k}`}>
                <img
                  src={p.small}
                  srcSet={p.srcSet}
                  sizes={card.feature && k === 0 ? '(max-width: 639px) 92vw, 45vw' : '(max-width: 639px) 92vw, 24vw'}
                  width={p.w}
                  height={p.h}
                  alt={ph.caption}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </span>
            )
          })}
        </span>
      </button>
      <div className="g-text">
        <h3 className="g-title">{card.title}</h3>
        <p className="g-who">{card.who}</p>
        <p className="g-meta">{card.dates}</p>
      </div>
    </Rise>
  )
}

/** Meetings worth keeping: one card per person, every photo of them inside it. */
export default function Gallery() {
  const [open, setOpen] = useState<{ card: GalleryCard; start: number } | null>(null)
  const close = useCallback(() => setOpen(null), [])
  useEffect(() => {
    document.title = 'Gallery · Hadi Haidar'
    landed()
  }, [])
  return (
    <>
      <PageHead
        title={['good', 'company']}
        intro="Ambassadors, embassy evenings and leaders in tech, and what we talked about. Open a card to see the moment."
      />
      <section className="gallery" aria-labelledby="gallery-title">
        <Chequer carry="light" className="chequer-gallery" />
        <div className="gallery-inner">
          <h2 id="gallery-title" className="gallery-title">
            <Split text="conversations" delay={0} />
            <span className="title-last">
              <Split text="worth keeping" delay={130} />
              <Rise as="span" className="title-stop" delay={240} fadeOnly>
                .
              </Rise>
            </span>
          </h2>
          <ul className="g-grid">
            {GALLERY.map((card, i) => (
              <Card key={card.id} card={card} index={i} onOpen={(start) => setOpen({ card, start })} />
            ))}
          </ul>
        </div>
      </section>
      <Footer />
      {open && <Viewer card={open.card} start={open.start} onClose={close} />}
    </>
  )
}
