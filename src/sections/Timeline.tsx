import { useEffect, useRef, useState } from 'react'
import { Rise, Split } from '../engine/Reveal'
import { COPY, Spring, YEAR, YEAR_SETTLE } from '../engine/spring'
import { useEnabled, useMedia, useScrub } from '../engine/hooks'
import { reducedMotion } from '../engine/ticker'
import { Chequer, Parallax } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import { type PlateMedia, type TimelineEntry } from '../data'
import { photo } from '../media'

export const px = (v: number) => `${((v / 1440) * 100).toFixed(4)}cqw`
const ROW_HEIGHT = { side: 217, centre: 462, scatter: 640 }
const PLATE_WIDTH = { side: 333, centre: 710, scatter: 560 }
const PARALLAX = { plate: { side: 60, centre: 20, scatter: 20 }, copy: 110 }
/** Where the France photos land around the copy, in design pixels, and how far each drifts. */
const SCATTER = [
  { left: 56, top: 40, width: 300, rot: -6, travel: 150 },
  { left: 1070, top: 410, width: 300, rot: 5, travel: -70 },
]
const MARK_RISE = 50

export const PLATE_OUTLINE =
  'M13.6168 0.497469H697.378C700.858 0.497469 704.195 1.38786 706.655 2.97277C709.115 4.55769 710.498 6.70729 710.498 8.94869V411.208C710.498 413.449 709.115 415.599 706.655 417.183C704.195 418.768 700.858 419.659 697.378 419.659H460.249C454.073 419.659 447.976 420.555 442.411 422.281C436.847 424.008 431.958 426.519 428.107 429.63L399.246 452.95C395.559 455.928 390.878 458.333 385.55 459.986C380.223 461.639 374.385 462.497 368.472 462.497H13.6168C10.1373 462.497 6.80038 461.607 4.34003 460.022C1.87968 458.437 0.497469 456.288 0.497469 454.046V8.94869C0.497469 6.70729 1.87968 4.55769 4.34003 2.97277C6.80038 1.38786 10.1373 0.497469 13.6168 0.497469Z'
export const PLATE_CLIP =
  'M 0.01915,0.00107H 0.98085C 0.98574,0.00107 0.99044,0.00300 0.99390,0.00642C 0.99736,0.00984 0.99930,0.01449 0.99930,0.01933V 0.88815C 0.99930,0.89299 0.99736,0.89763 0.99390,0.90105C 0.99044,0.90448 0.98574,0.90640 0.98085,0.90640H 0.64733C 0.63864,0.90640 0.63007,0.90834 0.62224,0.91206C 0.61442,0.91579 0.60754,0.92122 0.60212,0.92794L 0.56153,0.97830C 0.55635,0.98474 0.54976,0.98993 0.54227,0.99350C 0.53478,0.99707 0.52656,0.99892 0.51825,0.99892H 0.01915C 0.01426,0.99892 0.00956,0.99700 0.00610,0.99358C 0.00264,0.99016 0.00070,0.98551 0.00070,0.98067V 0.01933C 0.00070,0.01449 0.00264,0.00984 0.00610,0.00642C 0.00956,0.00300 0.01426,0.00107 0.01915,0.00107Z'

function PlateMediaView({ media }: { media: PlateMedia }) {
  if (media.kind === 'pixels') return <PixelIcon frames={media.frames} size="100%" off="rgb(255 255 255 / 0.07)" label={media.label} />
  const p = photo(media.name)
  if (media.kind === 'logo')
    return (
      <span className="tl-logo">
        <img src={p.small} width={p.w} height={p.h} alt={media.label} loading="lazy" decoding="async" />
      </span>
    )
  return (
    <img
      className="tl-photo"
      src={p.small}
      srcSet={p.srcSet}
      sizes="(max-width: 639px) 82vw, 50vw"
      width={p.w}
      height={p.h}
      alt={media.label}
      loading="lazy"
      decoding="async"
      style={{ objectPosition: media.focus ?? '50% 40%' }}
    />
  )
}

/** A stepped-corner plate holding a photograph, a logo or an LED screen. */
function Plate({ entry, column }: { entry: TimelineEntry; column: boolean }) {
  const slot = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  useScrub(slot, 'top_bottom', 'top_center', (p) => {
    // From top: -10% down to 0, as a transform (no relayout): 10p% of the slot is 10p/1.1% of the 110%-tall media.
    if (inner.current) inner.current.style.transform = `translate3d(0, ${((10 * p) / 1.1).toFixed(3)}%, 0)`
  }, false, !column && !reducedMotion)
  return (
    <div className="tl-plate">
      <div ref={slot} className="tl-plate-fill" style={{ clipPath: 'url(#plate-clip)' }}>
        <div ref={inner} className={`tl-plate-media tl-media-${entry.media.kind}`}>
          <PlateMediaView media={entry.media} />
        </div>
      </div>
      <svg className="tl-plate-outline" viewBox="0 0 710.995 462.995" preserveAspectRatio="none" aria-hidden="true">
        <path d={PLATE_OUTLINE} />
      </svg>
    </div>
  )
}

function Year({ text, centre, enabled, column }: { text: string; centre: boolean; enabled: boolean; column: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  // On phones the year is a label above its plate, not a backdrop behind it: it stays at full strength.
  useEffect(() => {
    if (column) {
      if (ref.current) ref.current.style.opacity = ''
      return
    }
    if (!enabled || !centre || reducedMotion) return
    const s = new Spring(1, YEAR_SETTLE, (v) => ref.current && (ref.current.style.opacity = String(v)))
    s.to(0.4, 2200)
    return () => s.stop()
  }, [enabled, centre, column])
  return (
    <span ref={ref} className="tl-year-inner">
      {column ? text : <Split text={text} by="letters" stagger={26} config={YEAR} enabled={enabled} />}
    </span>
  )
}

function Row({ entry, index, hovered, setHovered, column }: { entry: TimelineEntry; index: number; hovered: number | null; setHovered: (i: number | null) => void; column: boolean }) {
  const ref = useRef<HTMLLIElement>(null)
  const seen = useEnabled(ref, 'once', '0% 0% -25% 0%')
  const centre = entry.frame !== 'side'
  const travel = PARALLAX.plate[entry.frame]
  const side = centre ? 'centre' : entry.align === 'left' ? 'left' : 'right'
  const dim = hovered !== null && hovered !== index
  return (
    <li
      ref={ref}
      className={`tl-row tl-${entry.frame} tl-${side} tl-m-${entry.media.kind}${index % 2 ? ' tl-odd' : ''}`}
      style={{ height: column ? undefined : px(ROW_HEIGHT[entry.frame]), opacity: dim ? 0.3 : 1 }}
    >
      <Parallax travel={column ? 0 : travel} className="tl-layer tl-layer-plate">
        <div
          className="tl-plate-box"
          style={{ width: column ? undefined : px(PLATE_WIDTH[entry.frame]) }}
          onPointerEnter={() => window.matchMedia('(hover: hover)').matches && setHovered(index)}
          onPointerLeave={() => setHovered(null)}
        >
          <Plate entry={entry} column={column} />
        </div>
        <span className="tl-year">
          <Year text={entry.year} centre={centre} enabled={seen} column={column} />
        </span>
      </Parallax>
      {centre && entry.copy && (
        <Parallax travel={column ? 0 : PARALLAX.copy} className="tl-layer tl-layer-copy">
          <Rise
            as="p"
            className="tl-copy"
            enabled={seen}
            delay={220}
            config={COPY}
            style={{ '--copy-w': px(entry.copyWidth ?? 260) } as React.CSSProperties}
          >
            <strong>{entry.lead}</strong> {entry.copy}
            {entry.meta && <span className="tl-meta">{entry.meta}</span>}
          </Rise>
        </Parallax>
      )}
      {entry.scatter?.map((s, i) => {
        const spot = SCATTER[i % SCATTER.length]
        const p = photo(s.name)
        return (
          <Parallax key={s.name} travel={column ? 0 : spot.travel} className="tl-layer tl-layer-scatter">
            <figure
              className="tl-polaroid"
              style={{ left: px(spot.left), top: px(spot.top), width: px(spot.width), '--rot': `${spot.rot}deg` } as React.CSSProperties}
            >
              <img src={p.small} srcSet={p.srcSet} sizes="(max-width: 639px) 40vw, 21vw" width={p.w} height={p.h} alt={s.label} loading="lazy" decoding="async" />
            </figure>
          </Parallax>
        )
      })}
    </li>
  )
}

function Rail({ wrapRef, lastRef }: { wrapRef: React.RefObject<HTMLDivElement | null>; lastRef: React.RefObject<HTMLOListElement | null> }) {
  const ref = useRef<HTMLDivElement>(null)
  const thread = useRef<SVGRectElement>(null)
  const mark = useRef<SVGRectElement>(null)
  const [geo, setGeo] = useState({ w: 16, h: 1000, rest: 900, unit: 1, mark: 9 })
  const narrow = useMedia('(max-width: 1023px)')

  useEffect(() => {
    const measure = () => {
      const rail = ref.current, list = lastRef.current
      if (!rail || !list) return
      const r = rail.getBoundingClientRect()
      const last = list.lastElementChild as HTMLElement | null
      if (!last) return
      const unit = (wrapRef.current?.clientWidth ?? 1440) / 1440
      const l = last.getBoundingClientRect()
      const rest = l.top - r.top + l.height / 2 - MARK_RISE * unit
      setGeo({ w: r.width, h: r.height, rest, unit, mark: (narrow ? 20 : 9) * unit })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [wrapRef, lastRef, narrow])

  useScrub(
    ref,
    'top_center',
    'bottom_bottom',
    (p) => {
      const run = Math.max(0, p) * geo.rest
      thread.current?.setAttribute('height', String(run))
      mark.current?.setAttribute('transform', `translate(${geo.w / 2} ${run}) rotate(${(run / Math.max(1, geo.rest)) * 1800})`)
    },
    true,
  )

  const u = geo.unit
  return (
    <div ref={ref} className="tl-rail" aria-hidden="true">
      <svg viewBox={`0 0 ${geo.w} ${geo.h}`} preserveAspectRatio="none">
        <line x1={geo.w / 2} x2={geo.w / 2} y1={0} y2={98 * u} className="tl-rail-line" />
        <line x1={geo.w / 2} x2={geo.w / 2} y1={102 * u} y2={geo.rest} className="tl-rail-line" strokeDasharray={`${6 * u} ${6 * u}`} />
        <rect ref={thread} x={geo.w / 2 - 0.5} y={0} width={1} height={0} fill="var(--foreground-on-dark)" />
        <rect ref={mark} x={-geo.mark / 2} y={-geo.mark / 2} width={geo.mark} height={geo.mark} fill="var(--foreground-on-dark)" transform={`translate(${geo.w / 2} 0)`} />
      </svg>
    </div>
  )
}

export default function Timeline({ entries, heading }: { entries: TimelineEntry[]; heading: [string, string] }) {
  const wrap = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const column = useMedia('(max-width: 639px)')
  return (
    <section className="timeline" id="journey" aria-labelledby="journey-title">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <clipPath id="plate-clip" clipPathUnits="objectBoundingBox">
          <path d={PLATE_CLIP} />
        </clipPath>
      </svg>
      <Chequer carry="light" className="chequer-timeline" />
      <div ref={wrap} className="tl-wrap">
        {!column && <Rail wrapRef={wrap} lastRef={list} />}
        <h2 id="journey-title" className="tl-title">
          <Split text={heading[0]} delay={0} />
          <span className="title-last">
            <Split text={heading[1]} delay={130} />
            <Rise as="span" className="title-stop" delay={240} fadeOnly>
              .
            </Rise>
          </span>
        </h2>
        <ol ref={list} className="tl-rows">
          {entries.map((entry, i) => (
            <Row key={entry.year} entry={entry} index={i} hovered={hovered} setHovered={setHovered} column={column} />
          ))}
        </ol>
      </div>
    </section>
  )
}
