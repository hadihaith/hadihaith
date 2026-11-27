import { Arrow, Chamfer, Contours, Layer } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import { LINKS } from '../data'
import { backpack } from '../pixels'
import { url } from '../router'

const NAV = [
  { label: 'home', href: '/' },
  { label: 'projects', href: '#workshop' },
  { label: 'journey', href: '/journey' },
  { label: 'certificates', href: '/certificates' },
  { label: 'gallery', href: '/gallery' },
  { label: 'github', href: LINKS.github },
]

export default function Footer() {
  return (
    <section className="footer" id="contact" aria-labelledby="footer-title">
      <div className="ft-panel">
        <Contours token="--footer-contour" />
      </div>

      <div className="ft-figure" aria-hidden="true">
        <Layer className="ft-figure-layer">
          <div className="ft-device">
            <PixelIcon frames={[backpack]} size="100%" off="rgb(255 255 255 / 0.05)" />
          </div>
        </Layer>
      </div>

      <div className="ft-logo" role="img" aria-label="Hadi Haidar">
        <span className="logo-mark">HH</span>
      </div>

      <h2 id="footer-title" className="ft-title">
        <span className="split">keep</span>
        <span className="title-last">
          <span className="split">building</span>
          <span className="title-stop">
            .
          </span>
        </span>
      </h2>

      <nav className="ft-nav" aria-label="Footer">
        <ul>
          {NAV.map((l) => (
            <li key={l.label}>
              <a
                href={l.href.startsWith('http') ? l.href : url(l.href)}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                <span className="split">{l.label}</span>
                <span className="ft-nav-arrow">
                  <Arrow />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ft-copy">
        © 2026 Hadi Haidar. Built in Kuwait, deployed by GitHub Actions.
      </div>
      <div className="ft-cta-wrap">
        <Chamfer href={LINKS.github} label="github profile" w={275} cut={8.835} variant="hollow" className="ft-cta" external />
      </div>
      <ul className="ft-socials">
        <li className="ft-email"><a href={`mailto:${LINKS.email}`}>{LINKS.email}</a></li>
        <li>
          <a href={LINKS.github} target="_blank" rel="noreferrer">github</a>
        </li>
        <li>
          <a href={url('/gallery')}>gallery</a>
        </li>
        <li>
          <a href="#top">top</a>
        </li>
      </ul>
    </section>
  )
}
