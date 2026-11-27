import PageHead from '../components/PageHead'
import Portrait from '../components/Portrait'
import Timeline from '../sections/Timeline'
import Footer from '../sections/Footer'
import { Chequer, Contours } from '../components/Shared'
import { SKILLS, TIMELINE } from '../data'

function Skills() {
  const groups = [
    { name: 'skills', items: SKILLS.skills },
    { name: 'tools', items: SKILLS.tools },
  ]
  return (
    <section className="skills" aria-labelledby="skills-title">
      <Contours token="--paddock-contour" />
      <Chequer carry="dark" className="chequer-skills" />
      <div className="skills-inner">
        <h2 id="skills-title" className="skills-title">
          <span className="split">what i</span>
          <span className="title-last">
            <span className="split">bring</span>
            <span className="title-stop">
              .
            </span>
          </span>
        </h2>
        <div className="skills-groups">
          {groups.map((g) => (
            <div key={g.name} className="skills-group">
              <p className="eyebrow skills-eyebrow">
                {g.name}
              </p>
              <ul>
                {g.items.map((s) => (
                  <li key={s}>
                    <span className="split">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** The life path, on its own page: Kuwait University to France, then the skills. */
export default function Journey() {
  return (
    <>
      <PageHead
        title={['the', 'journey']}
        figure={<Portrait />}
        intro="Kuwait University, teaching, research, a third place in the gulf and a semester in France. Scroll down the path."
        panel={{
          eyebrow: 'so far',
          stats: [
            { label: 'since', value: '2023' },
            { label: 'roles', value: '3' },
            { label: 'ai+x', value: '3rd' },
          ],
        }}
      />
      <Timeline entries={TIMELINE} heading={['from day one', 'to full-stack']} />
      <Skills />
      <Footer />
    </>
  )
}
