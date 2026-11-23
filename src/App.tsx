import { MotionConfig } from 'motion/react'
import LedBoard from './components/LedBoard'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import QuestLog from './components/QuestLog'
import { LINKS } from './data'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#projects">Skip to projects</a>
      <header className="top">
        <a href="#top" className="mark" aria-label="Hadi Haidar, back to top">HH</a>
        <nav aria-label="Sections">
          <a href="#projects">Projects</a>
          <a href="#achievements">Achievements</a>
          <a href="#quests">Quest log</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <h1 className="hero-name">Hadi Haidar</h1>
          <p className="hero-intro">
            Full-stack developer and MIS student at Kuwait University. I build web apps, games and the
            occasional gadget, and I teach statistics on the side. LinkedIn has the formal version; this is
            the fun one.
          </p>
          <LedBoard />
          <p className="hero-hint">Type a message and it scrolls. Click or drag on the board to draw; click a pixel again to erase it.</p>
        </section>

        <section id="projects" className="section">
          <div className="section-head">
            <h2>Things I’ve built</h2>
            <p>Open one to see what it does. The last one is playable.</p>
          </div>
          <Projects />
        </section>

        <section id="achievements" className="section">
          <div className="section-head">
            <h2>Achievements unlocked</h2>
            <p>Every course I’ve finished, in the order I finished them. Each one links to its certificate.</p>
          </div>
          <Achievements />
        </section>

        <section id="quests" className="section">
          <div className="section-head">
            <h2>Quest log</h2>
            <p>Where I study, teach and work.</p>
          </div>
          <QuestLog />
        </section>
      </main>

      <footer className="footer">
        <h2>Say hi</h2>
        <p>Open to on-site, hybrid and remote roles in Kuwait and beyond.</p>
        <div className="footer-links">
          <a className="btn btn-big" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn btn-big" href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p className="footer-small">Built with React and Motion. Deployed by GitHub Actions.</p>
      </footer>
    </MotionConfig>
  )
}
