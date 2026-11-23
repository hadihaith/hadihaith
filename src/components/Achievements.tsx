import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { CERTS, TROPHY } from '../data'
import PixelIcon from './PixelIcon'

const STAGGER = 0.28

export default function Achievements() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const reduce = useReducedMotion()
  const started = inView || Boolean(reduce)
  const [count, setCount] = useState(0)

  // Tick the counter in step with the badges unlocking.
  useEffect(() => {
    if (!started) return
    if (reduce) return setCount(CERTS.length)
    let n = 0
    const id = setInterval(() => {
      n += 1
      setCount(n)
      if (n >= CERTS.length) clearInterval(id)
    }, STAGGER * 1000)
    return () => clearInterval(id)
  }, [started, reduce])

  return (
    <div ref={ref}>
      <div className="progress" role="status">
        <span className="progress-label">
          {count} of {CERTS.length} unlocked
        </span>
        <span className="progress-bar" aria-hidden="true">
          {CERTS.map((c, i) => (
            <span key={c.title} className="progress-seg" style={{ background: i < count ? c.color : undefined }} />
          ))}
        </span>
      </div>
      <ol className="achievements">
        {CERTS.map((c, i) => {
          const unlocked = i < count
          return (
            <motion.li
              key={c.title}
              className={`achievement${unlocked ? ' is-unlocked' : ''}`}
              style={{ '--c': c.color } as React.CSSProperties}
              initial={false}
              animate={unlocked && !reduce ? { scale: [0.94, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <PixelIcon frames={[TROPHY]} color={c.color} off={!unlocked} size={52} />
              <div className="achievement-text">
                <span className="achievement-date">
                  {unlocked ? `Unlocked ${c.date}` : 'Locked'}
                </span>
                <h3 className="achievement-title">{c.title}</h3>
                <p className="achievement-issuer">{c.issuer}</p>
                <p className="achievement-note">{c.note}</p>
                <a className="achievement-link" href={c.href} target="_blank" rel="noreferrer">
                  Verify credential<span className="sr-only">: {c.title}</span>
                </a>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
