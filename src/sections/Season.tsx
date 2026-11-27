import { Arrow, Chequer } from '../components/Shared'
import { CERTS, ISSUERS, PROJECTS } from '../data'
import { logo } from '../media'
import { url } from '../router'
import { CIRCUIT_MARKERS, CIRCUIT_PATH, CIRCUIT_STEP, FLAG, TRACK_BOX, TRACK_D } from './circuit'

const TRACK_VIEW = `${TRACK_BOX.x} ${TRACK_BOX.y} ${TRACK_BOX.width} ${TRACK_BOX.height}`
const MARKS = [[36.7, 45.9], [1389.5, 45.9], [36.7, 525.5], [1389.5, 525.5], [36.7, 757], [649.3, 757], [778.1, 757]]

/** Use the original circuit geometry with a tighter crop on smaller screens. */
function Circuit() {
  const flagPosition = `translate(${FLAG.x} ${FLAG.y}) rotate(${FLAG.angle})`
  return (
    <div className="season-frame" style={{ '--track-ratio': `${TRACK_BOX.width} / ${TRACK_BOX.height}` } as React.CSSProperties} aria-hidden="true">
      <svg className="season-defs" width="0" height="0">
        <defs>
          <pattern id="circuit-dots" width="4.38" height="4.33" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r=".7" fill="var(--map-dot)" />
          </pattern>
          <radialGradient id="circuit-dot-fade">
            <stop offset="0" stopColor="white" stopOpacity=".55" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="circuit-dot-mask">
            <ellipse cx="940" cy="405" rx="670" ry="390" fill="url(#circuit-dot-fade)" />
          </mask>
          <mask id="flag-cut" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1640" height="1000">
            <rect x="-100" y="-100" width="1640" height="1000" fill="#fff" />
            <rect x="-10" y="-11" width="20" height="22" fill="#000" transform={flagPosition} />
          </mask>
          <g id="season-circuit">
            <rect width="1440" height="800" fill="url(#circuit-dots)" mask="url(#circuit-dot-mask)" />
            <g className="map-grid" strokeDasharray="6.83 4.69">
              {[575, 930, 1285].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="800" />)}
              <line x1="0" x2="1440" y1="405" y2="405" />
            </g>
            <circle cx="930" cy="405" r="39.25" className="map-ring" strokeWidth="1.7" />
            <circle cx="930" cy="405" r="200" className="map-ring-ghost" strokeWidth="1.2" />
            <circle cx="930" cy="405" r="248.7" className="map-ring-ghost" strokeWidth="1.2" />
            <circle cx="930" cy="405" r="6" fill="var(--map-mark)" />
            {MARKS.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="9.4" height="9.4" fill="var(--map-mark)" />)}
            <path d={TRACK_D} className="map-track" mask="url(#flag-cut)" />
            <g transform={flagPosition} fill="var(--map-mark)">
              <path d="M-5 -10h5v5h-5z M0 -5h5v5H0z M-5 0h5v5h-5z M0 5h5v5H0z" />
            </g>
            {CIRCUIT_MARKERS.map((marker, i) => {
              const before = CIRCUIT_PATH[Math.max(0, Math.round(marker.d / CIRCUIT_STEP) - 3)]
              const angle = Math.atan2(marker.y - before[1], marker.x - before[0]) * 180 / Math.PI
              return (
                <g key={CERTS[i].image}>
                  <polygon points="7.7,0 -3.85,6.67 -3.85,-6.67" transform={`translate(${marker.x} ${marker.y}) rotate(${angle})`} fill="var(--accent)" />
                  <text x={marker.x + marker.dx} y={marker.y + marker.dy} textAnchor={marker.anchor} dominantBaseline="middle" className="map-label">
                    {CERTS[i].date} · {CERTS[i].short}
                  </text>
                </g>
              )
            })}
          </g>
        </defs>
      </svg>
      <svg className="season-map season-map-wide" viewBox="0 0 1440 800" preserveAspectRatio="xMaxYMid slice"><use href="#season-circuit" /></svg>
      <svg className="season-map season-map-compact" viewBox={TRACK_VIEW}><use href="#season-circuit" /></svg>
    </div>
  )
}

export default function Season() {
  const rows = [
    { k: String(CERTS.length).padStart(2, '0'), v: 'certificates' },
    { k: String(PROJECTS.length).padStart(2, '0'), v: 'builds shipped' },
    { k: '3rd', v: 'at ai+x.' },
  ]
  return (
    <section className="season" id="season" tabIndex={-1} aria-labelledby="season-title">
      <Circuit />
      <Chequer carry="light" className="chequer-season" />
      <div className="season-column">
        <div className="season-head">
          <h2 id="season-title" className="season-title">
            <span className="split">the season</span>
            <span className="title-last">
              <span className="split">so far</span>
              <span className="title-stop">
                .
              </span>
            </span>
          </h2>
          <div className="season-rule" />
          <p className="split season-intro">Every build is a step forward. Here's how the record is shaping up.</p>
        </div>

        <div className="season-foot">
          <div className="results">
            <p className="results-title">{CERTS.length} certificates</p>
            <ul className="results-logos" aria-label="Issued by">
              {[...new Set(CERTS.map((c) => c.from))].map((key) => (
                <li key={key} className={`results-logo${ISSUERS[key].wide ? ' results-logo-wide' : ''}`}>
                  <img src={logo(ISSUERS[key].logo)} alt={ISSUERS[key].name} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
            <a className="results-more" href={url('/certificates')}>
              see them all
              <Arrow />
            </a>
          </div>

          <div className="plate">
            <svg className="plate-frame" viewBox="0 0 277 78" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0.5 0.5H276.5V69L268 77.5H0.5Z" />
              <line x1="83" y1="0.5" x2="83" y2="77.5" />
            </svg>
            <div className="plate-badge">
              <svg className="plate-globe" viewBox="0 0 37 23" aria-hidden="true">
                <ellipse cx="18.5" cy="11.5" rx="18" ry="11" />
                <ellipse cx="18.5" cy="11.5" rx="8" ry="11" />
                <line x1="0.5" y1="11.5" x2="36.5" y2="11.5" />
              </svg>
              <span className="plate-mark">
                <span className="split plate-white">CV</span>
                <span className="split plate-accent">/ 2026</span>
              </span>
            </div>
            <dl className="plate-stats">
              {rows.map((r) => (
                <div key={r.v}>
                  <dt className="split">{r.k}</dt>
                  <dd className="split">{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
