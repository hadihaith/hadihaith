import { Rise, Split } from '../engine/Reveal'
import { FIGURE, REVEAL } from '../engine/spring'
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
            <Split text={title[0]} delay={120} mode="once" enabled />
            <span className="title-last">
              <Split text={title[1]} delay={250} mode="once" enabled />
              <Rise as="span" className="title-stop" delay={360} fadeOnly enabled>
                .
              </Rise>
            </span>
          </h1>
          {figure}
          <Rise className="page-head-side" delay={520} y="1.25rem" config={REVEAL} enabled>
            <p className="page-intro">{intro}</p>
            {panel && (
              <div className="bracket-panel page-panel">
                <Brackets />
                <p className="eyebrow">{panel.eyebrow}</p>
                <dl className="hero-stats">
                  {panel.stats.map((s, i) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <Split as="dd" text={s.value} by="letters" stagger={26} config={FIGURE} delay={700 + i * 90} enabled />
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Rise>
        </div>
      </div>
      <span id="page-content" tabIndex={-1} />
    </section>
  )
}
