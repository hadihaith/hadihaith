import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PROJECTS } from '../data'
import PixelIcon from './PixelIcon'
import TicTacToe from './TicTacToe'

export default function Projects() {
  const [open, setOpen] = useState<string | null>(PROJECTS[0].id)

  return (
    <ul className="projects">
      {PROJECTS.map((p) => {
        const isOpen = open === p.id
        return (
          <li key={p.id} className={`project${isOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="project-head"
              aria-expanded={isOpen}
              aria-controls={`project-${p.id}`}
              onClick={() => setOpen(isOpen ? null : p.id)}
            >
              <PixelIcon frames={p.frames} size={72} playing={isOpen} />
              <span className="project-text">
                <span className="project-when">{p.when}</span>
                <span className="project-title">{p.title}</span>
                <span className="project-line">{p.oneLiner}</span>
              </span>
              <motion.span
                className="project-toggle"
                aria-hidden="true"
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`project-${p.id}`}
                  className="project-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="project-inner">
                    {p.details.map((d) => (
                      <p key={d}>{d}</p>
                    ))}
                    {p.playable && <TicTacToe />}
                    <div className="project-meta">
                      <ul className="chips" aria-label="Built with">
                        {p.stack.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      <div className="project-links">
                        {p.links.map((l) => (
                          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn">
                            {l.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}
