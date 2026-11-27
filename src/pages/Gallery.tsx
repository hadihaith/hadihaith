import { useCallback, useEffect, useState } from 'react'
import PageHead from '../components/PageHead'
import Footer from '../sections/Footer'
import { Chequer } from '../components/Shared'
import Viewer from '../components/Viewer'
import { Rise, Split } from '../engine/Reveal'
import { GALLERY, type GalleryCard } from '../data'
import { photo } from '../media'
import { landed } from '../router'

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
      {open && (
        <Viewer
          title={open.card.title}
          subtitle={open.card.who}
          slides={open.card.photos.map((ph) => {
            const p = photo(ph.name)
            return { key: ph.name, src: p.large, w: p.w, h: p.h, alt: ph.caption, caption: ph.caption }
          })}
          start={open.start}
          onClose={close}
        />
      )}
    </>
  )
}
