import { useEffect, useRef, useState } from 'react'
import { Rise, Split } from '../engine/Reveal'
import { CLEAR, FIGURE, READY, REVEAL, Spring, VEIL, WAITING } from '../engine/spring'
import { releaseEntrance, useEntered } from '../engine/hooks'
import { onScrollFrame, scrollToHash, subscribe } from '../engine/ticker'
import { Brackets, Chamfer } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import { CERTS, LINKS, PROJECTS } from '../data'
import Masthead from '../components/Masthead'
import { follow } from '../router'
import { backpack, swap } from '../pixels'
import { HeroScene, PARAMS, SUBJECT_BOTTOM, SUBJECT_TOP } from './heroScene'

/** Ask the workshop to put a project on its screen, then go there. */
export const openProject = (id: string) => {
  window.dispatchEvent(new CustomEvent('workshop:select', { detail: id }))
  scrollToHash('#workshop')
}

/* ---------- The loading veil ---------- */
// Trimmed from the template's 430 + 240: the veil should get out of the way fast.
const CLEAR_MS = 260
const PAUSE_MS = 100
const VEIL_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 102"><path d="M31 14a12 12 0 0 1 24 0h-6a6 6 0 0 0-12 0z"/><rect x="2" y="16" width="82" height="84" rx="16"/></svg>',
)}")`

function Veil({ ready }: { ready: boolean }) {
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const meter = useRef<HTMLDivElement>(null)
  const name = useRef<HTMLParagraphElement>(null)
  const progress = useRef<Spring | null>(null)
  const [label, setLabel] = useState('Loading Hadi Haidar')

  useEffect(() => {
    // The HTML ships an identical static veil so the first paint needs no JavaScript.
    document.getElementById('boot-veil')?.remove()
    progress.current = new Spring(0, WAITING, (v) => {
      if (fill.current) fill.current.style.transform = `scaleY(${v})`
      if (meter.current) meter.current.style.transform = `scaleX(${v})`
    })
    progress.current.to(0.7)
    const n = new Spring(0, { tension: 110, friction: 26 }, (v) => {
      if (!name.current) return
      name.current.style.opacity = String(v)
      name.current.style.transform = `translateY(${(1 - v) * 0.6}rem)`
    })
    n.to(1, 260)
    return () => {
      progress.current?.stop()
      n.stop()
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    setLabel('Loaded')
    progress.current?.to(1, 0, READY)
    const clear = new Spring(1, CLEAR, (v) => {
      if (!content.current) return
      content.current.style.opacity = String(v)
      content.current.style.transform = `translateY(${(1 - v) * -0.75}rem)`
    })
    clear.to(0, 0)
    // The spring's value is the opacity it writes, so it is also the rendered
    // opacity: read it there instead of forcing a style recalc every frame.
    let lifted = false
    const lift = new Spring(1, VEIL, (v) => {
      if (root.current) root.current.style.opacity = String(v)
      if (v <= 0.004 && !lifted) {
        lifted = true
        setGone(true)
      }
    })
    let backstop = 0
    const timer = setTimeout(() => {
      lift.to(0)
      releaseEntrance()
      backstop = window.setTimeout(() => setGone(true), 3000)
    }, CLEAR_MS + PAUSE_MS)
    return () => {
      clearTimeout(timer)
      clearTimeout(backstop)
    }
  }, [ready])

  if (gone) return null
  return (
    <div ref={root} className="veil" role="status" aria-label={label} style={{ pointerEvents: ready ? 'none' : 'auto' }}>
      <div ref={content} className="veil-content">
        <div className="veil-shape" style={{ maskImage: VEIL_MASK, WebkitMaskImage: VEIL_MASK }}>
          <div className="veil-shell" />
          <div ref={fill} className="veil-fill" />
        </div>
        <p ref={name} className="veil-name" style={{ opacity: 0 }}>
          hadi haidar
        </p>
      </div>
      <div className="veil-meter">
        <div ref={meter} className="veil-meter-fill" />
      </div>
    </div>
  )
}

/* ---------- The scene wrapper ---------- */
function Scene({ onReady, sectionRef, boxRef }: { onReady: () => void; sectionRef: React.RefObject<HTMLElement | null>; boxRef: React.RefObject<HTMLDivElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const entered = useEntered()
  const sceneRef = useRef<HTMLHeroScene | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let scene: HeroScene
    try {
      scene = new HeroScene(canvas.current!)
    } catch {
      setFailed(true)
      onReady()
      return
    }
    sceneRef.current = scene
    // A slow or stalled GPU must never hold the page hostage behind the veil.
    const backstop = window.setTimeout(onReady, 4000)
    scene.onReady = () => {
      clearTimeout(backstop)
      onReady()
    }
    scene.onError = () => {
      setFailed(true)
      onReady()
    }
    const container = canvas.current!.parentElement!
    let visible = !document.hidden
    let inView = true

    const applyFit = () => {
      const section = sectionRef.current
      const box = boxRef.current
      const h = container.clientHeight || 1
      let fit = { x: 0, y: PARAMS.subjectY, scale: PARAMS.subjectScale }
      if (section && box && box.offsetParent !== null) {
        const s = section.getBoundingClientRect()
        const b = box.getBoundingClientRect()
        const span = SUBJECT_TOP - SUBJECT_BOTTOM
        // Fit the box's height, but never wider than 86% of the screen (straps included).
        const byWidth = (0.86 * container.clientWidth * 2) / (1.02 * h)
        const scale = Math.min(((b.height / h) * 2 * 0.94) / span, 1.1, byWidth)
        const centre = 1 - ((b.top - s.top + b.height / 2) / h) * 2
        fit = { x: 0, y: centre - ((SUBJECT_TOP + SUBJECT_BOTTOM) / 2) * scale, scale }
      } else if (window.innerWidth / Math.max(1, window.innerHeight) < 1.6) {
        // Squarer than the frame: give back some size so the copy keeps its column.
        fit.scale = Math.max(0.85, (window.innerWidth / window.innerHeight) / 1.778)
      }
      scene.setFit(fit)
      scene.setParams({
        ...PARAMS,
        ...(window.matchMedia('(max-width: 1023px)').matches ? { bgRevealOpacity: 0 } : null),
      })
    }

    let lastWidth = 0
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const width = container.clientWidth
        const coarse = scene.tier.coarsePointer
        if (coarse && width === lastWidth) return
        lastWidth = width
        scene.retune()
        bindPointer()
        scene.resize(width, container.clientHeight)
        applyFit()
      })
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    const onMove = (e: PointerEvent) => scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    let bound = false
    const bindPointer = () => {
      if (scene.tier.pointerEnabled && !bound) {
        window.addEventListener('pointermove', onMove)
        bound = true
      } else if (!scene.tier.pointerEnabled && bound) {
        window.removeEventListener('pointermove', onMove)
        bound = false
      }
    }
    bindPointer()
    scene.resize(container.clientWidth, container.clientHeight)
    applyFit()

    // The loop exists only while it can be seen: in view, tab visible, not yet
    // scrolled under the next block (the hero is sticky, so the scroll is the
    // gate), and not a frozen scene that has already settled.
    let unsub: (() => void) | null = null
    const sync = () => {
      const want = visible && inView && window.scrollY <= window.innerHeight * 1.15 && !scene.isSettled
      if (want && !unsub)
        unsub = subscribe(
          (time) => {
            scene.update(time)
            if (scene.isSettled) sync()
          },
          () => scene.frameInterval(),
        )
      else if (!want && unsub) {
        unsub()
        unsub = null
      }
    }
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      sync()
    })
    io.observe(container)
    const onVis = () => {
      visible = !document.hidden
      sync()
    }
    document.addEventListener('visibilitychange', onVis)
    const offScroll = onScrollFrame(sync)
    sync()

    return () => {
      clearTimeout(backstop)
      unsub?.()
      offScroll()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onMove)
      scene.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (entered) sceneRef.current?.beginRise()
  }, [entered])

  return (
    <div className="hero-scene" aria-hidden="true">
      <canvas ref={canvas} />
      {failed && <div className="hero-fallback" />}
    </div>
  )
}
type HTMLHeroScene = HeroScene

/* ---------- The block ---------- */
export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const entered = useEntered()
  const firstVisit = useRef(!entered)

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true))
  }, [])

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
    <section ref={section} data-hero className="hero" id="top">
      <Scene onReady={() => setSceneReady(true)} sectionRef={section} boxRef={box} />
      <div className="hero-figure" aria-hidden="true">
        <div ref={box} className="hero-fit" />
      </div>
      <div className="hero-ramp" aria-hidden="true" />
      {firstVisit.current && <Veil ready={sceneReady && fontsReady} />}

      <div className="hero-column">
        <Masthead enabled={entered} />

        <div className="hero-middle">
          <div className="identity">
            <Rise className="identity-id" enabled={entered} delay={180} fadeOnly>
              @hadihaith
            </Rise>
            <Split as="h1" className="hero-name" text="hadi haidar" stagger={110} delay={180} enabled={entered} mode="once" />
            <ul className="identity-meta">
              {meta.map((m, i) => (
                <Rise as="li" key={m.label} enabled={entered} delay={180 + 260 + i * 130}>
                  {m.icon}
                  <span>{m.label}</span>
                </Rise>
              ))}
            </ul>
          </div>

          <Rise className="hero-panels" data-hero-panels="" enabled={entered} delay={900} y="1.25rem" config={REVEAL}>
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
                <PixelIcon frames={[backpack, swap(backpack, 'p', 'a')]} size="4.375rem" off="rgb(9 10 11 / 0.08)" className="next-race-map" />
              </div>
            </div>
            <div className="bracket-panel">
              <Brackets />
              <p className="eyebrow">career stats</p>
              <dl className="hero-stats" data-hero-stats="">
                {stats.map((s, i) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <Split as="dd" text={s.value} by="letters" stagger={26} config={FIGURE} delay={i * 90} enabled={entered} />
                  </div>
                ))}
              </dl>
            </div>
          </Rise>
        </div>

        <Rise className="hero-actions" enabled={entered} delay={1500} y="1.25rem">
          <a
            className="trailer"
            href="#workshop"
            onClick={(e) => {
              e.preventDefault()
              openProject('ttt')
            }}
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
          <Chamfer href="#workshop" label="view projects" w={220} cut={8} variant="solid" className="hero-cta" onClick={(e) => follow('#workshop', e)} />
          <ul className="socials">
            <li>
              <a href="#/gallery" onClick={(e) => follow('#/gallery', e)}>gallery</a>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noreferrer">github</a>
            </li>
          </ul>
        </Rise>
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
