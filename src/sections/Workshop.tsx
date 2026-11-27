import { useLayoutEffect, useState } from 'react'
import { Rise, Split } from '../engine/Reveal'
import { Arrow, Brackets, Chamfer, Chequer, Contours } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import TicTacToe from '../components/TicTacToe'
import { PROJECTS, type Project } from '../data'

/** The opening build and the playable one get a double-width card. */
const isWide = (p: Project) => p.id === PROJECTS[0].id

function ProjectCard({ project, index, flash }: { project: Project; index: number; flash: boolean }) {
  const [primary, ...rest] = project.links
  return (
    <Rise
      as="li"
      id={`project-${project.id}`}
      className={`pc-slot${isWide(project) ? ' pc-wide' : ''}${project.playable ? ' pc-play' : ''}`}
      delay={(index % 3) * 90}
      y="1.5rem"
      mode="once"
    >
      <article className={`pc${flash ? ' is-flash' : ''}`} aria-labelledby={`project-${project.id}-title`}>
        <Brackets className="pc-brackets" />
        <div className="pc-screen">
          {project.playable ? (
            <TicTacToe />
          ) : (
            <PixelIcon frames={project.frames} size="100%" off="rgb(255 255 255 / 0.06)" label={`Pixel art for ${project.title}`} />
          )}
        </div>
        <div className="pc-body">
          <p className="pc-meta">
            <span>build {String(index + 1).padStart(2, '0')}</span>
            <span>{project.date}</span>
          </p>
          <h3 id={`project-${project.id}-title`} className="pc-title">
            {project.title}
          </h3>
          <p className="pc-report">{project.report}</p>
          <ul className="pc-stack" aria-label="Built with">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <dl className="pc-stats">
            {project.stats.map((s) => (
              <div key={s.label} className="pc-stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className="pc-links">
            <Chamfer href={primary.href} label={primary.label} w={220} cut={8} variant="solid" className="pc-cta" external />
            {rest.map((l) => (
              <a key={l.href} className="pc-link" href={l.href} target="_blank" rel="noreferrer">
                {l.label}
                <Arrow />
              </a>
            ))}
          </div>
        </div>
      </article>
    </Rise>
  )
}

export default function Workshop() {
  const [flash, setFlash] = useState<string | null>(null)

  // "Play a round" in the hero points here: light up the card it lands on.
  useLayoutEffect(() => {
    let timer = 0
    const onSelect = (e: Event) => {
      const card = e.target as HTMLElement
      setFlash(card.id)
      clearTimeout(timer)
      timer = window.setTimeout(() => setFlash(null), 1800)
    }
    window.addEventListener('project:highlight', onSelect)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('project:highlight', onSelect)
    }
  }, [])

  return (
    <section className="workshop" id="workshop" aria-labelledby="workshop-title">
      <Contours token="--paddock-contour" />
      <Chequer carry="dark" className="chequer-workshop" />

      <div className="ws-head">
        <h2 id="workshop-title" className="ws-title">
          <Split text="from the" delay={0} />
          <span className="title-last">
            <Split text="workshop" delay={130} />
            <Rise as="span" className="title-stop" delay={240} fadeOnly>
              .
            </Rise>
          </span>
        </h2>
        <Rise as="p" className="ws-lede" delay={360}>
          {PROJECTS.length} builds, from a NASA hackathon to a backpack that lights up. The last one is playable.
        </Rise>
      </div>

      <ul className="ws-grid">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} flash={flash === `project-${p.id}`} />
        ))}
      </ul>
    </section>
  )
}
