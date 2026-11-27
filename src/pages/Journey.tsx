import { useEffect } from 'react'
import PageHead from '../components/PageHead'
import Portrait from '../components/Portrait'
import Timeline from '../sections/Timeline'
import Footer from '../sections/Footer'
import { Chequer, Contours } from '../components/Shared'
import { Rise, Split } from '../engine/Reveal'
import { ROW } from '../engine/spring'
import { SKILLS, TIMELINE } from '../data'
import { landed } from '../router'

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
          <Split text="what i" delay={0} />
          <span className="title-last">
            <Split text="bring" delay={130} />
            <Rise as="span" className="title-stop" delay={240} fadeOnly>
              .
            </Rise>
          </span>
        </h2>
        <div className="skills-groups">
          {groups.map((g, gi) => (
            <div key={g.name} className="skills-group">
              <Rise as="p" className="eyebrow skills-eyebrow" delay={200 + gi * 120}>
                {g.name}
              </Rise>
              <ul>
                {g.items.map((s, i) => (
                  <li key={s}>
                    <Split text={s} by="letters" stagger={16} config={ROW} gap="0" delay={260 + gi * 120 + i * 50} />
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
  useEffect(() => {
    document.title = 'Journey · Hadi Haidar'
    landed()
  }, [])
  return (
    <>
      <PageHead
        title={['the', 'journey']}
        figure={<Portrait delay={420} />}
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
