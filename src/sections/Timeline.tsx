import { Chequer, Layer } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import { type PlateMedia, type TimelineEntry } from '../data'
import { photo } from '../media'

export const px = (v: number) => `${((v / 1440) * 100).toFixed(4)}cqw`
const ROW_HEIGHT = { side: 217, centre: 462, scatter: 640 }
const PLATE_WIDTH = { side: 333, centre: 710, scatter: 560 }
/** Where the France photos land around the copy, in design pixels,. */
const SCATTER = [
  { left: 56, top: 40, width: 300, rot: -6 },
  { left: 1070, top: 410, width: 300, rot: 5 },
]

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
function Plate({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="tl-plate">
      <div className="tl-plate-fill" style={{ clipPath: 'url(#plate-clip)' }}>
        <div className={`tl-plate-media tl-media-${entry.media.kind}`}>
          <PlateMediaView media={entry.media} />
        </div>
      </div>
      <svg className="tl-plate-outline" viewBox="0 0 710.995 462.995" preserveAspectRatio="none" aria-hidden="true">
        <path d={PLATE_OUTLINE} />
      </svg>
    </div>
  )
}

function Row({ entry, index }: { entry: TimelineEntry; index: number }) {
  const centre = entry.frame !== 'side'
  const side = centre ? 'centre' : entry.align === 'left' ? 'left' : 'right'
  return (
    <li
      className={`tl-row tl-${entry.frame} tl-${side} tl-m-${entry.media.kind}${index % 2 ? ' tl-odd' : ''}`}
      style={{ '--row-height': px(ROW_HEIGHT[entry.frame]), '--plate-width': px(PLATE_WIDTH[entry.frame]) } as React.CSSProperties}
    >
      <Layer className="tl-layer tl-layer-plate">
        <div className="tl-plate-box"><Plate entry={entry} /></div>
        <span className="tl-year">{entry.year}</span>
      </Layer>
      {centre && entry.copy && (
        <Layer className="tl-layer tl-layer-copy">
          <p className="tl-copy" style={{ '--copy-w': px(entry.copyWidth ?? 260) } as React.CSSProperties}>
            <strong>{entry.lead}</strong> {entry.copy}
            {entry.meta && <span className="tl-meta">{entry.meta}</span>}
          </p>
        </Layer>
      )}
      {entry.scatter?.map((s, i) => {
        const spot = SCATTER[i % SCATTER.length]
        const p = photo(s.name)
        return (
          <Layer key={s.name} className="tl-layer tl-layer-scatter">
            <figure
              className="tl-polaroid"
              style={{ left: px(spot.left), top: px(spot.top), width: px(spot.width), '--rot': `${spot.rot}deg` } as React.CSSProperties}
            >
              <img src={p.small} srcSet={p.srcSet} sizes="(max-width: 639px) 40vw, 21vw" width={p.w} height={p.h} alt={s.label} loading="lazy" decoding="async" />
            </figure>
          </Layer>
        )
      })}
    </li>
  )
}

export default function Timeline({ entries, heading }: { entries: TimelineEntry[]; heading: [string, string] }) {
  return (
    <section className="timeline" id="journey" aria-labelledby="journey-title">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <clipPath id="plate-clip" clipPathUnits="objectBoundingBox">
          <path d={PLATE_CLIP} />
        </clipPath>
      </svg>
      <Chequer carry="light" className="chequer-timeline" />
      <div className="tl-wrap">
        <div className="tl-rail" aria-hidden="true" />
        <h2 id="journey-title" className="tl-title">
          <span className="split">{heading[0]}</span>
          <span className="title-last">
            <span className="split">{heading[1]}</span>
            <span className="title-stop">
              .
            </span>
          </span>
        </h2>
        <ol className="tl-rows">
          {entries.map((entry, i) => (
            <Row key={entry.year} entry={entry} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
