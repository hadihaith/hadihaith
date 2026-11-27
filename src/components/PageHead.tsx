import Masthead from './Masthead'
import { Brackets, Contours } from './Shared'

type Props = {
  title: [string, string]
  intro: string
  panel?: { eyebrow: string; stats: { label: string; value: string }[] }
  /** A long title word: let the title shrink further on phones so it never runs off screen. */
  longTitle?: boolean
  /** Shown between the title and the side column (the journey page's portrait). */
  figure?: React.ReactNode
}

/** The light opening block of the journey and gallery pages, in the hero's language. */
export default function PageHead({ title, intro, panel, longTitle, figure }: Props) {
  return (
    <section className="page-head" aria-labelledby="page-title">
      <Contours token="--surface-soft" />
      <div className="page-head-column">
        <Masthead />
        <div className={`page-head-middle${longTitle ? ' page-head-long' : ''}`}>
          <h1 id="page-title" className={`page-title${longTitle ? ' page-title-long' : ''}`}>
            <span className="split">{title[0]}</span>{' '}
            <span className="title-last">
              <span className="split">{title[1]}</span>
              <span className="title-stop">
                .
              </span>
            </span>
          </h1>
          {figure}
          <div className="page-head-side">
            <p className="page-intro">{intro}</p>
            {panel && (
              <div className="bracket-panel page-panel">
                <Brackets />
                <p className="eyebrow">{panel.eyebrow}</p>
                <dl className="hero-stats">
                  {panel.stats.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd className="split">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
      <span id="page-content" tabIndex={-1} />
    </section>
  )
}
