import { useCallback, useState } from 'react'
import PageHead from '../components/PageHead'
import Footer from '../sections/Footer'
import { Arrow, Chequer } from '../components/Shared'
import Viewer, { type Slide } from '../components/Viewer'
import { CERTS, ISSUERS, type Cert, type Issuer } from '../data'
import { certImage, logo } from '../media'

/** Issuers in the order they first appear, with how many certificates each gave. */
const issuers = CERTS.reduce<{ key: Issuer; count: number }[]>((list, c) => {
  const hit = list.find((i) => i.key === c.from)
  if (hit) hit.count += 1
  else list.push({ key: c.from, count: 1 })
  return list
}, [])

const slides: Slide[] = CERTS.map((c) => ({
  key: c.image,
  src: certImage(c.image),
  alt: `${c.title} certificate`,
  caption: `${c.title} · ${c.date}`,
  link: { href: c.href, label: 'verify' },
}))

const firstYear = `20${CERTS[0].date.slice(-2)}`

function Logo({ from, className }: { from: Issuer; className: string }) {
  return (
    <span className={`${className}${ISSUERS[from].wide ? ' ct-logo-wide' : ''}`}>
      <img src={logo(ISSUERS[from].logo)} alt={`${ISSUERS[from].name} logo`} loading="lazy" decoding="async" />
    </span>
  )
}

function CertCard({ cert, index, onView }: { cert: Cert; index: number; onView: () => void }) {
  return (
    <li className="ct-slot">
      <article className="ct-card">
        <span className="ct-top">
          <Logo from={cert.from} className="ct-logo" />
          <span className="ct-round">r{String(index + 1).padStart(2, '0')}</span>
        </span>
        <h3 className="ct-title">{cert.title}</h3>
        <span className="ct-issuer">
          {cert.issuer}
          <span className="ct-date">{cert.date}</span>
        </span>
        <span className="ct-foot">
          <button type="button" className="ct-action ct-view" onClick={onView} aria-label={`View the ${cert.title} certificate`}>
            view
          </button>
          <a className="ct-action ct-verify" href={cert.href} target="_blank" rel="noreferrer" aria-label={`Verify ${cert.title} on the ${cert.issuer} site`}>
            verify
            <Arrow />
          </a>
        </span>
      </article>
    </li>
  )
}

/** Every certificate, oldest first: view the copy here, or verify it with the issuer. */
export default function Certificates() {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  return (
    <>
      <PageHead
        title={['the', 'certificates']}
        longTitle
        intro={`Courses from ${issuers.map((i) => ISSUERS[i.key].name.replace(' University', '')).join(', ').replace(/, ([^,]*)$/, ' and $1')}. View each one, or verify it with whoever issued it.`}
        panel={{
          eyebrow: 'earned',
          stats: [
            { label: 'certs', value: String(CERTS.length) },
            { label: 'issuers', value: String(issuers.length) },
            { label: 'since', value: firstYear },
          ],
        }}
      />
      <section className="certs" aria-labelledby="certs-title">
        <Chequer carry="light" className="chequer-certs" />
        <div className="certs-inner">
          <h2 id="certs-title" className="certs-title">
            <span className="split">oldest</span>
            <span className="title-last">
              <span className="split">first</span>
              <span className="title-stop">
                .
              </span>
            </span>
          </h2>

          <ul className="ct-issuers" aria-label="Issuers">
            {issuers.map((i) => (
              <li key={i.key}>
                <Logo from={i.key} className="ct-logo ct-logo-sm" />
                <span>
                  {ISSUERS[i.key].name}
                  <b>×{i.count}</b>
                </span>
              </li>
            ))}
          </ul>

          <ol className="ct-grid">
            {CERTS.map((c, i) => (
              <CertCard key={c.href} cert={c} index={i} onView={() => setOpen(i)} />
            ))}
          </ol>
        </div>
      </section>
      <Footer />
      {open !== null && <Viewer title="the certificates" subtitle="oldest first" slides={slides} start={open} onClose={close} />}
    </>
  )
}
