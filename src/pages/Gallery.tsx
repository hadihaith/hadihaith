import { useCallback, useState } from 'react'
import PageHead from '../components/PageHead'
import Footer from '../sections/Footer'
import { Chequer } from '../components/Shared'
import Viewer from '../components/Viewer'
import { GALLERY, type GalleryCard } from '../data'
import { photo } from '../media'

const CARD_SIZES = '(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 46vw, 24vw'
const FEATURE_SIZES = [
  '(max-width: 639px) calc(62vw - 30px), (max-width: 1023px) 58vw, 30vw',
  '(max-width: 639px) calc(38vw - 19px), (max-width: 1023px) 36vw, 18vw',
]

function Card({ card, onOpen }: { card: GalleryCard; onOpen: (start: number) => void }) {
  const shown = card.feature ? card.photos.slice(0, 3) : card.photos.slice(0, 1)
  return (
    <li className={`g-card${card.feature ? ' g-feature' : ''}`}>
      <button type="button" className="g-open" onClick={() => onOpen(0)} aria-label={`Open photos with ${card.title}`}>
        <span className="g-media">
          {shown.map((ph, k) => {
            const p = photo(ph.name)
            return (
              <span key={ph.name} className={`g-shot g-shot-${k}`}>
                <img
                  src={p.small}
                  srcSet={p.srcSet}
                  sizes={card.feature ? FEATURE_SIZES[k === 0 ? 0 : 1] : CARD_SIZES}
                  width={p.w}
                  height={p.h}
                  alt={ph.caption}
                  loading="lazy"
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
    </li>
  )
}

/** Meetings worth keeping: one card per person, every photo of them inside it. */
export default function Gallery() {
  const [open, setOpen] = useState<{ card: GalleryCard; start: number } | null>(null)
  const close = useCallback(() => setOpen(null), [])
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
            <span className="split">conversations</span>
            <span className="title-last">
              <span className="split">worth keeping</span>
              <span className="title-stop">
                .
              </span>
            </span>
          </h2>
          <ul className="g-grid">
            {GALLERY.map((card) => (
              <Card key={card.id} card={card} onOpen={(start) => setOpen({ card, start })} />
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
