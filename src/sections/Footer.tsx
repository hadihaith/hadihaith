import { Rise, Split } from '../engine/Reveal'
import { ROW } from '../engine/spring'
import { Arrow, Chamfer, Contours, Parallax } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import { LINKS } from '../data'
import { backpack, swap } from '../pixels'
import { follow, url } from '../router'

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
        <Parallax from={60} to={0} start="top_bottom" end="bottom_bottom" className="ft-figure-layer">
          <div className="ft-device">
            <PixelIcon frames={[backpack, swap(backpack, 'p', 'a')]} size="100%" off="rgb(255 255 255 / 0.05)" interval={900} />
          </div>
        </Parallax>
      </div>

      <Rise className="ft-logo" delay={120} fadeOnly role="img" aria-label="Hadi Haidar">
        <span className="logo-mark">HH</span>
      </Rise>

      <h2 id="footer-title" className="ft-title">
        <Split text="keep" delay={0} />
        <span className="title-last">
          <Split text="building" delay={130} />
          <Rise as="span" className="title-stop" delay={240} fadeOnly>
            .
          </Rise>
        </span>
      </h2>

      <nav className="ft-nav" aria-label="Footer">
        <ul>
          {NAV.map((l, i) => (
            <li key={l.label}>
              <a
                href={l.href.startsWith('http') ? l.href : url(l.href)}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                onClick={(e) => follow(l.href, e)}
              >
                <Split text={l.label} by="letters" stagger={22} config={ROW} gap="0" delay={260 + i * 80} />
                <span className="ft-nav-arrow">
                  <Arrow />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Rise className="ft-copy" delay={640}>
        © 2026 Hadi Haidar. Built in Kuwait, deployed by GitHub Actions.
      </Rise>
      <Rise className="ft-cta-wrap" delay={720}>
        <Chamfer href={LINKS.github} label="github profile" w={275} cut={8.835} variant="hollow" className="ft-cta" external />
      </Rise>
      <Rise as="ul" className="ft-socials" delay={800}>
        <li className="ft-email"><a href={`mailto:${LINKS.email}`}>{LINKS.email}</a></li>
        <li>
          <a href={LINKS.github} target="_blank" rel="noreferrer">github</a>
        </li>
        <li>
          <a href={url('/gallery')} onClick={(e) => follow('/gallery', e)}>gallery</a>
        </li>
        <li>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0 })
            }}
          >
            top
          </a>
        </li>
      </Rise>
    </section>
  )
}
