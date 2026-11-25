import { useEffect, useRef, useState } from 'react'
import { Rise, Split } from '../engine/Reveal'
import { COPY_FAST, FIGURE, NAME, easeOutQuad } from '../engine/spring'
import { useEnabled, useVisibleLoop } from '../engine/hooks'
import { CAP_30, reducedMotion } from '../engine/ticker'
import { Chamfer, Chequer, Contours, Parallax, BRACKET_PATH } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import TicTacToe from '../components/TicTacToe'
import { PROJECTS } from '../data'

const px = (v: number) => `${((v / 1440) * 100).toFixed(4)}cqw`

/** Four corner brackets around a box given as its four edges. */
function Frame({ left, right, top, bottom, delay, className = '' }: { left: string; right: string; top: string; bottom: string; delay: number; className?: string }) {
  const corners = [
    { x: left, y: top, r: 270 },
    { x: right, y: top, r: 0 },
    { x: right, y: bottom, r: 90 },
    { x: left, y: bottom, r: 180 },
  ]
  return (
    <Rise className={`ws-frame ${className}`} delay={delay} fadeOnly aria-hidden="true">
      {corners.map((c, i) => (
        <svg
          key={i}
          className="ws-bracket"
          viewBox="0 0 10.5 10.5"
          style={{ left: c.x, top: c.y, transform: `translate(${c.r === 270 || c.r === 180 ? '0' : '-100%'}, ${c.r === 90 || c.r === 180 ? '-100%' : '0'}) rotate(${c.r}deg)` }}
        >
          <path d={BRACKET_PATH} fill="none" stroke="currentColor" />
        </svg>
      ))}
    </Rise>
  )
}

const ICONS: Record<string, React.ReactNode> = {
  flag: <path d="M6 27V4M6 5h17l-4 6 4 6H6" fill="none" stroke="currentColor" strokeWidth="1.5" />,
  bars: <path d="M5 26V16M12 26V10M19 26V13M26 26V5" fill="none" stroke="currentColor" strokeWidth="2" />,
  trophy: <path d="M9 4h13v6a6.5 6.5 0 0 1-13 0zM9 6H4v2a5 5 0 0 0 5 5M22 6h5v2a5 5 0 0 1-5 5M15.5 17v5M10 27h11l-1-5h-9z" fill="none" stroke="currentColor" strokeWidth="1.5" />,
  gauge: <path d="M4 22a11.5 11.5 0 1 1 23 0M15.5 22l6-7M4 22h3M24 22h3M15.5 10.5v3" fill="none" stroke="currentColor" strokeWidth="1.5" />,
}

function Strip({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useEnabled(ref, 'once', '0% 0% -20% 0%')
  const pulse = useRef<SVGCircleElement>(null)
  const links = useRef<(HTMLSpanElement | null)[]>([])
  const [open, setOpen] = useState(false)
  const n = PROJECTS.length
  const pitch = 140
  const first = 720 - ((n - 1) * pitch) / 2
  const xs = PROJECTS.map((_, i) => first + i * pitch)

  const selectedRef = useRef(selected)
  selectedRef.current = selected
  // The live round pulses and the connectors crawl toward it, only while the strip is on screen.
  useVisibleLoop(
    ref,
    (now) => {
      const e = easeOutQuad((now % 3200) / 3200)
      pulse.current?.setAttribute('r', String(5.5 + e * 5.5 * 3.4))
      pulse.current?.setAttribute('opacity', String(0.5 * (1 - e) * (1 - e)))
      const v = (now % 5200) / 5200
      links.current.forEach((el, i) => {
        if (!el) return
        const dir = i < selectedRef.current ? 1 : -1
        el.style.backgroundPositionX = `calc(${px(11.45)} * ${(dir * v).toFixed(4)})`
      })
    },
    () => CAP_30,
    !reducedMotion,
  )

  return (
    <div ref={ref} className={`ws-strip${open ? ' is-open' : ''}`}>
      {xs.slice(0, -1).map((x, i) => (
        <Rise
          key={i}
          as="span"
          draw
          className="ws-link"
          enabled={seen}
          delay={560 + i * 90}
          style={{ left: `calc(50% + ${px(x + 22 - 720)})`, width: px(pitch - 44) }}
        >
          <span
            className="ws-link-dash"
            ref={(el) => {
              links.current[i] = el
            }}
          />
        </Rise>
      ))}
      {PROJECTS.map((p, i) => {
        const isLive = i === selected
        return (
          <Rise
            key={p.id}
            as="button"
            type="button"
            className={`ws-card${isLive ? ' is-live' : ''}`}
            enabled={seen}
            delay={560 + i * 90}
            y="0.5rem"
            style={{ left: `calc(50% + ${px(xs[i] - 720 - 60)})`, width: px(120) }}
            onClick={() => onSelect(i)}
            onPointerEnter={() => isLive && setOpen(true)}
            onPointerLeave={() => setOpen(false)}
            aria-pressed={isLive}
          >
            <span className="ws-round">build {String(i + 1).padStart(2, '0')}</span>
            <Split as="span" className="ws-name" text={p.short} enabled={seen} delay={560 + i * 90 + 110} config={NAME} />
            <span className="ws-date">{p.date}</span>
            <span className="ws-marker" aria-hidden="true">
              <svg viewBox="-11 -11 22 22">
                {isLive && <circle ref={pulse} r="5.5" fill="none" stroke="var(--accent)" vectorEffect="non-scaling-stroke" />}
                {isLive ? <circle r="5.5" fill="var(--accent)" /> : <circle r="5" fill="none" stroke="var(--foreground-on-dark)" />}
              </svg>
            </span>
          </Rise>
        )
      })}
      <Rise className="ws-live-frame" enabled={seen} delay={560 + n * 90} fadeOnly aria-hidden="true" style={{ left: `calc(50% + ${px(xs[selected] - 720 - 66)})`, width: px(132) }}>
        {[0, 90, 180, 270].map((r) => (
          <svg key={r} className={`ws-live-corner c${r}`} viewBox="0 0 10.5 10.5">
            <path d={BRACKET_PATH} fill="none" stroke="currentColor" />
          </svg>
        ))}
      </Rise>
    </div>
  )
}

export default function Workshop() {
  const [selected, setSelected] = useState(0)
  const project = PROJECTS[selected]

  useEffect(() => {
    const onSelect = (e: Event) => {
      const i = PROJECTS.findIndex((p) => p.id === (e as CustomEvent).detail)
      if (i >= 0) setSelected(i)
    }
    window.addEventListener('workshop:select', onSelect)
    return () => window.removeEventListener('workshop:select', onSelect)
  }, [])

  return (
    <section className="workshop" id="workshop" aria-labelledby="workshop-title">
      <Contours token="--paddock-contour" />
      <div className="ws-band" aria-hidden="true" />
      <Parallax from={0} to={-48} className="ws-figure-layer">
        <div className="ws-device" aria-label={`Screen showing ${project.title}`}>
          <div className="ws-device-screen">
            {project.playable ? (
              <TicTacToe />
            ) : (
              <PixelIcon key={project.id} frames={project.frames} size="100%" off="rgb(255 255 255 / 0.06)" label={project.title} />
            )}
          </div>
          <span className="ws-device-caption">{project.title}</span>
        </div>
      </Parallax>
      <div className="ws-melt" aria-hidden="true" />
      <Chequer carry="dark" className="chequer-workshop" />

      <h2 id="workshop-title" className="ws-title">
        <Split text="from the" delay={0} />
        <span className="title-last">
          <Split text="workshop" delay={130} />
          <Rise as="span" className="title-stop" delay={240} fadeOnly>
            .
          </Rise>
        </span>
      </h2>

      <div className="ws-intro">
        <Split key={project.id} as="p" className="ws-report" text={project.report} stagger={30} config={COPY_FAST} gap="0.22em" delay={project.id === PROJECTS[0].id ? 2 * 130 + 90 : 0} />
        <Rise delay={2 * 130 + 260}>
          <Chamfer href={project.links[0].href} label={project.links[0].label} w={217} cut={8} variant="solid" className="ws-cta" external />
        </Rise>
      </div>

      <div className="ws-panels">
        <Frame left="var(--fl)" right="var(--fr)" top="calc(var(--u) * 32)" bottom="calc(var(--u) * 105)" delay={320} />
        <Rise key={`meet-${project.id}`} className="ws-meet" delay={selected === 0 ? 410 : 0}>
          <strong>{project.title}</strong>
          <span>{project.stack.join(' · ')}</span>
          <span>{project.date}</span>
        </Rise>
        <Frame left="var(--fl)" right="var(--fr)" top="calc(var(--u) * 137)" bottom="calc(var(--u) * 535)" delay={460} />
        <div className="ws-stats" key={`stats-${project.id}`}>
          {project.stats.map((s, i) => (
            <div key={s.label} className="ws-stat-wrap">
              {i > 0 && <Rise className="ws-rule" draw delay={460 + i * 90} />}
              <Rise className="ws-stat" delay={460 + i * 90 + 40}>
                <svg className="ws-icon" viewBox="0 0 31 31" aria-hidden="true">
                  {ICONS[s.icon]}
                </svg>
                <div>
                  <p className="ws-label">{s.label}</p>
                  <Split as="p" className="ws-value" text={s.value} by="letters" stagger={24} config={FIGURE} delay={460 + i * 90 + 120} />
                </div>
              </Rise>
            </div>
          ))}
        </div>
      </div>

      <Strip selected={selected} onSelect={setSelected} />
    </section>
  )
}
