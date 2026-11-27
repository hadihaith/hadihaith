import { useEffect, useRef, useState } from 'react'
import { Rise, Split } from '../engine/Reveal'
import { FIGURE, REVEAL } from '../engine/spring'
import { useMedia } from '../engine/hooks'
import { onScrollFrame, subscribe } from '../engine/ticker'
import { Brackets, Chamfer } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import { CERTS, LINKS, PROJECTS } from '../data'
import Masthead from '../components/Masthead'
import { follow, url } from '../router'
import { backpack, swap } from '../pixels'

const backpackFrames = [backpack, swap(backpack, 'p', 'a')]
const PLAY_ANCHOR = '#project-ttt'

function Scene({ boxRef }: { boxRef: React.RefObject<HTMLDivElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    const el = canvas.current
    if (!el || reducedMotion || failed) return

    let cancelled = false
    let dispose = () => {}
    // Let the copy paint before starting GPU setup.
    const frame = requestAnimationFrame(() => {
      void import('./heroScene').then(({ HeroScene, PARAMS, SUBJECT_BOTTOM, SUBJECT_TOP }) => {
        if (cancelled) return
        const scene = new HeroScene(el)
        let stopped = false
        let inView = false
        let height = 0
        let unsub: (() => void) | null = null

        const onMove = (e: PointerEvent) => {
          scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
        }
        const sync = () => {
          const want = scene.ready && !stopped && !document.hidden && inView && window.scrollY < height
          if (want && !unsub) {
            unsub = subscribe((time) => scene.update(time), () => scene.frameInterval())
          } else if (!want && unsub) {
            unsub()
            unsub = null
          }
          if (want && scene.tier.pointerEnabled) window.addEventListener('pointermove', onMove, { passive: true })
          else window.removeEventListener('pointermove', onMove)
        }

        const fail = () => {
          stopped = true
          sync()
          scene.dispose()
          setFailed(true)
        }
        const onLost = () => fail()
        el.addEventListener('webglcontextlost', onLost)
        scene.onReady = () => {
          el.dataset.ready = ''
          scene.beginRise()
          sync()
        }
        scene.onError = fail

        const container = el.parentElement!
        const fit = () => {
          if (stopped) return
          const width = container.clientWidth
          height = container.clientHeight || 1
          const box = boxRef.current
          scene.retune()
          scene.resize(width, height)
          let y = PARAMS.subjectY
          let scale = PARAMS.subjectScale
          if (box?.offsetParent) {
            const span = SUBJECT_TOP - SUBJECT_BOTTOM
            const byWidth = (0.86 * box.clientWidth * 2) / (1.02 * height)
            scale = Math.min((box.clientHeight * 1.8) / (height * span), 1.1, byWidth)
            const top = box.offsetTop + box.parentElement!.offsetTop
            const centre = 1 - ((top + box.clientHeight / 2) / height) * 2
            y = centre - ((SUBJECT_TOP + SUBJECT_BOTTOM) / 2) * scale
          } else if (width / height < 1.6) {
            scale = Math.max(0.85, width / height / 1.778)
          }
          scene.setFit({ x: 0, y, scale })
          if (width <= 1279) scene.setParams({ ...PARAMS, bgRevealOpacity: 0, riseDistance: 12, subjectParallax: 0.008 })
          else scene.setParams(PARAMS)
          sync()
        }
        fit()
        const ro = new ResizeObserver(fit)
        ro.observe(container)
        if (boxRef.current) ro.observe(boxRef.current)
        const io = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting
          sync()
        })
        io.observe(container)
        const offScroll = onScrollFrame(sync)
        document.addEventListener('visibilitychange', sync)

        dispose = () => {
          stopped = true
          sync()
          offScroll()
          ro.disconnect()
          io.disconnect()
          document.removeEventListener('visibilitychange', sync)
          el.removeEventListener('webglcontextlost', onLost)
          scene.dispose()
          delete el.dataset.ready
        }
      }).catch(() => {
        if (!cancelled) setFailed(true)
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      dispose()
    }
  }, [boxRef, reducedMotion, failed])

  return (
    <div className="hero-scene" aria-hidden="true">
      <canvas ref={canvas} hidden={failed || reducedMotion} />
      {(failed || reducedMotion) && (
        <div className="hero-fallback"><PixelIcon frames={backpackFrames} size="100%" playing={false} off="rgb(9 10 11 / 0.08)" /></div>
      )}
    </div>
  )
}

/* ---------- The block ---------- */
export default function Hero() {
  const box = useRef<HTMLDivElement>(null)

  const current = PROJECTS.find((p) => p.id === 'pix')!
  const meta = [
    { icon: <span className="flag-kw" role="img" aria-label="Kuwait" />, label: 'kuwait' },
    { icon: <StarIcon />, label: 'kuwait university' },
    { icon: <CodeIcon />, label: 'full-stack engineer' },
  ]
  const stats = [
    { label: 'builds', value: String(PROJECTS.length) },
    { label: 'certs', value: String(CERTS.length) },
    { label: 'ai+x', value: '3rd' },
  ]

  return (
    <section data-hero className="hero" id="top">
      <Scene boxRef={box} />
      <div className="hero-ramp" aria-hidden="true" />

      <div className="hero-column">
        <Masthead />

        <div className="hero-middle">
          <div className="identity">
            <Rise className="identity-id" enabled delay={0} fadeOnly>
              @hadihaith
            </Rise>
            <h1 className="hero-name"><span>hadi</span>{' '}<span>haidar</span></h1>
            <ul className="identity-meta">
              {meta.map((m, i) => (
                <Rise as="li" key={m.label} enabled delay={90 + i * 45}>
                  {m.icon}
                  <span>{m.label}</span>
                </Rise>
              ))}
            </ul>
          </div>

          <Rise className="hero-panels" data-hero-panels="" enabled delay={120} y="1.25rem" config={REVEAL}>
            <div className="bracket-panel">
              <Brackets />
              <p className="eyebrow">current build</p>
              <div className="next-race">
                <dl>
                  <dt>{current.short}</dt>
                  <dd>android · kotlin</dd>
                  <dd>
                    <time dateTime="2026-11">in progress</time>
                  </dd>
                </dl>
                <PixelIcon frames={backpackFrames} size="4.375rem" off="rgb(9 10 11 / 0.08)" className="next-race-map" />
              </div>
            </div>
            <div className="bracket-panel">
              <Brackets />
              <p className="eyebrow">career stats</p>
              <dl className="hero-stats" data-hero-stats="">
                {stats.map((s, i) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <Split as="dd" text={s.value} by="letters" stagger={26} config={FIGURE} delay={i * 45} enabled />
                  </div>
                ))}
              </dl>
            </div>
          </Rise>
        </div>

        <div className="hero-figure" aria-hidden="true">
          <div ref={box} className="hero-fit" />
        </div>

        <div className="hero-actions">
          <a
            className="trailer"
            href={url(PLAY_ANCHOR)}
            onClick={(e) => follow(PLAY_ANCHOR, e, {
              onFound: (card) => card.dispatchEvent(new Event('project:highlight', { bubbles: true })),
            })}
          >
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="15.5" fill="none" stroke="currentColor" />
              <path d="M13 10.5v11l9-5.5z" fill="currentColor" />
            </svg>
            <span>
              <span className="trailer-title">play a round</span>
              <span className="trailer-time">tic-tac-toe</span>
            </span>
          </a>
          <Chamfer href={url('#workshop')} label="view projects" w={220} cut={8} variant="solid" className="hero-cta" onClick={(e) => follow('#workshop', e)} />
          <ul className="socials">
            <li>
              <a href={url('/gallery')} onClick={(e) => follow('/gallery', e)}>gallery</a>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noreferrer">github</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function StarIcon() {
  return (
    <svg className="meta-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0.5L9.6 6.4L15.5 8L9.6 9.6L8 15.5L6.4 9.6L0.5 8L6.4 6.4Z" fill="currentColor" />
    </svg>
  )
}
function CodeIcon() {
  return (
    <svg className="meta-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9.5 2.5l-3 11" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
