import { Arrow, Brackets, Chamfer, Chequer, Contours } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import TicTacToe from '../components/TicTacToe'
import { PROJECTS, type Project } from '../data'

/** The opening build and the playable one get a double-width card. */
const isWide = (p: Project) => p.id === PROJECTS[0].id

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [primary, ...rest] = project.links
  return (
    <li
      id={`project-${project.id}`}
      className={`pc-slot${isWide(project) ? ' pc-wide' : ''}${project.playable ? ' pc-play' : ''}`}
    >
      <article className="pc" aria-labelledby={`project-${project.id}-title`}>
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
    </li>
  )
}

export default function Workshop() {
  return (
    <section className="workshop" id="workshop" aria-labelledby="workshop-title">
      <Contours token="--paddock-contour" />
      <Chequer carry="dark" className="chequer-workshop" />

      <div className="ws-head">
        <h2 id="workshop-title" className="ws-title">
          <span className="split">from the</span>
          <span className="title-last">
            <span className="split">workshop</span>
            <span className="title-stop">
              .
            </span>
          </span>
        </h2>
        <p className="ws-lede">
          {PROJECTS.length} builds, from a NASA hackathon to a backpack that lights up. The last one is playable.
        </p>
      </div>

      <ul className="ws-grid">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </ul>
    </section>
  )
}
